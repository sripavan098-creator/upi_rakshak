# The Notice — UPI Rakshak Design System

## Design Philosophy

**Rakshak means the one who stands guard** — the person at the gate, not an abstract shield. The scams it fights work by *impersonating officialdom*: fake discom notices, fake bank handles, urgent government-sounding language. So the counter-signal has to read as more legibly official than the scam does.

**The alert is the product.** Everything around it should be quiet so the alert can shout.

## Visual Language: Indian Public Notice

The design draws from the visual world of Indian official documents:
- **Manila ledger stock** (`#E9E7DB`) — the paper of government records
- **Registrar's green-black ink** (`#1B2A21`) — the ink of official stamps
- **Rubber-stamp vermilion** (`#C2241B`) — used on *nothing but live threats*
- **BBPS green** (`#138808`) — the official color of safe payment actions

This is not a dark-mode crypto app. This is a public notice.

## Typography

| Role | Font | Usage |
|------|------|-------|
| **Signage** | Archivo (700) | Headlines, verdicts, stamp text |
| **Legal** | Source Serif 4 | Body text, explanations, reasons |
| **Devanagari** | Noto Serif Devanagari | Hindi text — first-class, not an afterthought |
| **Machine** | IBM Plex Mono | Rule codes, UPI handles, timestamps — *only* for actual machine evidence |

## Color Tokens

```css
/* Core Palette */
--paper: #E9E7DB;           /* Manila ledger stock */
--ink: #1B2A21;             /* Registrar's green-black ink */
--stamp-red: #C2241B;       /* Rubber-stamp vermilion — LIVE THREATS ONLY */
--bbps-green: #138808;      /* BBPS official green — safe actions */
--seal-gold: #B8860B;       /* Official seal gold — verdicts */

/* Semantic */
--safe: var(--bbps-green);
--warning: #D97706;
--danger: var(--stamp-red);
```

**Critical rule:** Stamp-red is reserved for active threats. It never appears in navigation, buttons, or decorative elements. When you see red, you know something is wrong *right now*.

## Shape Language

**Zero radius everywhere except the phone.**

A phone is a physical object. Everything else is paper, ink, and stamps. This creates a clear visual hierarchy: the phone is the artifact, the rest is documentation.

```css
--radius-none: 0;
--radius-phone: 2rem;  /* Only the phone mockup */
```

## Signature Moment: The Interception Timeline

The hero section shows the interception itself, made scrollable:

1. A sticky phone holds the real scam message from the README
2. As you scroll the three rules, each incriminating phrase underlines itself in stamp-red
3. The millisecond counter ticks: 0 → 40 → 120 → 190
4. The overlay slides down
5. A FRAUD seal lands off-axis
6. The verdict panel rises

**The judges watch the mechanism run rather than reading a claim that it does.**

## Cash Flow: Physical Ruler

Not a Recharts area chart. Days as measured length, bills as notches, a hatched cut-off you can drag by adding a hypothetical EMI and watch collapse.

```
Day 0 ─────── Day 5 ─────── Day 10 ─────── Day 15
            [Rent]                    [EMI]
                                      ↓
                              You run out here
```

## Loan Comparison: Receipt

Not "45% effective APR" — that means nothing to most users.

**"₹1,450 out of your account"** — that means everything.

The loan comparison is a receipt with every fee itemised:
```
Principal:        ₹10,000
Interest:          ₹1,200
Processing Fee:    ₹200
Flat Fee:           ₹50
────────────────────────
Total Repayment:  ₹11,450
```

## Credibility: What We Have Not Proved Yet

A whole section titled *What we have not proved yet*, set as a two-column ledger.

Award rubrics and hackathon judges both score content credibility. A Stage 1 submission that names its own gaps is far more persuasive than one that doesn't.

```
┌─────────────────────────────────┬─────────────────────────────────┐
│ What we have proved             │ What we have not proved yet     │
├─────────────────────────────────┼─────────────────────────────────┤
│ 200+ fraud patterns detected    │ Real user testing (0 users)     │
│ <200ms overlay on iQOO 15       │ False positive rate (unknown)   │
│ 22 Indian languages supported   │ Long-term retention (0 days)    │
│ 17 unit tests passing           │ Production deployment (Stage 1) │
└─────────────────────────────────┴─────────────────────────────────┘
```

## Accessibility

- **Keyboard navigable** — all interactive elements reachable via Tab
- **Reduced motion aware** — respects `prefers-reduced-motion`
- **High contrast** — paper/ink theme exceeds WCAG AA
- **Screen reader friendly** — semantic HTML, ARIA labels on interactive elements

## Mobile-First

The design is recomposed for mobile rather than stacked. The phone mockup becomes the full viewport on small screens. The timeline becomes vertical. The ruler becomes a progress bar.

## iQOO Hyderabad Context

For the iQOO battle on the 26th, the phone-first angle deserves to be much louder:

1. **The phone is the hero** — it's not a mockup, it's the actual device
2. **The overlay is the product** — show it happening in real-time
3. **The iQOO 15 is the platform** — mention OriginOS 6, API 36, Funtouch survival
4. **The demo is live** — not a video, not a screenshot, a live interception

## Implementation Notes

- **Framer Motion** — only for the interception timeline, everything else is CSS
- **No dark mode by default** — the paper/ink theme is the identity
- **Voice button** — uses real `speechSynthesis`, not a fake animation
- **Phone overlay** — labelled as recreation, not a real screenshot
- **Loan figures** — labelled as illustrations, not real calculations

## Why This Wins

1. **It's not generic** — no other team will have a public notice aesthetic
2. **It's strategically sound** — the alert stands out because everything else is quiet
3. **It's culturally grounded** — Indian official documents, not Silicon Valley SaaS
4. **It's honest** — names its own gaps, labels its recreations
5. **It's memorable** — judges will remember "the one that looked like a government notice"

## Files

- `src/styles/the-notice.css` — Design tokens and base styles
- `src/components/InterceptionTimeline.tsx` — The signature moment
- `src/components/CashFlowRuler.tsx` — Physical ruler visualization
- `src/components/LoanReceipt.tsx` — Itemised fee breakdown
- `src/components/CredibilityLedger.tsx` — What we have/haven't proved

---

**The notice is served. The guard is posted. The scam ends here.**
