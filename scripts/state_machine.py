"""
Triodos Goal Advisor — State Machine Diagram (fixed layout)
Portrait A4, all elements within page margins.
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.lib import colors
from reportlab.pdfgen import canvas
import math, os

GREEN      = HexColor('#004B32')
LUPINE     = HexColor('#8074FF')
BIRCH      = HexColor('#F3EDE4')
CHARCOAL   = HexColor('#222222')
GOLD       = HexColor('#B08A00')
MID_GREY   = HexColor('#AAAAAA')
LIGHT_GREY = HexColor('#DDDDDD')
WHITE      = colors.white
BG         = HexColor('#F8F5F0')

W, H   = A4                # 595 × 842 pt
MARGIN = 28
INNER  = W - MARGIN * 2   # 539

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'state-machine.pdf')

# ── Primitive helpers ──────────────────────────────────────────────────────────

def rbox(c, x, y, w, h, r=9, fill=WHITE, stroke=GREEN, sw=1.4):
    c.setFillColor(fill); c.setStrokeColor(stroke); c.setLineWidth(sw)
    c.roundRect(x, y, w, h, r, stroke=1, fill=1)

def label(c, x, y, text, size=9, bold=False, color=CHARCOAL, anchor='c'):
    c.setFont('Helvetica-Bold' if bold else 'Helvetica', size)
    c.setFillColor(color)
    if anchor == 'c':
        c.drawCentredString(x, y, text)
    elif anchor == 'l':
        c.drawString(x, y, text)

def state(c, x, y, w, h, top, sub=None, fill=WHITE, stroke=GREEN, bold=True):
    """Centred box. x,y = bottom-left corner."""
    rbox(c, x, y, w, h, fill=fill, stroke=stroke)
    cy = y + h / 2
    if sub:
        label(c, x + w/2, cy + 4,  top, bold=bold, size=9)
        label(c, x + w/2, cy - 7,  sub, size=7, color=MID_GREY)
    else:
        label(c, x + w/2, cy - 3,  top, bold=bold, size=9)

def arrowhead(c, x1, y1, x2, y2, color, size=6):
    dx, dy = x2-x1, y2-y1
    ln = math.hypot(dx, dy) or 1
    ux, uy = dx/ln, dy/ln
    lx = x2 - size*ux + size*0.38*(-uy)
    ly = y2 - size*uy + size*0.38*ux
    rx = x2 - size*ux - size*0.38*(-uy)
    ry = y2 - size*uy - size*0.38*ux
    p = c.beginPath()
    p.moveTo(x2,y2); p.lineTo(lx,ly); p.lineTo(rx,ry); p.close()
    c.setFillColor(color); c.drawPath(p, stroke=0, fill=1)

def arrow(c, x1, y1, x2, y2, lbl='', color=CHARCOAL,
          curve=0, loff=(0,5), dashed=False, lsize=7):
    c.setStrokeColor(color); c.setLineWidth(1.1)
    c.setDash([4,3] if dashed else [])
    if curve == 0:
        c.line(x1, y1, x2, y2)
        arrowhead(c, x1, y1, x2, y2, color)
        mx, my = (x1+x2)/2+loff[0], (y1+y2)/2+loff[1]
    else:
        dx, dy = x2-x1, y2-y1
        ln = math.hypot(dx, dy) or 1
        nx, ny = -dy/ln, dx/ln
        cx1 = x1+dx*0.3+nx*curve; cy1 = y1+dy*0.3+ny*curve
        cx2 = x1+dx*0.7+nx*curve; cy2 = y1+dy*0.7+ny*curve
        p = c.beginPath(); p.moveTo(x1,y1)
        p.curveTo(cx1,cy1,cx2,cy2,x2,y2); c.drawPath(p,stroke=1,fill=0)
        edx = x2-cx2; edy = y2-cy2
        arrowhead(c, x2-edx*.001, y2-edy*.001, x2, y2, color)
        mx = (x1+cx1+cx2+x2)/4+loff[0]; my = (y1+cy1+cy2+y2)/4+loff[1]
    c.setDash([])
    if lbl:
        label(c, mx, my, lbl, size=lsize, color=CHARCOAL)

def dot(c, x, y, r=7, color=CHARCOAL):
    c.setFillColor(color); c.circle(x, y, r, stroke=0, fill=1)

def endstate(c, x, y, r=7, color=CHARCOAL):
    c.setFillColor(color);  c.circle(x, y, r, stroke=0, fill=1)
    c.setFillColor(WHITE);  c.circle(x, y, r*0.5, stroke=0, fill=1)
    c.setStrokeColor(color); c.setLineWidth(2)
    c.circle(x, y, r, stroke=1, fill=0)

def zone(c, x, y, w, h, fill, stroke, title, title_color):
    c.setFillColor(fill); c.setStrokeColor(stroke); c.setLineWidth(0.8)
    c.roundRect(x, y, w, h, 10, stroke=1, fill=1)
    c.setFont('Helvetica-Bold', 7); c.setFillColor(title_color)
    c.drawString(x+10, y+h-14, title.upper())

# ── Layout constants ──────────────────────────────────────────────────────────
BW, BH = 108, 34   # standard state box
FW, FH =  80, 26   # Face ID sub-state box
SW, SH =  76, 24   # goal form sub-state box

# Column x-centres
CX1 = MARGIN + BW/2 + 12   # = 94  — auth column
CX2 = W / 2                # = 298 — main nav column
CX3 = W - MARGIN - BW/2 - 12  # = 501 — goal form column

# Row y-centres (top = high value)
R_START = 808
R_LOGIN = 755
R_FACEID= 690
R_PIN   = 617
R_HOME  = 510
R_ACCT  = 417
R_GOALS = 327
R_GOAL  = 244    # goal form box
R_SUBS  = 143    # goal form sub-states
R_END   =  50

# ── Draw ──────────────────────────────────────────────────────────────────────
c = canvas.Canvas(OUT, pagesize=A4)
c.setTitle('Triodos Goal Advisor — State Machine')

# Background
c.setFillColor(BG); c.rect(0,0,W,H,stroke=0,fill=1)

# Title
c.setFillColor(GREEN); c.setFont('Helvetica-Bold',14)
c.drawCentredString(W/2, H-26, 'Triodos Goal Advisor — App State Machine')
c.setFont('Helvetica',8); c.setFillColor(MID_GREY)
c.drawCentredString(W/2, H-40, 'All routes · authentication · form sub-states · modal layers')
c.setStrokeColor(LIGHT_GREY); c.setLineWidth(0.7)
c.line(MARGIN, H-48, W-MARGIN, H-48)

# ── Zone 1: Unauthenticated ────────────────────────────────────────────────────
zone(c, MARGIN, R_PIN-44, CX1*2-MARGIN+14, R_LOGIN+30-(R_PIN-44),
     HexColor('#EEF5E8'), HexColor('#C8DDB8'),
     '① Unauthenticated', GREEN)

# ── Zone 2: Authenticated ─────────────────────────────────────────────────────
zone(c, MARGIN, R_GOALS-44, INNER, R_HOME+26-(R_GOALS-44),
     HexColor('#F0EEFF'), HexColor('#C8C0FF'),
     '② Authenticated — Main navigation', LUPINE)

# ── Zone 3: Goal form ─────────────────────────────────────────────────────────
zone(c, MARGIN, R_SUBS-28, INNER, R_GOAL+26-(R_SUBS-28),
     HexColor('#FDF7E3'), HexColor('#E8D888'),
     '③ Goal form — /accounts/[id]/goal', GOLD)

# ── START ──────────────────────────────────────────────────────────────────────
dot(c, CX1, R_START, r=7, color=CHARCOAL)
arrow(c, CX1, R_START-7, CX1, R_LOGIN+BH/2)

# ── /login ─────────────────────────────────────────────────────────────────────
state(c, CX1-BW/2, R_LOGIN-BH/2, BW, BH,
      '/login', 'unauthenticated', fill=WHITE, stroke=GREEN)

# Face ID states — spread so leftmost is within margin
# idle: 50+FW/2=90,  scanning: 90+FW+14=184,  success: 184+FW+14=278
FX = [MARGIN+FW/2+6, MARGIN+FW/2+6+FW+16, MARGIN+FW/2+6+FW*2+32]
# FX ≈ [46, 142, 238] — all safe

fid_labels = ['idle',      'scanning', 'success']
fid_subs   = ['waiting',   '~1.5 s',   '✓']
fid_fills  = [HexColor('#EEF5E8'), HexColor('#EEF5E8'), HexColor('#C8DDB8')]

for i, (fx, fl, fs, ff) in enumerate(zip(FX, fid_labels, fid_subs, fid_fills)):
    state(c, fx-FW/2, R_FACEID-FH/2, FW, FH, fl, fs,
          fill=ff, stroke=GREEN, bold=False)

# /login → Face ID idle (left branch)
arrow(c, CX1-16, R_LOGIN-BH/2, FX[0], R_FACEID+FH/2,
      'Face ID', loff=(-22,3))

# idle → scanning → success
arrow(c, FX[0]+FW/2, R_FACEID, FX[1]-FW/2, R_FACEID, 'tap')
arrow(c, FX[1]+FW/2, R_FACEID, FX[2]-FW/2, R_FACEID, 'verified')

# success → /home (curve across to centre)
arrow(c, FX[2]+FW/2, R_FACEID,
      CX2+BW/2, R_HOME+BH/2,
      'login OK', curve=-40, loff=(28,0), color=GREEN)

# ── PIN entry ──────────────────────────────────────────────────────────────────
state(c, CX1-BW/2, R_PIN-BH/2, BW, BH,
      'PIN entry', '4 digits → login', fill=WHITE, stroke=GREEN)

# /login → PIN (right branch)
arrow(c, CX1+16, R_LOGIN-BH/2, CX1+16, R_PIN+BH/2,
      'Use PIN', loff=(22,3))

# PIN → /home
arrow(c, CX1+BW/2, R_PIN,
      CX2-BW/2, R_HOME,
      'login OK', loff=(0,6), color=GREEN)

# ── /home ──────────────────────────────────────────────────────────────────────
state(c, CX2-BW/2, R_HOME-BH/2, BW, BH,
      '/home', 'Account overview',
      fill=HexColor('#F0EEFF'), stroke=LUPINE)

# ── /accounts/[id] ─────────────────────────────────────────────────────────────
state(c, CX2-BW/2, R_ACCT-BH/2, BW, BH,
      '/accounts/[id]', 'Account detail',
      fill=WHITE, stroke=LUPINE)

arrow(c, CX2,     R_HOME-BH/2, CX2,     R_ACCT+BH/2, 'tap account')
arrow(c, CX2-16,  R_ACCT+BH/2, CX2-16,  R_HOME-BH/2,
      'back', curve=20, loff=(-20,0))

# ── /goals ─────────────────────────────────────────────────────────────────────
state(c, CX2-BW/2, R_GOALS-BH/2, BW, BH,
      '/goals', 'Goals list', fill=WHITE, stroke=LUPINE)

arrow(c, CX2+16,  R_ACCT-BH/2, CX2+16,  R_GOALS+BH/2, 'See goals', loff=(24,3))
arrow(c, CX2-16,  R_GOALS+BH/2, CX2-16,  R_ACCT-BH/2,
      'back', curve=20, loff=(-20,0))

# ── /accounts/[id]/goal ────────────────────────────────────────────────────────
state(c, CX3-BW/2, R_GOAL-BH/2, BW, BH,
      '/accounts/[id]/goal', 'Set / edit goal',
      fill=WHITE, stroke=GOLD, bold=True)

# Account detail → goal form
arrow(c, CX2+BW/2, R_ACCT,
      CX3-BW/2,    R_GOAL,
      'Set savings goal', loff=(0,7), color=GOLD)

# goal form → /goals (save)
arrow(c, CX3-BW/2, R_GOAL,
      CX2+BW/2,    R_GOALS,
      'Save goal', loff=(0,-9), color=GREEN)

# goal form → back (close ✕) → account detail
arrow(c, CX3, R_GOAL+BH/2,
      CX2+BW/2, R_ACCT,
      'Close ✕', curve=-28, loff=(20,0))

# /goals → edit goal (dashed)
arrow(c, CX2+BW/2, R_GOALS,
      CX3-BW/2,    R_GOAL+BH/2,
      'edit goal', dashed=True, loff=(0,5), color=MID_GREY)

# ── Goal form sub-states (spread across bottom zone) ──────────────────────────
# 4 boxes, evenly spaced across INNER width with margin
sub_labels = ['Saving',         'Investing',     'Transition\nmodal', 'Fund rec']
sub_subs   = ['goal type',      'goal type',     'chip tap',          'AI / fallback']
sub_fills  = [WHITE,            HexColor('#F0EEFF'), HexColor('#FDF7E3'), HexColor('#F0EEFF')]
sub_colors = [GREEN,            LUPINE,          GOLD,                LUPINE]

# x centres for 4 boxes spread evenly
pad = MARGIN + SW/2 + 4
gap = (INNER - SW * 4 - 8) / 3
sx_list = [pad + i*(SW + gap + 8/3) for i in range(4)]
# recalculate: total = 4*SW + 3*gap; gap = (INNER-4*SW)/3 - tiny
total_sw = 4 * SW
gap_real = (INNER - total_sw - 8) / 3   # leave 8pt extra breathing room
sx_list = [MARGIN + SW/2 + 4 + i * (SW + gap_real) for i in range(4)]

for i, (sx, sl, ss, sf, sc) in enumerate(
        zip(sx_list, sub_labels, sub_subs, sub_fills, sub_colors)):
    rbox(c, sx-SW/2, R_SUBS-SH/2, SW, SH, r=8, fill=sf, stroke=sc, sw=1.1)
    lines = sl.split('\n')
    c.setFont('Helvetica-Bold', 7.5); c.setFillColor(CHARCOAL)
    if len(lines) == 2:
        c.drawCentredString(sx, R_SUBS+3, lines[0])
        c.drawCentredString(sx, R_SUBS-5, lines[1])
    else:
        c.drawCentredString(sx, R_SUBS+1.5, sl)
    c.setFont('Helvetica', 6.5); c.setFillColor(MID_GREY)
    c.drawCentredString(sx, R_SUBS-11, ss)

# Goal form box → sub-states (dashed fan)
for sx in sx_list:
    arrow(c, CX3, R_GOAL-BH/2, sx, R_SUBS+SH/2,
          dashed=True, color=LIGHT_GREY)

# Toggle Saving ↔ Investing
arrow(c, sx_list[0]+SW/2, R_SUBS+4,   sx_list[1]-SW/2, R_SUBS+4,   'toggle', loff=(0,5))
arrow(c, sx_list[1]-SW/2, R_SUBS-4,   sx_list[0]+SW/2, R_SUBS-4,   '', curve=6)

# Investing → Fund rec (conditional)
arrow(c, sx_list[1]+SW/2, R_SUBS,  sx_list[3]-SW/2, R_SUBS,
      'name filled', dashed=True, loff=(0,5), color=LUPINE)

# Transition modal open/close note
c.setFont('Helvetica-Oblique', 6.5); c.setFillColor(GOLD)
c.drawCentredString(sx_list[2], R_SUBS-20, '← open / close →')

# ── END state ──────────────────────────────────────────────────────────────────
endstate(c, CX2, R_END, r=7)
arrow(c, CX2, R_GOALS-BH/2, CX2, R_END+7,
      'logout / session end', dashed=True, color=MID_GREY, loff=(36,0))

# ── Legend ─────────────────────────────────────────────────────────────────────
LX, LY = W - MARGIN - 186, 24
c.setStrokeColor(LIGHT_GREY); c.setFillColor(WHITE); c.setLineWidth(0.7)
c.roundRect(LX, LY-8, 182, 64, 6, stroke=1, fill=1)
c.setFont('Helvetica-Bold', 7); c.setFillColor(CHARCOAL)
c.drawString(LX+8, LY+44, 'LEGEND')
legend_items = [
    (GREEN,  'Authenticated route / login action'),
    (LUPINE, 'Navigation / goal type'),
    (GOLD,   'Goal form / transition theme'),
    (MID_GREY,'Dashed = conditional / optional'),
]
for i, (col, lbl) in enumerate(legend_items):
    iy = LY+32 - i*13
    c.setFillColor(col); c.rect(LX+8, iy, 16, 8, stroke=0, fill=1)
    c.setFillColor(CHARCOAL); c.setFont('Helvetica', 7)
    c.drawString(LX+30, iy+1, lbl)

# ── Footer ─────────────────────────────────────────────────────────────────────
c.setFont('Helvetica', 7); c.setFillColor(MID_GREY)
c.drawCentredString(W/2, 16,
    'Triodos Goal Advisor · Next.js 14 App Router · State Machine Overview')

c.save()
print(f'PDF → {os.path.abspath(OUT)}')
