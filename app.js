const $ = (s) => document.querySelector(s);
const input = $('#brief');
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
function title(text){ const words=text.replace(/[^\w\s-]/g,'').trim().split(/\s+/).slice(0,7); return words.length ? words.map(w=>w[0].toUpperCase()+w.slice(1)).join(' ') : 'Decision brief'; }
function getNouns(text){ const found=text.toLowerCase().match(/\b(?:booking|orders?|availability|menu|website|page|launch|client|product|payment|delivery|team|app|campaign|service)\b/g) || []; return [...new Set(found)].slice(0,3).join(', ') || 'the requested outcome'; }
function render(){ const raw=input.value.trim(); if(!raw){input.focus();return;} const focus=getNouns(raw); $('#empty').hidden=true; $('#results').hidden=false; $('#brief-title').textContent=title(raw); $('#next-decision').textContent='Confirm the smallest outcome that must be true next.'; $('#decision-detail').textContent=`Before selecting a solution, agree what “working” means for ${focus}: who uses it, what they can complete, and what proof counts.`;
  $('#signals').innerHTML=['Scope: <b>unconfirmed</b>','Evidence gaps: <b>3</b>','Branches: <b>6 checked</b>','Plan state: <b>draft</b>'].map(x=>`<span class="signal">${x}</span>`).join('');
  $('#criteria').innerHTML=['A real user can complete one end-to-end task without help.','The owner can change the most volatile information in under five minutes.','Success and failure states are visible, named, and testable.'].map(x=>`<li>${x}</li>`).join('');
  $('#evidence').innerHTML=['The exact user flow to support first.','Who owns prices, availability, and exceptions.','Whether an existing tool already meets the need.'].map(x=>`<li>${x}</li>`).join('');
  $('#triggers').innerHTML=['A new request changes the agreed user outcome.','Required information is still missing at the first review.','A cheaper mature alternative passes the acceptance criteria.'].map(x=>`<li>${x}</li>`).join('');
  const holder=$('#branches'); holder.innerHTML=''; branchData.forEach((b,i)=>{const node=$('#branch-template').content.cloneNode(true);const button=node.querySelector('button');button.querySelector('.branch-icon').textContent=b[0];button.querySelector('.branch-name').textContent=b[1];button.querySelector('small').textContent=b[2];button.addEventListener('click',()=>{holder.querySelectorAll('.branch').forEach(x=>x.classList.remove('active'));button.classList.add('active');$('#next-decision').textContent=b[1];$('#decision-detail').textContent=b[2]+' Decide whether this path needs prevention, an explicit assumption, or a cheaper fallback before committing more work.';});if(i===0)button.classList.add('active');holder.append(node);});
  $('#results').scrollIntoView({behavior:'smooth',block:'start'});
}
$('#sample').addEventListener('click',()=>{input.value=sample;count();input.focus();});
input.addEventListener('input',count); $('#analyze').addEventListener('click',render);
$('#copy').addEventListener('click',async()=>{const md=`# ${$('#brief-title').textContent}\n\n## Next decision\n${$('#next-decision').textContent}\n\n${$('#decision-detail').textContent}\n\n## Acceptance criteria\n${[...document.querySelectorAll('#criteria li')].map(x=>'- '+x.textContent).join('\n')}\n\n## Evidence to get first\n${[...document.querySelectorAll('#evidence li')].map(x=>'- '+x.textContent).join('\n')}`; await navigator.clipboard.writeText(md); $('#copy').textContent='Copied'; setTimeout(()=>$('#copy').textContent='Copy as Markdown',1300);});
count();
