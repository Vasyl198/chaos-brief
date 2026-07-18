const $ = (s) => document.querySelector(s);
const input = $('#brief');
const draftKey = 'chaos-brief-draft';
const sample = `Launch a booking page for a small bakery next week. It must accept pre-orders, show availability, and be simple for the owner to update from a phone.`;
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
  if(value){ localStorage.setItem(draftKey, input.value); $('#draft-status').textContent='Saved locally'; $('#clear-draft').hidden=false; }
  else { localStorage.removeItem(draftKey); $('#draft-status').textContent=''; $('#clear-draft').hidden=true; }
}
function title(text){ const words=text.replace(/[^\w\s-]/g,'').trim().split(/\s+/).slice(0,7); return words.length ? words.map(w=>w[0].toUpperCase()+w.slice(1)).join(' ') : 'Decision brief'; }
function getNouns(text){ const found=text.toLowerCase().match(/\b(?:booking|orders?|availability|menu|website|page|launch|client|product|payment|delivery|team|app|campaign|service)\b/g) || []; return [...new Set(found)].slice(0,3).join(', ') || 'the requested outcome'; }
const topicRules = [
  { match: /\b(?:pay(?:ment|ments)?|checkout|invoice|card|stripe|refund)\b/i, label: 'payment', criterion: 'A customer can complete a payment and receives an unambiguous confirmation.', evidence: 'Which payment method, currency, and refund rule are required for the first release.', trigger: 'The chosen payment provider cannot support the required country, currency, or refund flow.' },
  { match: /\b(?:order|pre-?order|booking|reservation|appointment)\b/i, label: 'orders or bookings', criterion: 'A customer can place one valid order or booking and the owner can see it immediately.', evidence: 'The exact order or booking rules: cutoff time, confirmation, cancellation, and exceptions.', trigger: 'Order volume or exception handling exceeds the agreed manual workflow.' },
  { match: /\b(?:deliver|delivery|shipping|pickup|courier)\b/i, label: 'fulfilment', criterion: 'The customer sees a valid fulfilment option before committing.', evidence: 'Delivery area, pickup rules, lead time, and the owner of fulfilment updates.', trigger: 'Delivery coverage, pricing, or lead time changes after the flow is approved.' },
  { match: /\b(?:menu|price|availability|inventory|stock|catalog)\b/i, label: 'volatile information', criterion: 'The owner can update the volatile information from a phone in under five minutes.', evidence: 'Who owns updates and the source of truth for prices, availability, or stock.', trigger: 'The source of truth becomes unavailable or differs from what the customer sees.' },
  { match: /\b(?:website|page|landing|app|product|dashboard|form)\b/i, label: 'the user flow', criterion: 'A first-time user can complete the primary flow without help.', evidence: 'The primary user, their first task, and the device they use most often.', trigger: 'User testing shows that the primary flow cannot be completed without guidance.' }
];
function analyzeRequest(raw){
  const matched = topicRules.filter(rule => rule.match.test(raw));
  const unique = (key, fallback) => [...new Set(matched.map(rule => rule[key]))].slice(0, 3).concat(fallback).slice(0, 3);
  const deadline = raw.match(/\b(?:today|tomorrow|this week|next week|\d+\s*(?:day|days|week|weeks))\b/i);
  const needsStaging = matched.length >= 3;
  return {
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
function assumptionsFor(analysis){
  const knownFocus = analysis.focus === 'the requested outcome' ? 'the requested outcome' : analysis.focus;
  return [
    `The facts needed for ${knownFocus} are current and available to the owner.`,
    'A real user can be found to review the first end-to-end flow.',
    analysis.needsStaging ? 'The deferred concerns can safely remain manual while the first flow is tested.' : 'The scope can stay small until the acceptance criteria are proven.'
  ];
}
function render(){ const raw=input.value.trim(); if(!raw){input.focus();return;} const analysis=analyzeRequest(raw); $('#empty').hidden=true; $('#results').hidden=false; $('#brief-title').textContent=title(raw); $('#next-decision').textContent=analysis.needsStaging ? 'Choose one end-to-end flow for the first release.' : 'Confirm the smallest outcome that must be true next.'; $('#decision-detail').textContent=analysis.needsStaging ? `This request combines ${analysis.focus}. Treating all of it as one release creates an untestable scope: select one flow, name what is deferred, then validate it before adding the next concern.` : `Before selecting a solution, agree what “working” means for ${analysis.focus}: who uses it, what they can complete, and what proof counts.`;
  $('#signals').innerHTML=[`Scope: <b>${analysis.needsStaging ? 'staged release needed' : 'unconfirmed'}</b>`,`Evidence gaps: <b>${analysis.gaps}</b>`,'Branches: <b>6 checked</b>','Plan state: <b>draft</b>'].map(x=>`<span class="signal">${x}</span>`).join('');
  $('#criteria').innerHTML=list(analysis.criteria);
  $('#evidence').innerHTML=list(analysis.evidence);
  $('#triggers').innerHTML=list(analysis.triggers);
  $('#assumptions').innerHTML=list(assumptionsFor(analysis));
  $('#first-release').innerHTML=list(analysis.firstRelease);
  const scenarioDetails = [
    `A first version for ${analysis.focus} is reviewed against the criteria before it expands.`,
    'The owner already has the required content, rules, and decision authority, so the first review can happen quickly.',
    `Required facts for ${analysis.focus} are missing or contradictory; stop implementation and resolve the evidence gap first.`,
    'A deadline, rule, source of truth, or delivery condition changes after approval; reopen the plan rather than patching silently.',
    analysis.needsStaging ? 'Use a smaller manual flow for the deferred concerns while validating one end-to-end flow.' : 'Use a manual or low-code flow if it meets the same acceptance criteria for the first review.',
    `Compare an existing tool against the criteria for ${analysis.focus}; choose it if it meets the need more cheaply.`
  ];
  branchData.forEach((branch,index)=>{branch[2]=scenarioDetails[index];});
  const holder=$('#branches'); holder.innerHTML=''; branchData.forEach((b,i)=>{const node=$('#branch-template').content.cloneNode(true);const button=node.querySelector('button');button.querySelector('.branch-icon').textContent=b[0];button.querySelector('.branch-name').textContent=b[1];button.querySelector('small').textContent=b[2];button.addEventListener('click',()=>{holder.querySelectorAll('.branch').forEach(x=>x.classList.remove('active'));button.classList.add('active');$('#next-decision').textContent=b[1];$('#decision-detail').textContent=b[2]+' Decide whether this path needs prevention, an explicit assumption, or a cheaper fallback before committing more work.';});if(i===0)button.classList.add('active');holder.append(node);});
  $('#results').scrollIntoView({behavior:'smooth',block:'start'});
}
$('#sample').addEventListener('click',()=>{input.value=sample;count();input.focus();});
input.addEventListener('input',()=>{count();saveDraft();});
input.addEventListener('keydown',(event)=>{if((event.ctrlKey || event.metaKey) && event.key==='Enter'){event.preventDefault();render();}});
$('#clear-draft').addEventListener('click',()=>{input.value='';saveDraft();count();input.focus();});
$('#analyze').addEventListener('click',render);
$('#copy').addEventListener('click',async()=>{const branches=[...document.querySelectorAll('#branches .branch')].map(button=>`- ${button.querySelector('.branch-name').textContent}: ${button.querySelector('small').textContent}`).join('\n');const md=`# ${$('#brief-title').textContent}\n\n## Next decision\n${$('#next-decision').textContent}\n\n${$('#decision-detail').textContent}\n\n## Assumptions to validate\n${[...document.querySelectorAll('#assumptions li')].map(x=>'- '+x.textContent).join('\n')}\n\n## Acceptance criteria\n${[...document.querySelectorAll('#criteria li')].map(x=>'- '+x.textContent).join('\n')}\n\n## Evidence to get first\n${[...document.querySelectorAll('#evidence li')].map(x=>'- '+x.textContent).join('\n')}\n\n## Reopen the plan when\n${[...document.querySelectorAll('#triggers li')].map(x=>'- '+x.textContent).join('\n')}\n\n## First release plan\n${[...document.querySelectorAll('#first-release li')].map(x=>'- '+x.textContent).join('\n')}\n\n## Scenario paths checked\n${branches}`; await navigator.clipboard.writeText(md); $('#copy').textContent='Copied'; setTimeout(()=>$('#copy').textContent='Copy as Markdown',1300);});
count();
const savedDraft = localStorage.getItem(draftKey);
if(savedDraft){ input.value=savedDraft; count(); $('#draft-status').textContent='Saved draft restored'; $('#clear-draft').hidden=false; }
