$ErrorActionPreference = 'Stop'
$operator = Join-Path $PSScriptRoot 'local-operator'
$url = 'http://127.0.0.1:4183'
$listener = Get-NetTCPConnection -LocalPort 4183 -State Listen -ErrorAction SilentlyContinue

if (-not $listener) {
  Start-Process -FilePath 'node.exe' -ArgumentList 'server.mjs' -WorkingDirectory $operator -WindowStyle Hidden
  $ready = $false
  for ($attempt = 0; $attempt -lt 20; $attempt++) {
    Start-Sleep -Milliseconds 250
    try {
      if ((Invoke-WebRequest -UseBasicParsing "$url/api/session" -TimeoutSec 2).StatusCode -eq 200) { $ready = $true; break }
    } catch {}
  }
  if (-not $ready) { throw 'Chaos Brief Local Operator did not start.' }
}

Start-Process $url
