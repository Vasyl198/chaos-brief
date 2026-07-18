# Chaos Brief — updated 60-second demo script

## 0–8s — the problem

Show the empty screen.

> A vague request can look actionable while hiding the facts that cause rework later. Chaos Brief makes those unknowns visible before a team commits more work.

## 8–22s — one realistic, complex request

Paste: `Launch a booking page next week with payment, delivery, menu availability, and phone updates.` Then press **Ctrl/Cmd + Enter**.

> This request contains several operational concerns. Instead of treating it as one release, the app identifies the scope and asks for one testable end-to-end first flow.

## 22–38s — first-release plan and assumptions

Show the staged-release signal, the three first-release steps, and assumptions.

> It separates assumptions from facts: delivery, payment, and availability are not claimed as true. They are visible conditions to validate with the owner and a real user.

## 38–50s — scenario interaction

Click **Bad-data path**, then **Mature-alternative check**.

> Each path changes with the request. If facts are missing, the work stops for evidence. If an existing tool meets the same criteria more cheaply, that is a valid result.

## 50–60s — Codex and GPT-5.6 disclosure

> I built Chaos Brief in Codex with GPT-5.6. They helped challenge the original linear plan, implement and test the scenario-first workflow, and make the key design decision: keep the shipped engine transparent instead of inventing certainty from a vague prompt.
