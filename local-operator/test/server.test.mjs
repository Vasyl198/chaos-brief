import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAnalysisText, createLocalOperatorServer } from '../server.mjs';

const fakeBrief = { title:'Warehouse decision',summary:'Specific summary',next_decision:'Measure demand',recommendation:'Run a reversible test',confidence:'medium',assumptions:['Demand exists'],questions:['Required area?','Maximum budget?'],scenarios:Array.from({length:6},(_,index)=>({lens:`Lens ${index+1}`,outcome:'Outcome',risk:'Risk',next_step:'Step'})),evidence:{confirmed_facts:[],user_statements:['A warehouse is being considered'],inferences:['Demand may exist'],verification_needed:['Measure demand']},change_summary:{mode:'initial',changed:[],unchanged:[],reason:'Initial brief'},review_triggers:['Demand is lower than expected'],smallest_test:{action:'Interview five users',success_signal:'Three confirm demand',review_date_suggestion:'In seven days'},limitations:['No verified demand data'] };

test('requires a local session token and returns structured analysis', async()=>{
  const server=createLocalOperatorServer({analyze:async(text)=>({brief:{...fakeBrief,summary:text},threadId:'thread_test',turnId:'turn_test'})});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve)); const base=`http://127.0.0.1:${server.address().port}`;
  try{
    const session=await (await fetch(`${base}/api/session`)).json();
    const denied=await fetch(`${base}/api/analyze`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({request:'rent a warehouse'})}); assert.equal(denied.status,403);
    const accepted=await fetch(`${base}/api/analyze`,{method:'POST',headers:{'content-type':'application/json','x-operator-token':session.token},body:JSON.stringify({request:'rent a warehouse'})}); const body=await accepted.json();
    assert.equal(accepted.status,200); assert.match(body.brief.summary,/WORKFLOW MODE: INITIAL/); assert.match(body.brief.summary,/rent a warehouse/); assert.equal(body.brief.scenarios.length,6);
  }finally{await new Promise(resolve=>server.close(resolve));}
});

test('builds bounded clarification and revision packets with the previous brief', () => {
  const clarified = buildAnalysisText({ request: 'Rent a warehouse', workflow: 'clarify', previousBrief: fakeBrief, answers: ['200 square metres', 'EUR 2,000 monthly'] });
  assert.match(clarified, /WORKFLOW MODE: CLARIFY/);
  assert.match(clarified, /PREVIOUS STRUCTURED BRIEF/);
  assert.match(clarified, /200 square metres/);

  const revised = buildAnalysisText({ request: 'Rent a warehouse', workflow: 'revise', previousBrief: fakeBrief, changeType: 'budget', changeText: 'Budget fell to EUR 1,200 monthly.' });
  assert.match(revised, /WORKFLOW MODE: REVISE/);
  assert.match(revised, /CHANGED CONDITION TYPE: budget/);
  assert.match(revised, /Budget fell/);
  assert.throws(() => buildAnalysisText({ request: 'x', workflow: 'revise', previousBrief: fakeBrief, changeType: 'unknown', changeText: 'changed' }), /not supported/);
  assert.throws(() => buildAnalysisText({ request: 'x', workflow: 'clarify', previousBrief: fakeBrief, answers: [] }), /At least one/);
});

test('rejects cross-origin requests even with a valid token',async()=>{
  const server=createLocalOperatorServer({analyze:async()=>({brief:fakeBrief})}); await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve)); const base=`http://127.0.0.1:${server.address().port}`;
  try{const session=await (await fetch(`${base}/api/session`)).json(); const response=await fetch(`${base}/api/analyze`,{method:'POST',headers:{'content-type':'application/json','x-operator-token':session.token,origin:'https://evil.example'},body:JSON.stringify({request:'test'})}); assert.equal(response.status,403);}
  finally{await new Promise(resolve=>server.close(resolve));}
});

test('public bridge requires local enablement and allows only the exact GitHub Pages origin', async () => {
  const server = createLocalOperatorServer({ analyze: async (text) => ({ brief: { ...fakeBrief, summary: text } }) });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const publicOrigin = 'https://vasyl198.github.io';
  try {
    const localSession = await (await fetch(`${base}/api/session`)).json();
    const locked = await fetch(`${base}/api/session`, { headers: { origin: publicOrigin } });
    assert.equal(locked.status, 403);

    const foreignEnable = await fetch(`${base}/api/bridge/enable`, {
      method: 'POST',
      headers: { origin: 'https://evil.example', 'x-operator-token': localSession.token }
    });
    assert.equal(foreignEnable.status, 403);

    const enabled = await fetch(`${base}/api/bridge/enable`, {
      method: 'POST',
      headers: { origin: base, 'x-operator-token': localSession.token }
    });
    assert.equal(enabled.status, 200);

    const preflight = await fetch(`${base}/api/analyze`, {
      method: 'OPTIONS',
      headers: {
        origin: publicOrigin,
        'access-control-request-method': 'POST',
        'access-control-request-headers': 'content-type, x-operator-token',
        'access-control-request-private-network': 'true'
      }
    });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get('access-control-allow-origin'), publicOrigin);
    assert.equal(preflight.headers.get('access-control-allow-private-network'), 'true');

    const publicSessionResponse = await fetch(`${base}/api/session`, { headers: { origin: publicOrigin } });
    assert.equal(publicSessionResponse.status, 200);
    assert.equal(publicSessionResponse.headers.get('access-control-allow-origin'), publicOrigin);
    const publicSession = await publicSessionResponse.json();

    const analyzed = await fetch(`${base}/api/analyze`, {
      method: 'POST',
      headers: { origin: publicOrigin, 'content-type': 'application/json', 'x-operator-token': publicSession.token },
      body: JSON.stringify({ request: 'compare a flower kiosk with delivery-only sales' })
    });
    assert.equal(analyzed.status, 200);
    assert.equal((await analyzed.json()).brief.scenarios.length, 6);

    const evil = await fetch(`${base}/api/session`, { headers: { origin: 'https://evil.example' } });
    assert.equal(evil.status, 403);
    assert.equal(evil.headers.get('access-control-allow-origin'), null);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
