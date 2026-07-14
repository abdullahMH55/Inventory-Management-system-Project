# Product

**register: product**

## What this is

A single-operator inventory management system. One account owns its own products, categories, customers, suppliers, sales, and purchases; the API enforces that isolation on every query. There is no team, no admin, no role hierarchy.

## Users

A shop or small-warehouse owner who is also the person doing the counting. They are not an analyst and they are not sitting in a dashboard all day. They open this between other tasks to answer a specific question:

- What is about to run out?
- What did I sell recently?
- What is my stock actually worth?

They know their own inventory better than the software does. The software's job is to remember quantities and surface the one thing they forgot, not to explain their business back to them.

## The scene

9am, a bright backroom, laptop open on a cluttered desk, glancing at the screen between customers. Not a dim room, not a wall of monitors, not an incident at 2am. This forces a **light default theme** and a layout that answers a question in one glance rather than rewarding study.

## Tone

Plain and specific. Numbers over adjectives. The interface states quantities and dates; it does not congratulate, and it does not editorialise ("Great job!", "You're crushing it"). An empty inventory is a normal starting condition, not a failure state.

## Anti-references

- **The dark navy ops console.** Grafana, Datadog, every "inventory dashboard" template. Wrong scene, wrong time of day, wrong user.
- **The 4-up grid of identical stat cards** with a big number and a green percentage delta. Nothing here has a meaningful period-over-period comparison, so the delta would be decoration.
- **Marketing-SaaS warmth.** Gradients, illustrations, celebratory microcopy. This is a tool, not a product page.

## Strategic principles

1. **The numerals are the content.** Everything else is scaffolding for them. They are monospaced, tabular, and aligned in columns.
2. **Status colour is reserved.** Red, amber, and green mean out-of-stock, low, and healthy. They never appear as decoration, which is why the brand accent is plum and sits nowhere near them.
3. **Density is a service, not a burden.** This user wants more rows visible, not more whitespace.
4. **Say what is true.** The API has no concept of a cancelled sale and no reorder point, so the UI must not imply it has either. Labels are honest about what a number actually is ("total sales value, all time", "≤ 10 units").
