Add-Type -AssemblyName System.Speech
$voice = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voice.Rate = -1
$voice.SetOutputToWaveFile((Join-Path $env:USERPROFILE 'Videos\chaos-brief-narration.wav'))
$voice.Speak(@'
Chaos Brief converts vague work requests into decision-ready plans. Here, a bakery request becomes an explicit brief. The prototype reveals acceptance criteria and evidence gaps. Instead of one optimistic plan, it checks six scenarios, including changing conditions and cheaper existing alternatives. The result can be copied as Markdown for a client or team review. I developed this project in Codex with GPT-5.6. Codex and GPT-5.6 helped shape the scenario-first workflow, implement and validate the JavaScript, and test the working browser flow. The deployed app deliberately uses a transparent deterministic engine, not an OpenAI API call.
'@)
$voice.Dispose()
