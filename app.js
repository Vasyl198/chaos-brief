const $ = (s) => document.querySelector(s);
const input = $('#brief');
const draftKey = 'chaos-brief-draft';
const evidenceKey = 'chaos-brief-evidence-owners';
const safeStorage = {
  get(key){ try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value){ try { localStorage.setItem(key, value); return true; } catch { return false; } },
  remove(key){ try { localStorage.removeItem(key); return true; } catch { return false; } }
};
const sample = `Launch a booking page for a small bakery next week. It must accept pre-orders, show availability, and be simple for the owner to update from a phone.`;
const examples = {
  bakery: sample,
  support: 'Launch a support handoff for a small team this week. Customers need a clear contact form, the team needs ownership rules, and urgent issues must be escalated.',
  product: 'Release a customer dashboard next week with payments, booking, delivery, and a way for the team to update a price from a phone.'
};
const branchData = [
  ['◎','Ordinary path','The request is complete and the owner can review a first version quickly.'],
  ['↗','Competent-user path','The owner already has a menu, photos, and clear order rules.'],
  ['?','Bad-data path','Availability, prices, or contact details are missing or contradictory.'],
  ['↻','Changing conditions','The menu, deadlines, or delivery radius changes after work starts.'],
  ['⌁','Workaround path','A low-code form or manual confirmation is enough for the first week.'],
  ['≋','Mature-alternative check','An existing booking tool solves the core need more cheaply.']
];
function count(){ $('#counter').textContent = `${input.value.length} / 800`; }
function saveDraft(){
  const value = input.value.trim();
  if(value){ const saved=safeStorage.set(draftKey, input.value); $('#draft-status').textContent=saved ? 'Saved locally' : 'Storage unavailable — this draft stays only on this page'; $('#clear-draft').hidden=false; }
  else { safeStorage.remove(draftKey); $('#draft-status').textContent=''; $('#clear-draft').hidden=true; }
}
function title(text){ const words=text.replace(/[^\w\s-]/g,'').trim().split(/\s+/).slice(0,7); return words.length ? words.map(w=>w[0].toUpperCase()+w.slice(1)).join(' ') : 'Decision brief'; }
function getNouns(text){ const found=text.toLowerCase().match(/\b(?:booking|orders?|availability|menu|website|page|launch|client|product|payment|delivery|team|app|campaign|service)\b/g) || []; return [...new Set(found)].slice(0,3).join(', ') || 'the requested outcome'; }
const topicRules = [
  { match: /\b(?:pay(?:ment|ments)?|checkout|invoice|card|stripe|refund)\b|оплат\w*|плат[еі]ж\w*/i, label: 'payment', criterion: 'A customer can complete a payment and receives an unambiguous confirmation.', evidence: 'Which payment method, currency, and refund rule are required for the first release.', trigger: 'The chosen payment provider cannot support the required country, currency, or refund flow.' },
  { match: /\b(?:order|pre-?order|booking|reservation|appointment)\b|заказ\w*|замовлен\w*|запис\w*|броню\w*/i, label: 'orders or bookings', criterion: 'A customer can place one valid order or booking and the owner can see it immediately.', evidence: 'The exact order or booking rules: cutoff time, confirmation, cancellation, and exceptions.', trigger: 'Order volume or exception handling exceeds the agreed manual workflow.' },
  { match: /\b(?:deliver|delivery|shipping|pickup|courier)\b|достав\w*|самовив\w*|самовывоз\w*/i, label: 'fulfilment', criterion: 'The customer sees a valid fulfilment option before committing.', evidence: 'Delivery area, pickup rules, lead time, and the owner of fulfilment updates.', trigger: 'Delivery coverage, pricing, or lead time changes after the flow is approved.' },
  { match: /\b(?:menu|price|availability|inventory|stock|catalog)\b|цен\w*|цін\w*|наявност\w*|наявніст\w*|меню/i, label: 'volatile information', criterion: 'The owner can update the volatile information from a phone in under five minutes.', evidence: 'Who owns updates and the source of truth for prices, availability, or stock.', trigger: 'The source of truth becomes unavailable or differs from what the customer sees.' },
  { match: /\b(?:website|page|landing|app|product|dashboard|form)\b|сайт\w*|стран[иі]ц\w*|сторінк\w*|форм\w*|панел\w*/i, label: 'the user flow', criterion: 'A first-time user can complete the primary flow without help.', evidence: 'The primary user, their first task, and the device they use most often.', trigger: 'User testing shows that the primary flow cannot be completed without guidance.' }
];
function analyzeRequest(raw){
  const matched = topicRules.filter(rule => rule.match.test(raw));
  const unique = (key, fallback) => [...new Set(matched.map(rule => rule[key]))].slice(0, 3).concat(fallback).slice(0, 3);
  const deadline = raw.match(/\b(?:today|tomorrow|this week|next week|\d+\s*(?:day|days|week|weeks))\b/i);
  const needsStaging = matched.length >= 3;
  return {
    matchedRules: matched,
    focus: matched.map(rule => rule.label).slice(0, 3).join(', ') || getNouns(raw),
    criteria: unique('criterion', 'Success and failure states are visible, named, and testable.'),
    evidence: unique('evidence', needsStaging ? 'Which single end-to-end flow is in the first release, and what is deliberately deferred.' : deadline ? `Whether the stated deadline (${deadline[0]}) allows a review and correction cycle.` : 'The real deadline and when a first version can be reviewed.'),
    triggers: unique('trigger', 'A new request changes the agreed user outcome.'),
    gaps: Math.min(5, Math.max(2, matched.length + (deadline ? 1 : 2))),
    needsStaging,
    firstRelease: needsStaging
      ? [`Choose one flow to validate first: ${matched.map(rule => rule.label).slice(0, 3).join(', ')}.`, 'Write down the other requested concerns as deliberately deferred work.', 'Test the chosen flow with one real user before adding the next concern.']
      : ['Name one primary user and one task they must finish.', 'Build the smallest version that makes the acceptance criteria testable.', 'Review the evidence gaps and decide what must change before expanding scope.']
  };
}
function list(items){ return items.map(x=>`<li>${x}</li>`).join(''); }
function getEvidenceStore(){ try { return JSON.parse(safeStorage.get(evidenceKey)) || {}; } catch { return {}; } }
function setEvidenceStore(store){ safeStorage.set(evidenceKey, JSON.stringify(store)); }
function briefId(brief){ let hash=2166136261; for(let i=0;i<brief.length;i++){ hash^=brief.charCodeAt(i); hash=Math.imul(hash,16777619); } return (hash>>>0).toString(36); }
function renderEvidence(items, brief){
  const store = getEvidenceStore();
  const prefix = briefId(brief);
  $('#evidence').innerHTML = items.map((text, index) => `<div class="evidence-item" data-evidence-row="${index}"><span class="evidence-text" data-evidence-text>${text}</span><div class="evidence-controls"><input data-evidence-owner placeholder="Owner or role" aria-label="Owner for evidence ${index + 1}"><input data-evidence-due type="date" aria-label="Due date for evidence ${index + 1}"><label><input data-evidence-done type="checkbox"> verified</label></div></div>`).join('');
  [...document.querySelectorAll('[data-evidence-row]')].forEach(row => {
    const id = `${prefix}:${row.dataset.evidenceRow}`;
    const saved = store[id] || {};
    const owner = row.querySelector('[data-evidence-owner]');
    const due = row.querySelector('[data-evidence-due]');
    const done = row.querySelector('[data-evidence-done]');
    owner.value = saved.owner || ''; due.value = saved.due || ''; done.checked = Boolean(saved.done);
    const save = () => { store[id] = { owner: owner.value.trim(), due: due.value, done: done.checked }; setEvidenceStore(store); updateEvidenceProgress(); };
    owner.addEventListener('input', save); due.addEventListener('change', save); done.addEventListener('change', save);
  });
  updateEvidenceProgress();
}
function updateEvidenceProgress(){
  const rows = [...document.querySelectorAll('[data-evidence-row]')];
  const ready = rows.filter(row => row.querySelector('[data-evidence-owner]').value.trim() && row.querySelector('[data-evidence-due]').value).length;
  const signal = $('#ownership-signal'); if(signal) signal.innerHTML = `Evidence owned: <b>${ready}/${rows.length}</b>`;
}
function assumptionsFor(analysis){
  const knownFocus = analysis.focus === 'the requested outcome' ? 'the requested outcome' : analysis.focus;
  return [
    `The facts needed for ${knownFocus} are current and available to the owner.`,
    'A real user can be found to review the first end-to-end flow.',
    analysis.needsStaging ? 'The deferred concerns can safely remain manual while the first flow is tested.' : 'The scope can stay small until the acceptance criteria are proven.'
  ];
}
function render(){ const raw=input.value.trim(); if(!raw){input.focus();return;} const analysis=analyzeRequest(raw); $('#empty').hidden=true; $('#results').hidden=false; $('#brief-title').textContent=title(raw); $('#next-decision').textContent=analysis.needsStaging ? 'Choose one end-to-end flow for the first release.' : 'Confirm the smallest outcome that must be true next.'; $('#decision-detail').textContent=analysis.needsStaging ? `This request combines ${analysis.focus}. Treating all of it as one release creates an untestable scope: select one flow, name what is deferred, then validate it before adding the next concern.` : `Before selecting a solution, agree what “working” means for ${analysis.focus}: who uses it, what they can complete, and what proof counts.`;
  $('#signals').innerHTML=[`Scope: <b>${analysis.needsStaging ? 'staged release needed' : 'unconfirmed'}</b>`,`Evidence gaps: <b>${analysis.gaps}</b>`,'Branches: <b>6 checked</b>','Plan state: <b>draft</b>','<span id="ownership-signal"></span>'].map(x=>`<span class="signal">${x}</span>`).join('');
  $('#criteria').innerHTML=list(analysis.criteria);
  renderEvidence(analysis.evidence, raw);
  $('#triggers').innerHTML=list(analysis.triggers);
  $('#assumptions').innerHTML=list(assumptionsFor(analysis));
  $('#first-release').innerHTML=list(analysis.firstRelease);
  renderFlowPicker(analysis, raw);
  const scenarioDetails = [
    `A first version for ${analysis.focus} is reviewed against the criteria before it expands.`,
    'The owner already has the required content, rules, and decision authority, so the first review can happen quickly.',
    `Required facts for ${analysis.focus} are missing or contradictory; stop implementation and resolve the evidence gap first.`,
    'A deadline, rule, source of truth, or delivery condition changes after approval; reopen the plan rather than patching silently.',
    analysis.needsStaging ? 'Use a smaller manual flow for the deferred concerns while validating one end-to-end flow.' : 'Use a manual or low-code flow if it meets the same acceptance criteria for the first review.',
    `Compare an existing tool against the criteria for ${analysis.focus}; choose it if it meets the need more cheaply.`
  ];
  branchData.forEach((branch,index)=>{branch[2]=scenarioDetails[index];});
  const holder=$('#branches'); holder.innerHTML=''; branchData.forEach((b,i)=>{const node=$('#branch-template').content.cloneNode(true);const button=node.querySelector('button');button.querySelector('.branch-icon').textContent=b[0];button.querySelector('.branch-name').textContent=b[1];button.querySelector('small').textContent=b[2];button.addEventListener('click',()=>{holder.querySelectorAll('.branch').forEach(x=>x.classList.remove('active'));button.classList.add('active');const decision=$('#next-decision').textContent;$('#decision-detail').textContent=`${b[2]} This is a stress test for the current decision: ${decision} Decide whether this path needs prevention, an explicit assumption, or a cheaper fallback before committing more work.`;});if(i===0)button.classList.add('active');holder.append(node);});
  $('#results').scrollIntoView({behavior:'smooth',block:'start'});
}
function renderStagedFlow(analysis, raw, selectedIndex){
  const selected = analysis.matchedRules[selectedIndex];
  const deferred = analysis.matchedRules.filter((_, index) => index !== selectedIndex).map(rule => rule.label);
  $('#next-decision').textContent=`Validate one ${selected.label} flow before expanding.`;
  $('#decision-detail').textContent=`The first release proves ${selected.label}, while ${deferred.join(', ')} remain explicitly manual or deferred. This turns a large request into one testable decision.`;
  $('#criteria').innerHTML=list([selected.criterion, 'The user can see what remains manual or deferred before committing.', 'One real user completes the selected flow without guidance.']);
  renderEvidence([selected.evidence, `Who approves the boundary between ${selected.label} and the deferred concerns.`, 'When one real user can review the selected flow.'], `${raw}:${selected.label}`);
  $('#triggers').innerHTML=list([selected.trigger, `A deferred concern (${deferred.join(', ')}) becomes necessary for the selected flow.`]);
  $('#assumptions').innerHTML=list([`The facts needed for ${selected.label} are current and available to the owner.`, 'A real user can review the selected flow before the next concern is added.', 'Deferred concerns can safely remain manual during the first review.']);
  $('#first-release').innerHTML=list([`Build one testable ${selected.label} flow: ${selected.criterion}`, `Keep ${deferred.join(', ')} manual or deferred, and make that boundary visible.`, 'Review the selected flow with one real user before expanding scope.']);
}
function renderFlowPicker(analysis, raw){
  const picker = $('#flow-picker');
  if(!analysis.needsStaging){ picker.hidden=true; return; }
  picker.hidden=false;
  picker.innerHTML='<p>Choose the first flow to validate</p><div class="flow-options"></div>';
  const options=picker.querySelector('.flow-options');
  analysis.matchedRules.forEach((rule,index)=>{
    const button=document.createElement('button');
    button.type='button';
    button.textContent=rule.label;
    button.classList.toggle('active',index===0);
    button.addEventListener('click',()=>{
      options.querySelectorAll('button').forEach(x=>x.classList.remove('active'));
      button.classList.add('active');
      renderStagedFlow(analysis,raw,index);
    });
    options.append(button);
  });
  renderStagedFlow(analysis,raw,0);
}
async function copyText(text){
  try { if(navigator.clipboard?.writeText){ await navigator.clipboard.writeText(text); return true; } } catch {}
  try {
    const fallback=document.createElement('textarea');
    fallback.value=text; fallback.style.position='fixed'; fallback.style.opacity='0';
    document.body.append(fallback); fallback.select(); const copied=document.execCommand('copy'); fallback.remove();
    return copied;
  } catch { return false; }
}
$('#sample').addEventListener('click',()=>{input.value=sample;count();input.focus();});
document.querySelectorAll('[data-example]').forEach(button=>button.addEventListener('click',()=>{input.value=examples[button.dataset.example];count();saveDraft();render();}));
input.addEventListener('input',()=>{count();saveDraft();});
input.addEventListener('keydown',(event)=>{if((event.ctrlKey || event.metaKey) && event.key==='Enter'){event.preventDefault();render();}});
$('#clear-draft').addEventListener('click',()=>{input.value='';saveDraft();count();input.focus();});
$('#analyze').addEventListener('click',render);
$('#copy').addEventListener('click',async()=>{const branches=[...document.querySelectorAll('#branches .branch')].map(button=>`- ${button.querySelector('.branch-name').textContent}: ${button.querySelector('small').textContent}`).join('\n');const evidence=[...document.querySelectorAll('[data-evidence-row]')].map(row=>{const text=row.querySelector('[data-evidence-text]').textContent;const owner=row.querySelector('[data-evidence-owner]').value.trim() || 'unassigned';const due=row.querySelector('[data-evidence-due]').value || 'no due date';const status=row.querySelector('[data-evidence-done]').checked ? 'verified' : 'open';return `- [${status}] ${text} — owner: ${owner}; due: ${due}`;}).join('\n');const md=`# ${$('#brief-title').textContent}\n\n## Next decision\n${$('#next-decision').textContent}\n\n${$('#decision-detail').textContent}\n\n## Assumptions to validate\n${[...document.querySelectorAll('#assumptions li')].map(x=>'- '+x.textContent).join('\n')}\n\n## Acceptance criteria\n${[...document.querySelectorAll('#criteria li')].map(x=>'- '+x.textContent).join('\n')}\n\n## Evidence to get first\n${evidence}\n\n## Reopen the plan when\n${[...document.querySelectorAll('#triggers li')].map(x=>'- '+x.textContent).join('\n')}\n\n## First release plan\n${[...document.querySelectorAll('#first-release li')].map(x=>'- '+x.textContent).join('\n')}\n\n## Scenario paths checked\n${branches}`; const copied=await copyText(md); $('#copy').textContent=copied ? 'Copied' : 'Copy unavailable'; setTimeout(()=>$('#copy').textContent='Copy as Markdown',1300);});
count();
const savedDraft = safeStorage.get(draftKey);
if(savedDraft){ input.value=savedDraft; count(); $('#draft-status').textContent='Saved draft restored'; $('#clear-draft').hidden=false; }
