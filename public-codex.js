(() => {
  const endpoint = 'http://127.0.0.1:4183';
  const input = document.querySelector('#brief');
  const analyzeButton = document.querySelector('#analyze');
  const analyzeLabel = analyzeButton.querySelector('span');
  const connectButton = document.querySelector('#codex-connect');
  const panel = document.querySelector('#personal-codex');
  const status = document.querySelector('#codex-connection-status');
  let token = '';
  let connected = false;
  let analyzing = false;

  async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  const setList = (selector, values) => {
    const target = document.querySelector(selector);
    target.replaceChildren(...values.map((value) => {
      const item = document.createElement('li');
      item.textContent = value;
      return item;
    }));
  };

  const labelledParagraph = (label, text) => {
    const paragraph = document.createElement('p');
    const marker = document.createElement('span');
    marker.textContent = label;
    paragraph.append(marker, document.createTextNode(text));
    return paragraph;
  };

  function setConnected(value, message) {
    connected = value;
    panel.classList.toggle('connected', value);
    connectButton.textContent = value ? 'Use fixed lenses instead' : 'Connect my Codex';
    analyzeLabel.textContent = value ? 'Analyze with my Codex' : 'Apply decision lenses';
    status.textContent = message || (value ? 'Personal Codex mode is connected.' : 'Fixed-lens mode is active.');
  }

  async function connect() {
    if (connected) {
      token = '';
      setConnected(false);
      document.querySelector('#codex-results').hidden = true;
      return;
    }
    connectButton.disabled = true;
    status.textContent = 'Connecting to the operator on this computer...';
    try {
      const response = await fetchWithTimeout(`${endpoint}/api/session`, { mode: 'cors', cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.token) throw new Error(data.error || 'The public bridge is locked.');
      token = data.token;
      const expiry = data.publicBridge?.expiresAt ? new Date(data.publicBridge.expiresAt).toLocaleTimeString() : 'soon';
      setConnected(true, `Personal Codex connected. Public-page access expires at ${expiry}.`);
    } catch {
      setConnected(false, 'Start the local operator, enable public-page access there, then choose Allow if Chrome asks whether this site may access your local network.');
    } finally {
      connectButton.disabled = false;
    }
  }

  function renderBrief(data) {
    const brief = data.brief;
    document.querySelector('#codex-title').textContent = brief.title;
    document.querySelector('#codex-summary').textContent = brief.summary;
    document.querySelector('#codex-next-decision').textContent = brief.next_decision;
    document.querySelector('#codex-recommendation').textContent = brief.recommendation;
    document.querySelector('#codex-confidence').textContent = `Confidence: ${brief.confidence}`;
    setList('#codex-assumptions', brief.assumptions);
    setList('#codex-questions', brief.questions);
    setList('#codex-limitations', brief.limitations);
    document.querySelector('#codex-scenarios').replaceChildren(...brief.scenarios.map((scenario, index) => {
      const article = document.createElement('article');
      article.className = 'card';
      const number = document.createElement('b');
      number.textContent = String(index + 1).padStart(2, '0');
      const heading = document.createElement('h3');
      heading.textContent = scenario.lens;
      const outcome = document.createElement('p');
      outcome.textContent = scenario.outcome;
      article.append(number, heading, outcome,
        labelledParagraph('RISK', scenario.risk),
        labelledParagraph('NEXT STEP', scenario.next_step));
      return article;
    }));
    document.querySelector('#results').hidden = true;
    document.querySelector('#empty').hidden = true;
    const result = document.querySelector('#codex-results');
    result.hidden = false;
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function analyzeWithCodex(event) {
    if (!connected) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const request = input.value.trim();
    if (!request || analyzing) { if (!request) input.focus(); return; }
    analyzing = true;
    analyzeButton.disabled = true;
    status.textContent = 'Your local Codex is analyzing this request...';
    try {
      const response = await fetchWithTimeout(`${endpoint}/api/analyze`, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-store',
        headers: { 'content-type': 'application/json', 'x-operator-token': token },
        body: JSON.stringify({ request })
      }, 180000);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Codex could not analyze the request.');
      renderBrief(data);
      status.textContent = 'Request-specific Codex brief is ready.';
    } catch (error) {
      status.textContent = `${error.message} Re-enable the bridge in the local operator and reconnect.`;
    } finally {
      analyzing = false;
      analyzeButton.disabled = false;
    }
  }

  connectButton.addEventListener('click', connect);
  analyzeButton.addEventListener('click', analyzeWithCodex, true);
  input.addEventListener('keydown', (event) => {
    if (connected && (event.ctrlKey || event.metaKey) && event.key === 'Enter') analyzeWithCodex(event);
  }, true);
})();
