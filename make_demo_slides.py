from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

out = Path.home() / 'Videos' / 'chaos-brief-slides'
out.mkdir(exist_ok=True)
font = 'C:/Windows/Fonts/arial.ttf'
bold = 'C:/Windows/Fonts/arialbd.ttf'
def slide(n, eyebrow, title, lines, accent='#c7ff5e'):
    im=Image.new('RGB',(1280,720),'#101426'); d=ImageDraw.Draw(im)
    d.ellipse((900,-130,1440,410),fill='#232b53'); d.rectangle((60,70,66,650),fill=accent)
    d.text((100,92),eyebrow,font=ImageFont.truetype(bold,18),fill=accent)
    y=175
    for part in title.split('\n'):
        d.text((100,y),part,font=ImageFont.truetype(bold,57),fill='#edf0ff'); y+=70
    y+=22
    for line in lines:
        d.text((106,y),'•  '+line,font=ImageFont.truetype(font,27),fill='#bec7e5'); y+=50
    d.text((100,664),'CHAOS BRIEF  ·  vasyl198.github.io/chaos-brief',font=ImageFont.truetype(font,16),fill='#7f89aa')
    im.save(out/f'{n:02d}.png')
slide(1,'OPENAI BUILD WEEK','Make vague work\ndecision-ready.', ['A working scenario-aware decision brief prototype.','Built in Codex with GPT-5.6; public code and live demo are available.'])
slide(2,'1. INPUT','Start with a\nmessy request.', ['Example: launch a booking page for a small bakery.','Chaos Brief keeps unknowns visible instead of inventing facts.'])
slide(3,'2. SCENARIOS','Check six paths\nbefore committing.', ['Ordinary path and competent-user path.','Bad data, changing conditions and a workaround.','Mature-alternative check: do not rebuild what already works.'])
slide(4,'3. OUTPUT','Leave with a\ndecision brief.', ['Next decision, evidence gaps and acceptance criteria.','Change triggers reopen the plan when reality changes.','Copy as Markdown for a client or team review.'])
