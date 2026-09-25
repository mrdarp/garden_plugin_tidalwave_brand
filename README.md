# Tidalwave Brand

A Digital Garden plugin that applies Tidalwave's house documentation styling and teaches the garden to understand Obsidian's List Callouts markers.

Built for an internal training-documentation garden, but nothing in it is specific to that content — any garden publishing Obsidian SOPs or procedural notes should find it useful.

## What it does

**Typography and section styling.** A light-base stylesheet with a type scale, spacing rhythm and section grammar designed for procedural reference documents — numbered procedure rails, semantic callouts, fixed-proportion revision tables, and a readable measure. Shares its structure with a companion print stylesheet so a document reads as the same document on screen and on paper.

**List Callouts support.** Obsidian's [List Callouts](https://github.com/mgmeyers/obsidian-list-callouts) plugin marks a bullet as a callout with a leading character:

```markdown
- ! Do not cut into the screen mesh.
- @ The ink number is printed on the top of the screen.
- & Refill from the dispenser on the metal shelves.
```

That convention exists only inside Obsidian. Without this plugin the marker publishes as literal text at the head of the bullet. A markdown-it rule strips it during parsing and records it on the `<li>` as a class and a `data-lc` attribute, and the stylesheet renders it back as a styled glyph in the gutter.

Stripping a leading text node is a content transform rather than a style, which is why this can't be done in CSS alone.

## Install

Paste this repository's URL into **Settings → Digital Garden → Plugins → Install from GitHub**, or copy the directory into `src/plugins/tidalwave-brand/` of your garden repo.

## Settings

| Setting | Default | Description |
|---|---|---|
| List callout markers | `!@&` | Characters treated as callout markers when they start a list item and are followed by a space. Should match what's configured in the Obsidian List Callouts plugin. |

Supported marker characters and the class each produces:

| Marker | Class | Color role |
|---|---|---|
| `!` | `lc-warning` | hazard |
| `@` | `lc-reference` | informational |
| `&` | `lc-aside` | supplementary |
| `?` | `lc-question` | supplementary |
| `~` | `lc-note` | neutral |
| `$` | `lc-success` | success |
| `%` | `lc-muted` | neutral |

Any marker not in this table still works and gets `lc-generic`.

## Theming

Colors, type scale and spacing are CSS custom properties defined at the top of `styles/tidalwave-garden.css`. Override them in your own stylesheet — everything downstream references the tokens rather than literal values.

The stylesheet sets `--dg-content-max-width` and `--dg-content-font-size` from its own tokens so the garden's layout stays in step.

> **Note on accessibility.** The brand accent `#0091E2` measures 3.4:1 against white, which fails WCAG AA for body text. The token set splits this into `--tw-accent` for rules and marks, where contrast minimums don't apply, and `--tw-accent-link` (`#0077BB`, 4.8:1) for anything that is text. If you retune the palette, keep that split.

## Behaviour notes

- The marker must be followed by a space. `!important` at the start of a bullet is left alone.
- Works in nested lists, inside blockquote callouts, and in both tight and loose list items.
- Ordered list items are handled the same way as bullets.
- Hides `.page-break` / `.page-break-label` elements, which the Obsidian Page Break plugin writes into markdown as raw HTML. Without this they publish as visible instruction text.

## Compatibility

No npm dependencies — the hook is plain JavaScript against the markdown-it instance the template already provides. Requires a Digital Garden template with plugin support.

## Licence

MIT
