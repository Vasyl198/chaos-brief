# Chaos Brief

**Turn a vague work request into a small, testable first release — without pretending missing facts are known.**

[Live demo](https://vasyl198.github.io/chaos-brief/) · [60-second video](https://youtu.be/agFDRdfhyo0) · [Devpost project](https://devpost.com/software/chaos-brief)

## The problem

Small teams often start from a sentence such as “we need a booking page next week.” A linear plan then hides the questions that cause rework: Who is the first user? What proves the flow works? Which facts are unknown? What changes would invalidate the plan? Is a mature tool already enough?

Chaos Brief is a privacy-first browser prototype for this first conversation. It turns the request into a decision brief with explicit assumptions, evidence gaps, acceptance criteria, change triggers, a three-step first-release plan, and six paths that test the plan against reality.

## Try it in 30 seconds

1. Open the [live demo](https://vasyl198.github.io/chaos-brief/).
2. Paste: `Launch a booking page next week with payment, delivery, menu availability, and phone updates.`
3. Press **Ctrl/Cmd + Enter**.
4. See the scope warning, choose one end-to-end first-release flow, inspect a scenario, and copy the brief as Markdown.

The draft stays in the browser on that device. No account, server, analytics, or API key is required.

## What is implemented

- Topic-aware deterministic rules for payments, orders/bookings, fulfilment, volatile information, and primary user flows.
- Explicit assumptions instead of invented facts.
- Six scenario paths: ordinary, competent-user, bad-data, changing conditions, workaround, and mature-alternative check.
- Scope-staging when a request combines three or more operational concerns.
- Acceptance criteria, evidence requests, change triggers, and a concrete three-step first-release plan.
- Evidence ownership: assign a role, due date, and verified state to each unanswered question; assignments remain local to the browser and are included in the Markdown export.
- Local draft restoration, keyboard-first analysis, and portable Markdown export.

## Why deterministic rules?

The design decision is deliberate: an intake tool should not manufacture certainty from one vague sentence. The engine only maps detected topics to questions and testable conditions. It flags assumptions for a human to validate, rather than asserting that payment support, delivery coverage, or product availability exists.

## Run locally

No installation is required. Open `index.html` directly, or serve the folder:

```bash
npx serve .
```

## Verification path

Use the sample above and verify that the app shows:

- `Scope: staged release needed`;
- `Choose one end-to-end flow for the first release`;
- three first-release steps;
- assumptions to validate;
- scenario text that references the detected request focus.
- three evidence rows where an owner and a due date can be assigned.

The core script can also be checked with:

```bash
node --check app.js
git diff --check
```

## How Codex and GPT-5.6 were used

This project was developed during OpenAI Build Week in Codex with GPT-5.6.

Codex and GPT-5.6 were used substantively to:

1. challenge the original one-path product idea with scenario branches and failure modes;
2. turn that product reasoning into the topic-aware browser implementation;
3. choose the privacy-preserving deterministic architecture instead of presenting generated assumptions as facts;
4. iteratively test complex requests, local draft recovery, keyboard flow, and Markdown export;
5. prepare the demo, project narrative, and visual materials.

The shipped browser app does not call an OpenAI API. GPT-5.6 and Codex were used to build, test, and refine the product; the deployed decision engine remains transparent and inspectable.

## Built with

Vanilla HTML, CSS, and JavaScript. No framework, backend, or external runtime dependency.

## License

MIT. See [LICENSE](LICENSE).
