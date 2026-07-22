# Chaos Brief Local Operator

Private localhost mode that uses the installed Codex app-server and the
existing ChatGPT login. It does not use or require an OpenAI API key.

```powershell
npm test
npm start
```

Open `http://127.0.0.1:4183`. The server binds only to loopback. Each analysis
uses an ephemeral, read-only Codex thread with approvals disabled, no project
workspace access, no configured MCP servers, and a strict structured-output
schema. Do not publish this operator server or bind it to a public interface.

For a one-click Windows launch, run `..\start-local-operator.ps1` from
PowerShell. It starts the server in the background, waits for a successful
health response, and opens the local page.

The public-page bridge is disabled after every server start. It can be enabled
from the local operator page for 30 minutes and accepts only
`https://vasyl198.github.io`. For local browser testing only, override that
exact origin with `CHAOS_BRIEF_PUBLIC_ORIGIN`; never use a wildcard.
