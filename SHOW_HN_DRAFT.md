# Show HN draft — Chaos Brief

## Title

Show HN: Chaos Brief — turn a vague work request into branches, evidence gaps, and one next decision

## URL

https://vasyl198.github.io/chaos-brief/

## Maker comment

I built Chaos Brief because vague requests often become linear plans too early: a launch request can quietly combine payments, availability, delivery, ownership, and a deadline. A plan can look reasonable while still hiding the decision that should be made first.

Paste a real request and the prototype exposes six paths: ordinary, competent-user, bad-data, changing-conditions, workaround, and mature-alternative. It then suggests a smallest first release, acceptance criteria, evidence to get first, and triggers for reopening the plan.

It is a static prototype: no signup and no server-side account. Decisions, evidence ownership, and test observations stay in the current browser. You can export a decision brief or observed test log as Markdown.

I would value critical feedback on three things:

1. Does the first decision become clearer than it was from the original request?
2. Which scenario path is missing or redundant for real work?
3. Would you trust the suggested first release enough to use it in a team discussion?

The source is here: https://github.com/Vasyl198/chaos-brief

## Honest answers for likely questions

### Is this AI?

No. The current prototype uses explicit scenario rules rather than sending requests to an LLM. That makes the output inspectable, but it also means coverage is intentionally limited.

### Who is it for?

People turning an ambiguous work or product request into a first testable decision: solo makers, small teams, and people preparing a first release.

### What does it not do?

It does not prove market demand, generate factual research, assign tasks to a team, or replace a project manager. It makes assumptions and evidence gaps visible so the user can investigate them.

### What would make it better?

Examples of real requests where it gives a poor first decision, missing paths, or criteria that are too generic. Concrete counterexamples are more valuable than compliments.
