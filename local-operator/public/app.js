const $ = (selector) => document.querySelector(selector);
let token = '';
let bridgeEnabled = false;
const input = $('#request');
const button = $('#analyze');

const safeList = (target, items) => {
  target.replaceChildren(...items.map((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    return li;
  }));
};

const labelledText = (label, value) => {
  const paragraph = document.createElement('p');
  const marker = document.createElement('span');
  marker.textContent = label;
  paragraph.append(marker, document.createTextNode(value));
  return paragraph;
};

async function connect() {
  try {
    const response = await fetch('/api/session');
    const data = await response.json();
    token = data.token;
    bridgeEnabled = Boolean(data.publicBridge?.enabled);
    $('#connection').textContent = `Codex: ${data.codex}`;
    $('#connection').classList.add('ready');
    button.disabled = false;
    $('#bridge-toggle').disabled = false;
    renderBridge(data.publicBridge);
  } catch {
    $('#connection').textContent = '\u0421\u0435\u0440\u0432\u0435\u0440 \u043d\u0435 \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0451\u043d';
    $('#message').textContent = '\u0417\u0430\u043f\u0443\u0441\u0442\u0438\u0442\u0435 \u043b\u043e\u043a\u0430\u043b\u044c\u043d\u044b\u0439 \u043e\u043f\u0435\u0440\u0430\u0442\u043e\u0440 \u0435\u0449\u0451 \u0440\u0430\u0437.';
  }
}

function renderBridge(bridge) {
  bridgeEnabled = Boolean(bridge?.enabled);
  const toggle = $('#bridge-toggle');
  toggle.textContent = bridgeEnabled
    ? '\u041e\u0442\u043a\u043b\u044e\u0447\u0438\u0442\u044c \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u0443\u044e \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443'
    : '\u0420\u0430\u0437\u0440\u0435\u0448\u0438\u0442\u044c \u043d\u0430 30 \u043c\u0438\u043d\u0443\u0442';
  $('#bridge-status').textContent = bridgeEnabled
    ? `\u0414\u043e\u0441\u0442\u0443\u043f \u0432\u043a\u043b\u044e\u0447\u0451\u043d \u0434\u043e ${new Date(bridge.expiresAt).toLocaleTimeString()}.`
    : '\u0414\u043e\u0441\u0442\u0443\u043f \u0441 \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u043e\u0439 \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u044b \u0432\u044b\u043a\u043b\u044e\u0447\u0435\u043d.';
}

function render(data) {
  const brief = data.brief;
  $('#title').textContent = brief.title;
  $('#summary').textContent = brief.summary;
  $('#next-decision').textContent = brief.next_decision;
  $('#recommendation').textContent = brief.recommendation;
  $('#confidence').textContent = `\u0423\u0432\u0435\u0440\u0435\u043d\u043d\u043e\u0441\u0442\u044c: ${brief.confidence}`;
  safeList($('#assumptions'), brief.assumptions);
  safeList($('#questions'), brief.questions);
  safeList($('#limitations'), brief.limitations);
  $('#scenarios').replaceChildren(...brief.scenarios.map((scenario, index) => {
    const article = document.createElement('article');
    const number = document.createElement('b');
    number.textContent = String(index + 1).padStart(2, '0');
    const heading = document.createElement('h3');
    heading.textContent = scenario.lens;
    const outcome = document.createElement('p');
    outcome.textContent = scenario.outcome;
    article.append(number, heading, outcome,
      labelledText('\u0420\u0418\u0421\u041a', scenario.risk),
      labelledText('\u0421\u041b\u0415\u0414\u0423\u042e\u0429\u0418\u0419 \u0428\u0410\u0413', scenario.next_step));
    return article;
  }));
  $('#result').hidden = false;
  $('#result').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

input.addEventListener('input', () => { $('#counter').textContent = `${input.value.length} / 4000`; });
button.addEventListener('click', async () => {
  const request = input.value.trim();
  if (!request) { input.focus(); return; }
  button.disabled = true;
  $('#message').textContent = 'Codex \u0430\u043d\u0430\u043b\u0438\u0437\u0438\u0440\u0443\u0435\u0442 \u0437\u0430\u043f\u0440\u043e\u0441. \u041e\u0431\u044b\u0447\u043d\u043e \u044d\u0442\u043e \u0437\u0430\u043d\u0438\u043c\u0430\u0435\u0442 \u0434\u043e \u043c\u0438\u043d\u0443\u0442\u044b\u2026';
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-operator-token': token },
      body: JSON.stringify({ request })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '\u041e\u0448\u0438\u0431\u043a\u0430 \u0430\u043d\u0430\u043b\u0438\u0437\u0430');
    render(data);
    $('#message').textContent = '\u0420\u0430\u0437\u0431\u043e\u0440 \u0433\u043e\u0442\u043e\u0432.';
  } catch (error) {
    $('#message').textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

$('#bridge-toggle').addEventListener('click', async () => {
  const toggle = $('#bridge-toggle');
  toggle.disabled = true;
  try {
    const response = await fetch(bridgeEnabled ? '/api/bridge/disable' : '/api/bridge/enable', {
      method: 'POST',
      headers: { 'x-operator-token': token }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0438\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u0434\u043e\u0441\u0442\u0443\u043f.');
    renderBridge(data);
  } catch (error) {
    $('#bridge-status').textContent = error.message;
  } finally {
    toggle.disabled = false;
  }
});

connect();
