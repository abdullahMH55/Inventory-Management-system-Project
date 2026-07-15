# Design

The system is named **warehouse ledger**: warm paper surfaces, structure carried by hairline rules rather than nested boxes, numerals treated as the primary content.

Source of truth for every token is [frontend/src/index.css](frontend/src/index.css). This document explains the choices; the CSS is what ships.

## Color

**Strategy: restrained.** Warm-tinted neutrals plus a single accent. All values are OKLCH. No `#000`, no `#fff`, ever: every neutral carries a trace of the paper hue (~85) so surfaces sit together instead of glaring.

| Role | Light | Note |
|---|---|---|
| `--background` | `oklch(0.985 0.004 85)` | warm paper |
| `--panel` | `oklch(0.955 0.005 80)` | second neutral layer for chrome (sidebar, topbar) |
| `--primary` | `oklch(0.45 0.13 340)` | plum |
| `--rule` | `oklch(0.86 0.007 80)` | hairline, one step stronger than `--border` |

**Why plum.** The accent sits far from red/amber/green on the hue wheel *on purpose*. Those three hues are reserved:

| Token | Meaning |
|---|---|
| `--stock-out` (red) | out of stock |
| `--stock-low` (amber) | at or below the low-stock threshold |
| `--stock-ok` (green) | healthy |

An accent that collides with a status colour makes every status ambiguous. This is the standard inventory-dashboard mistake and the reason the obvious blue/navy accent was rejected. The accent is for primary actions, current selection, and focus rings. It is never decoration.

Dark mode exists and is complete, but light is the default. See the scene in [PRODUCT.md](PRODUCT.md).

## Typography

One family: **Inter Variable** (self-hosted via `@fontsource-variable`, no external requests). Fixed rem scale, ratio ~1.2. No fluid clamp headings; users view at a consistent DPI and a shrinking heading looks worse, not better.

**JetBrains Mono Variable** carries money and quantities via the `numeric` utility. Mono for figures is legitimate in a tool and it is what makes a column of numbers scannable. It never appears in labels, buttons, or prose.

`font-variant-numeric: tabular-nums` is set globally on `body`, so even sans figures hold their columns.

## Layout

- **The stat row is one ruled band divided by vertical hairlines**, not four cards. Cards are the lazy answer and identical card grids are banned; a band reads as one instrument with several dials.
- Structure comes from rules and background tints. Nested cards are never correct.
- Predictable grid, standard chrome (sidebar + topbar). Familiarity is a feature here; the tool should disappear into the task.
- Responsive behaviour is structural: the sidebar collapses to a sheet under `md`. Typography does not fluidly resize.

## Motion

150–250ms, `--ease-out-quart` (`cubic-bezier(0.25, 1, 0.5, 1)`). No bounce, no elastic, no page-load choreography. Motion conveys state change and nothing else. `prefers-reduced-motion` is honoured globally in `@layer base`.

## Components

Base UI primitives via shadcn (`src/shared/components/ui/`), re-themed to these tokens. Every interactive component ships all of default, hover, focus, active, disabled, loading, error. Loading is a **skeleton at the final geometry**, never a spinner in the middle of content, so nothing reflows when data lands.

## Bans

Enforced, not aspirational: no hero-metric template, no identical card grids, no gradient text, no side-stripe borders, no decorative glassmorphism, no modal as a first thought, no decorative motion, no display fonts in UI labels.
