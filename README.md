# Chaos Brief

A working single-page prototype that turns an ambiguous work request into a decision brief. It makes six scenario paths visible, names evidence gaps, provides acceptance criteria, and records triggers that should reopen the plan.

## Run locally

No installation is required. Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

## What to try

1. Add a vague work request (or use the realistic example).
2. Select **Generate decision brief**.
3. Click individual scenario paths to inspect their decision implications.
4. Copy the result as Markdown.

## Built with

HTML, CSS and JavaScript. Designed and implemented with Codex as part of OpenAI Build Week.

## How Codex and GPT-5.6 were used

This project was developed in Codex using the `gpt-5.6-terra` model. Codex and GPT-5.6 were used to:

- turn the initial idea into a scenario-first decision-brief workflow;
- implement and refine the HTML, CSS and JavaScript prototype;
- review the deterministic scenario logic and its Markdown export;
- test the live user flow in a browser and prepare the public demo materials.

The deployed browser application does not make an OpenAI API call. Its scenario engine is intentionally transparent and deterministic, so it does not present generated assumptions as facts.
