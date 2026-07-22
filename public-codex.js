(() => {
  const endpoint = 'http://127.0.0.1:4183';
  const storageKey = 'chaos-brief-cases-v1';
  const languageKey = 'chaos-brief-language';
  const engineKey = 'chaos-brief-engine';
  const selectedCaseKey = 'chaos-brief-selected-case';
  const $ = (selector) => document.querySelector(selector);
  const input = $('#brief');
  const analyzeButton = $('#analyze');
  const analyzeLabel = analyzeButton.querySelector('span');
  const connectButton = $('#codex-connect');
  const panel = $('#personal-codex');
  const status = $('#codex-connection-status');
  let token = '';
  let connected = false;
  let analyzing = false;
  let expiresAt = 0;
  let currentBrief = null;
  let currentCaseId = localStorage.getItem(selectedCaseKey) || '';
  let engine = localStorage.getItem(engineKey) || 'personal';
  let language = localStorage.getItem(languageKey) || (/^uk/i.test(navigator.language) ? 'uk' : /^ru/i.test(navigator.language) ? 'ru' : 'en');

  const copy = {
    en: {
      privateLabel: 'PERSONAL MODE · THIS COMPUTER ONLY', personalTitle: 'Make a real decision with Personal Codex', personalDescription: 'Personal Codex creates request-specific reasoning. The fixed demo remains available as a transparent fallback.', language: 'Language', personalEngine: 'Personal Codex', fixedEngine: 'Fixed demo', savedCases: 'Saved cases', newCase: 'New case', newCaseOption: 'New unsaved case', connect: 'Connect Personal Codex', disconnect: 'Disconnect', openOperator: 'Open local operator', selected: 'Personal Codex is selected. Connect the local operator to begin.', fixedSelected: 'Fixed demo selected. Its six lenses are templates, not AI reasoning.', connecting: 'Connecting to the operator on this computer…', ready: 'Personal Codex connected', analyzing: 'Personal Codex is analyzing this decision…', resultReady: 'Request-specific decision brief is ready.', bridgeHelp: 'Start the local operator, enable public-page access, and reconnect.', analyze: 'Analyze with Personal Codex', fixedAnalyze: 'Apply fixed demo lenses', answerNeeded: 'Answer at least one question.', changeNeeded: 'Describe what changed.', saved: 'Decision saved in this browser.', copied: 'Markdown copied.', caseRestored: 'Saved case restored.', personalNote: 'Personal Codex reasons about this exact request. Results and revisions are saved only in this browser.', fixedNote: 'This demo applies six fixed lenses. It does not generate request-specific reasoning.'
    },
    ru: {
      privateLabel: 'ЛИЧНЫЙ РЕЖИМ · ТОЛЬКО ЭТОТ КОМПЬЮТЕР', personalTitle: 'Примите реальное решение вместе с Personal Codex', personalDescription: 'Personal Codex рассуждает именно о вашем запросе. Фиксированная демоверсия остаётся прозрачным запасным режимом.', language: 'Язык', personalEngine: 'Personal Codex', fixedEngine: 'Фиксированное демо', savedCases: 'Сохранённые кейсы', newCase: 'Новый кейс', newCaseOption: 'Новый несохранённый кейс', connect: 'Подключить Personal Codex', disconnect: 'Отключить', openOperator: 'Открыть локальный оператор', selected: 'Выбран Personal Codex. Подключите локальный оператор.', fixedSelected: 'Выбрано фиксированное демо. Его шесть линз — шаблоны, а не рассуждение ИИ.', connecting: 'Подключаю локальный оператор на этом компьютере…', ready: 'Personal Codex подключён', analyzing: 'Personal Codex анализирует это решение…', resultReady: 'Разбор именно вашего запроса готов.', bridgeHelp: 'Запустите локальный оператор, разрешите доступ публичной странице и подключитесь снова.', analyze: 'Проанализировать с Personal Codex', fixedAnalyze: 'Применить фиксированные линзы', answerNeeded: 'Ответьте хотя бы на один вопрос.', changeNeeded: 'Опишите, что изменилось.', saved: 'Решение сохранено в этом браузере.', copied: 'Markdown скопирован.', caseRestored: 'Сохранённый кейс восстановлен.', personalNote: 'Personal Codex рассуждает именно об этом запросе. История и изменения сохраняются только в вашем браузере.', fixedNote: 'Демо применяет шесть фиксированных линз и не создаёт уникальное рассуждение.'
    },
    uk: {
      privateLabel: 'ОСОБИСТИЙ РЕЖИМ · ЛИШЕ ЦЕЙ КОМП’ЮТЕР', personalTitle: 'Прийміть реальне рішення разом із Personal Codex', personalDescription: 'Personal Codex міркує саме над вашим запитом. Фіксована демоверсія лишається прозорим запасним режимом.', language: 'Мова', personalEngine: 'Personal Codex', fixedEngine: 'Фіксоване демо', savedCases: 'Збережені кейси', newCase: 'Новий кейс', newCaseOption: 'Новий незбережений кейс', connect: 'Підключити Personal Codex', disconnect: 'Відключити', openOperator: 'Відкрити локальний оператор', selected: 'Обрано Personal Codex. Підключіть локальний оператор.', fixedSelected: 'Обрано фіксоване демо. Його шість лінз — шаблони, а не міркування ШІ.', connecting: 'Підключаю локальний оператор на цьому комп’ютері…', ready: 'Personal Codex підключено', analyzing: 'Personal Codex аналізує це рішення…', resultReady: 'Розбір саме вашого запиту готовий.', bridgeHelp: 'Запустіть локальний оператор, дозвольте доступ публічній сторінці та підключіться знову.', analyze: 'Проаналізувати з Personal Codex', fixedAnalyze: 'Застосувати фіксовані лінзи', answerNeeded: 'Дайте відповідь хоча б на одне запитання.', changeNeeded: 'Опишіть, що змінилося.', saved: 'Рішення збережено в цьому браузері.', copied: 'Markdown скопійовано.', caseRestored: 'Збережений кейс відновлено.', personalNote: 'Personal Codex міркує саме над цим запитом. Історія та зміни зберігаються лише у вашому браузері.', fixedNote: 'Демо застосовує шість фіксованих лінз і не створює унікальне міркування.'
    }
  };
  const interfaceCopy = {
    en: { requestLabel:'What needs to happen?',sample:'Use a realistic example',briefLabel:'PERSONAL CODEX BRIEF',copyMarkdown:'Copy Markdown',nextDecision:'NEXT DECISION',whatChanged:'WHAT CHANGED',changed:'Changed',stable:'Stayed stable',confirmed:'CONFIRMED FACTS',statements:'USER STATEMENTS',inferences:'INFERENCES',verifyNext:'VERIFY NEXT',smallestTest:'SMALLEST REVERSIBLE TEST',success:'Success:',review:'Review:',assumptions:'ASSUMPTIONS',reviewTriggers:'REVIEW TRIGGERS',questions:'QUESTIONS THAT COULD CHANGE THE ANSWER',refine:'Refine with my answers',conditionChanged:'A CONDITION CHANGED',recalculate:'Recalculate decision',sixLenses:'SIX REQUEST-SPECIFIC LENSES',generated:'Generated by your local Codex',limits:'LIMITS OF THIS ANSWER' },
    ru: { requestLabel:'Что должно произойти?',sample:'Вставить реалистичный пример',briefLabel:'РАЗБОР PERSONAL CODEX',copyMarkdown:'Скопировать Markdown',nextDecision:'СЛЕДУЮЩЕЕ РЕШЕНИЕ',whatChanged:'ЧТО ИЗМЕНИЛОСЬ',changed:'Изменилось',stable:'Осталось прежним',confirmed:'ПОДТВЕРЖДЁННЫЕ ФАКТЫ',statements:'СЛОВА ПОЛЬЗОВАТЕЛЯ',inferences:'ВЫВОДЫ',verifyNext:'ЧТО ПРОВЕРИТЬ',smallestTest:'МИНИМАЛЬНЫЙ ОБРАТИМЫЙ ТЕСТ',success:'Признак успеха:',review:'Пересмотр:',assumptions:'ДОПУЩЕНИЯ',reviewTriggers:'ТРИГГЕРЫ ПЕРЕСМОТРА',questions:'ВОПРОСЫ, КОТОРЫЕ МОГУТ ИЗМЕНИТЬ ОТВЕТ',refine:'Уточнить по моим ответам',conditionChanged:'УСЛОВИЕ ИЗМЕНИЛОСЬ',recalculate:'Пересчитать решение',sixLenses:'ШЕСТЬ ЛИНЗ ДЛЯ ЭТОГО ЗАПРОСА',generated:'Создано вашим локальным Codex',limits:'ОГРАНИЧЕНИЯ ОТВЕТА' },
    uk: { requestLabel:'Що має відбутися?',sample:'Вставити реалістичний приклад',briefLabel:'РОЗБІР PERSONAL CODEX',copyMarkdown:'Скопіювати Markdown',nextDecision:'НАСТУПНЕ РІШЕННЯ',whatChanged:'ЩО ЗМІНИЛОСЯ',changed:'Змінилося',stable:'Лишилося сталим',confirmed:'ПІДТВЕРДЖЕНІ ФАКТИ',statements:'СЛОВА КОРИСТУВАЧА',inferences:'ВИСНОВКИ',verifyNext:'ЩО ПЕРЕВІРИТИ',smallestTest:'МІНІМАЛЬНИЙ ЗВОРОТНИЙ ТЕСТ',success:'Ознака успіху:',review:'Перегляд:',assumptions:'ПРИПУЩЕННЯ',reviewTriggers:'ТРИГЕРИ ПЕРЕГЛЯДУ',questions:'ЗАПИТАННЯ, ЩО МОЖУТЬ ЗМІНИТИ ВІДПОВІДЬ',refine:'Уточнити за моїми відповідями',conditionChanged:'УМОВА ЗМІНИЛАСЯ',recalculate:'Перерахувати рішення',sixLenses:'ШІСТЬ ЛІНЗ ДЛЯ ЦЬОГО ЗАПИТУ',generated:'Створено вашим локальним Codex',limits:'ОБМЕЖЕННЯ ВІДПОВІДІ' }
  };
  const t = (key) => copy[language]?.[key] || copy.en[key] || key;

  function readCases() {
    try { const value = JSON.parse(localStorage.getItem(storageKey) || '[]'); return Array.isArray(value) ? value : []; }
    catch { return []; }
  }

  function writeCases(cases) {
    localStorage.setItem(storageKey, JSON.stringify(cases.slice(0, 20)));
  }

  function setList(selector, values, emptyText = '—') {
    const target = $(selector);
    const safeValues = Array.isArray(values) && values.length ? values : [emptyText];
    target.replaceChildren(...safeValues.map((value) => {
      const item = document.createElement('li'); item.textContent = value; return item;
    }));
  }

  function labelledParagraph(label, text) {
    const paragraph = document.createElement('p');
    const marker = document.createElement('span'); marker.textContent = label;
    paragraph.append(marker, document.createTextNode(text || '—'));
    return paragraph;
  }

  async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try { return await fetch(url, { ...options, signal: controller.signal }); }
    finally { clearTimeout(timer); }
  }

  function updateStaticCopy() {
    document.documentElement.lang = language;
    $('[data-copy="privateLabel"]').textContent = t('privateLabel');
    $('[data-copy="personalTitle"]').textContent = t('personalTitle');
    $('[data-copy="personalDescription"]').textContent = t('personalDescription');
    $('[data-copy="language"]').textContent = t('language');
    $('[data-copy="personalEngine"]').textContent = t('personalEngine');
    $('[data-copy="fixedEngine"]').textContent = t('fixedEngine');
    $('[data-copy="savedCases"]').textContent = t('savedCases');
    $('[data-copy="newCase"]').textContent = t('newCase');
    $('[data-copy="openOperator"]').textContent = t('openOperator');
    document.querySelectorAll('[data-ui]').forEach((element) => { element.textContent = interfaceCopy[language]?.[element.dataset.ui] || interfaceCopy.en[element.dataset.ui] || element.textContent; });
    connectButton.textContent = connected ? t('disconnect') : t('connect');
    $('#language-select').value = language;
    refreshCases();
    applyEngine(engine, false);
  }

  function setConnected(value, message) {
    connected = value;
    panel.classList.toggle('connected', value);
    connectButton.textContent = value ? t('disconnect') : t('connect');
    status.textContent = message || (value ? t('ready') : t('selected'));
  }

  function updateExpiry() {
    if (!connected || !expiresAt || analyzing) return;
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) { token = ''; expiresAt = 0; setConnected(false, t('bridgeHelp')); return; }
    const minutes = Math.ceil(remaining / 60000);
    status.textContent = `${t('ready')} · ${minutes} min`;
  }

  async function connect() {
    if (connected) { token = ''; expiresAt = 0; setConnected(false); return; }
    connectButton.disabled = true; status.textContent = t('connecting');
    try {
      const response = await fetchWithTimeout(`${endpoint}/api/session`, { mode: 'cors', cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.token) throw new Error(data.error || 'The public bridge is locked.');
      token = data.token;
      expiresAt = data.publicBridge?.expiresAt ? Date.parse(data.publicBridge.expiresAt) : 0;
      setConnected(true); updateExpiry();
    } catch { setConnected(false, t('bridgeHelp')); }
    finally { connectButton.disabled = false; }
  }

  function applyEngine(value, save = true) {
    engine = value === 'fixed' ? 'fixed' : 'personal';
    if (save) localStorage.setItem(engineKey, engine);
    $('#engine-personal').classList.toggle('active', engine === 'personal');
    $('#engine-fixed').classList.toggle('active', engine === 'fixed');
    panel.classList.toggle('fixed-engine', engine === 'fixed');
    connectButton.hidden = engine === 'fixed';
    analyzeLabel.textContent = engine === 'personal' ? t('analyze') : t('fixedAnalyze');
    const note = $('.engine-note');
    note.textContent = engine === 'personal' ? t('personalNote') : t('fixedNote');
    note.classList.toggle('personal-active', engine === 'personal');
    status.textContent = engine === 'fixed' ? t('fixedSelected') : (connected ? t('ready') : t('selected'));
    if (engine === 'fixed') $('#codex-results').hidden = true;
    else if (currentBrief) renderBrief(currentBrief, { restore: true });
  }

  function refreshCases() {
    const select = $('#case-select');
    const cases = readCases();
    const blank = document.createElement('option'); blank.value = ''; blank.textContent = t('newCaseOption');
    select.replaceChildren(blank, ...cases.map((item) => {
      const option = document.createElement('option'); option.value = item.id;
      option.textContent = `${item.title || item.request.slice(0, 55)} · ${new Date(item.updatedAt).toLocaleDateString()}`;
      return option;
    }));
    select.value = cases.some((item) => item.id === currentCaseId) ? currentCaseId : '';
  }

  function saveBrief(brief, workflow, detail = {}) {
    const cases = readCases();
    let item = cases.find((entry) => entry.id === currentCaseId);
    const now = new Date().toISOString();
    if (!item) {
      currentCaseId = `case_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      item = { id: currentCaseId, request: input.value.trim(), title: brief.title, brief, createdAt: now, updatedAt: now, revisions: [], decision: {} };
      cases.unshift(item);
    } else {
      item.revisions = Array.isArray(item.revisions) ? item.revisions : [];
      if (item.brief) item.revisions.push({ at: now, workflow, detail, brief: item.brief });
      item.brief = brief; item.title = brief.title; item.request = input.value.trim(); item.updatedAt = now;
    }
    writeCases(cases);
    localStorage.setItem(selectedCaseKey, currentCaseId);
    refreshCases();
  }

  function renderQuestions(questions) {
    $('#codex-question-inputs').replaceChildren(...(questions || []).map((question, index) => {
      const label = document.createElement('label'); label.textContent = question;
      const textarea = document.createElement('textarea'); textarea.maxLength = 1000; textarea.dataset.questionIndex = index;
      label.append(textarea); return label;
    }));
  }

  function renderBrief(data, options = {}) {
    const brief = data.brief || data;
    currentBrief = brief;
    $('#codex-title').textContent = brief.title;
    $('#codex-summary').textContent = brief.summary;
    $('#codex-next-decision').textContent = brief.next_decision;
    $('#codex-recommendation').textContent = brief.recommendation;
    $('#codex-confidence').textContent = `Confidence: ${brief.confidence}`;
    setList('#codex-assumptions', brief.assumptions);
    setList('#codex-review-triggers', brief.review_triggers);
    setList('#codex-limitations', brief.limitations);
    setList('#codex-confirmed', brief.evidence?.confirmed_facts);
    setList('#codex-user-statements', brief.evidence?.user_statements);
    setList('#codex-inferences', brief.evidence?.inferences);
    setList('#codex-verification', brief.evidence?.verification_needed);
    $('#codex-test-action').textContent = brief.smallest_test?.action || '—';
    $('#codex-test-success').textContent = brief.smallest_test?.success_signal || '—';
    $('#codex-test-review').textContent = brief.smallest_test?.review_date_suggestion || '—';
    renderQuestions(brief.questions);
    const change = brief.change_summary || { mode: 'initial', changed: [], unchanged: [], reason: '' };
    const changeBox = $('#codex-change-summary');
    changeBox.hidden = change.mode === 'initial';
    if (!changeBox.hidden) {
      $('#codex-change-reason').textContent = change.reason;
      setList('#codex-changed', change.changed);
      setList('#codex-unchanged', change.unchanged);
    }
    $('#codex-scenarios').replaceChildren(...(brief.scenarios || []).map((scenario, index) => {
      const article = document.createElement('article'); article.className = 'card';
      const number = document.createElement('b'); number.textContent = String(index + 1).padStart(2, '0');
      const heading = document.createElement('h3'); heading.textContent = scenario.lens;
      const outcome = document.createElement('p'); outcome.textContent = scenario.outcome;
      article.append(number, heading, outcome, labelledParagraph('RISK', scenario.risk), labelledParagraph('NEXT STEP', scenario.next_step));
      return article;
    }));
    $('#codex-choice').value = brief.recommendation || '';
    $('#results').hidden = true; $('#empty').hidden = true; $('#codex-results').hidden = false;
    if (!options.restore) $('#codex-results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function runWorkflow(workflow, detail = {}) {
    const request = input.value.trim();
    if (!request || analyzing || !connected) { if (!request) input.focus(); return; }
    analyzing = true;
    [analyzeButton, $('#refine-codex'), $('#revise-codex')].forEach((button) => { button.disabled = true; });
    status.textContent = t('analyzing');
    try {
      const payload = { request, workflow };
      if (workflow !== 'initial') payload.previousBrief = currentBrief;
      if (workflow === 'clarify') payload.answers = detail.answers;
      if (workflow === 'revise') { payload.changeType = detail.changeType; payload.changeText = detail.changeText; }
      const response = await fetchWithTimeout(`${endpoint}/api/analyze`, { method: 'POST', mode: 'cors', cache: 'no-store', headers: { 'content-type': 'application/json', 'x-operator-token': token }, body: JSON.stringify(payload) }, 180000);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Codex could not analyze the request.');
      renderBrief(data); saveBrief(data.brief, workflow, detail);
      status.textContent = t('resultReady');
    } catch (error) { status.textContent = `${error.message} ${t('bridgeHelp')}`; }
    finally { analyzing = false; [analyzeButton, $('#refine-codex'), $('#revise-codex')].forEach((button) => { button.disabled = false; }); }
  }

  function restoreCase(id) {
    const item = readCases().find((entry) => entry.id === id);
    if (!item) return;
    currentCaseId = item.id; currentBrief = item.brief; input.value = item.request;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    if (engine === 'personal') renderBrief(item.brief, { restore: true });
    else $('#codex-results').hidden = true;
    $('#codex-choice').value = item.decision?.choice || item.brief.recommendation || '';
    $('#codex-user-confidence').value = item.decision?.confidence || '';
    $('#codex-review-date').value = item.decision?.reviewDate || '';
    localStorage.setItem(selectedCaseKey, currentCaseId); status.textContent = engine === 'personal' ? t('caseRestored') : t('fixedSelected');
  }

  function newCase() {
    currentCaseId = ''; currentBrief = null; localStorage.removeItem(selectedCaseKey);
    input.value = ''; input.dispatchEvent(new Event('input', { bubbles: true }));
    $('#codex-results').hidden = true; $('#results').hidden = true; $('#empty').hidden = false;
    refreshCases(); input.focus();
  }

  function saveDecision() {
    if (!currentCaseId) return;
    const cases = readCases(); const item = cases.find((entry) => entry.id === currentCaseId); if (!item) return;
    item.decision = { choice: $('#codex-choice').value.trim(), confidence: $('#codex-user-confidence').value, reviewDate: $('#codex-review-date').value, savedAt: new Date().toISOString() };
    item.updatedAt = new Date().toISOString(); writeCases(cases); refreshCases(); $('#codex-save-status').textContent = t('saved');
  }

  function markdown(brief) {
    const lines = [`# ${brief.title}`, '', brief.summary, '', `## Next decision`, brief.next_decision, '', brief.recommendation, '', '## Evidence'];
    const groups = [['Confirmed facts', brief.evidence?.confirmed_facts], ['User statements', brief.evidence?.user_statements], ['Inferences', brief.evidence?.inferences], ['Verify next', brief.evidence?.verification_needed]];
    groups.forEach(([name, values]) => { lines.push(`### ${name}`, ...(values || []).map((value) => `- ${value}`), ''); });
    lines.push('## Six decision lenses');
    (brief.scenarios || []).forEach((scenario, index) => lines.push(`### ${index + 1}. ${scenario.lens}`, scenario.outcome, `- Risk: ${scenario.risk}`, `- Next step: ${scenario.next_step}`, ''));
    return lines.join('\n');
  }

  async function copyBrief() {
    if (!currentBrief) return;
    await navigator.clipboard.writeText(markdown(currentBrief)); status.textContent = t('copied');
  }

  function initializeLayout() {
    const composer = $('.composer'); composer.parentNode.insertBefore(panel, composer);
    const offer = $('#review-offer'); const footer = $('footer'); footer.parentNode.insertBefore(offer, footer);
  }

  initializeLayout();
  $('#language-select').addEventListener('change', (event) => { language = event.target.value; localStorage.setItem(languageKey, language); updateStaticCopy(); });
  $('#engine-personal').addEventListener('click', () => applyEngine('personal'));
  $('#engine-fixed').addEventListener('click', () => applyEngine('fixed'));
  connectButton.addEventListener('click', connect);
  $('#new-case').addEventListener('click', newCase);
  $('#case-select').addEventListener('change', (event) => { if (event.target.value) { applyEngine('personal'); restoreCase(event.target.value); } else newCase(); });
  $('#refine-codex').addEventListener('click', () => {
    const answers = [...$('#codex-question-inputs').querySelectorAll('textarea')].map((area) => area.value.trim()).filter(Boolean);
    if (!answers.length) { status.textContent = t('answerNeeded'); return; }
    runWorkflow('clarify', { answers });
  });
  $('#revise-codex').addEventListener('click', () => {
    const changeText = $('#change-text').value.trim(); if (!changeText) { status.textContent = t('changeNeeded'); return; }
    runWorkflow('revise', { changeType: $('#change-type').value, changeText });
  });
  $('#save-codex-decision').addEventListener('click', saveDecision);
  $('#copy-codex-brief').addEventListener('click', copyBrief);
  analyzeButton.addEventListener('click', (event) => {
    if (engine !== 'personal') return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (!connected) { status.textContent = t('selected'); connectButton.focus(); return; }
    runWorkflow('initial');
  }, true);
  input.addEventListener('keydown', (event) => {
    if (engine === 'personal' && (event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); runWorkflow('initial'); }
  }, true);
  setInterval(updateExpiry, 15000);
  updateStaticCopy();
  const saved = readCases().find((item) => item.id === currentCaseId); if (saved) restoreCase(saved.id);
})();
