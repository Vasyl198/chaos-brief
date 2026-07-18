# Chaos Brief — final Devpost copy

## Tagline

Turn vague work requests into a small, testable first release — without inventing missing facts.

## Inspiration

Small teams lose time not because they cannot make plans, but because a vague first request hides the decisions that will later cause rework: who the first user is, what “working” means, which facts are unknown, what can change, and whether an existing tool is already sufficient.

## What it does

Chaos Brief is a privacy-first browser tool for the first conversation. Paste a messy request and it produces:

- an explicit next decision;
- assumptions that must be validated rather than treated as facts;
- acceptance criteria and evidence gaps;
- a local evidence board where each unknown receives an owner, due date, and verified state;
- change triggers that reopen the plan;
- a three-step first-release plan;
- six scenario paths: ordinary, competent-user, bad-data, changing conditions, workaround, and mature-alternative check.

When one request combines payment, booking, delivery, and volatile information, Chaos Brief does not pretend it is one simple release. It flags the scope, asks the team to choose one end-to-end flow, and makes the deferred work explicit.

## How we built it

The app is a dependency-free HTML, CSS, and JavaScript browser prototype. Its deterministic scenario engine recognizes operational topics such as payments, orders, fulfilment, volatile information, and primary user flows. It maps them to questions, criteria, triggers, and contextual scenario descriptions.

The draft and evidence assignments are stored locally in the browser. There is no account, server, analytics, or API call in the deployed application.

## How Codex and GPT-5.6 were used

Built in Codex with GPT-5.6 during OpenAI Build Week. Codex and GPT-5.6 were used to challenge the initial linear-plan idea, design the scenario-first workflow, implement the topic-aware rules, choose the transparent deterministic architecture, test complex requests and local draft recovery, and prepare the demo materials.

GPT-5.6 and Codex are central to the development process, while the shipped engine intentionally remains inspectable and does not present generated assumptions as certain facts.

## Challenges we ran into

The main product challenge was avoiding a polished-looking list of generic advice. We addressed it by making the detected request change the evidence, scope warning, first-release plan, assumptions, and scenario details. The second challenge was deciding where AI should stop: the app surfaces questions and choices, but does not claim that missing payment, delivery, or availability facts are true.

## Accomplishments

- A working live, no-login browser prototype.
- Topic-aware scenario analysis instead of one static happy path.
- Privacy-preserving local draft recovery, evidence ownership, and portable Markdown output.
- A clear, testable path for judges: paste one complex request and inspect the staged-release result.

## What we learned

For ambiguous work, a useful first output is not a confident answer. It is a visible boundary between facts, assumptions, evidence, and the smallest next decision.

## What's next

Add editable evidence ownership, reusable team templates, and optional integrations that preserve the same transparent, assumption-first approach.

## Links

- Live demo: https://vasyl198.github.io/chaos-brief/
- Demo video: https://youtu.be/4N-FvPZu05g
- Source: https://github.com/Vasyl198/chaos-brief
