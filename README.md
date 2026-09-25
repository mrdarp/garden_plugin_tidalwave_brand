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
| List callout markers | `!@&?~$%` | Characters treated as callout markers when they start a list item and are followed by a space. |
| Revision table headers | `Version\|Date\|Author\|Change Summary` | Header row that identifies a revision-history table, so it can be given fixed column proportions. Matched case-insensitively. Empty disables it. |

### Revision tables

A table whose header row matches the configured signature gets a `tw-revision` class and fixed column proportions — narrow Version, Date and Author columns, with Change Summary taking the remainder. Without it, automatic layout gives the long summary column most of the width and squeezes the rest until "VERSION" wraps mid-word.

This is matched in the markdown rule rather than in CSS, because a revision table is identified by the *text* of its header row and CSS cannot match text. Two positional approaches failed first: a `table:last-of-type` selector that quietly matched every four-column table on the site, and a hand-written `<div>` wrapper that worked but broke Obsidian's Live Preview, which doesn't parse markdown inside raw HTML. Matching at build time keeps the markdown clean, leaves the editor alone, and is exact rather than positional.

The default is the full set the Obsidian List Callouts plugin ships, not a subset. **Leaving a marker out fails silently** — it publishes as literal text at the head of the bullet and nothing reports it — so narrowing this list is rarely what you want.

Marker, class, and the hue each gets. Colors track the Obsidian plugin's own palette so a marker reads the same in the editor as it does on the site, darkened where needed to clear WCAG AA since the glyph is text:

| Marker | Class | Colour |
|---|---|---|
| `!` | `lc-warning` | red |
| `@` | `lc-reference` | blue |
| `&` | `lc-aside` | amber |
| `?` | `lc-question` | orange |
| `~` | `lc-note` | purple |
| `$` | `lc-success` | green |
| `%` | `lc-muted` | grey |

Any other character added to the setting still works and gets `lc-generic`.

## Theming

Colors, type scale and spacing are CSS custom properties defined at the top of `styles/tidalwave-garden.css`. Override them in your own stylesheet — everything downstream references the tokens rather than literal values.

The stylesheet sets `--dg-content-max-width` and `--dg-content-font-size` from its own tokens so the garden's layout stays in step.

> **Note on accessibility.** The brand accent `#0091E2` measures 3.4:1 against white, which fails WCAG AA for body text. The token set splits this into `--tw-accent` for rules and marks, where contrast minimums don't apply, and `--tw-accent-link` (`#0077BB`, 4.8:1) for anything that is text. If you retune the palette, keep that split.

## Scoping

Content styling is scoped to `<main>`. This is deliberate and load-bearing: the garden's own interface is built from the same elements as its content — the table of contents is an `<ol>`, the file tree a `<ul>` — so unscoped rules leak into site furniture. An unscoped procedure-step counter renders its numbers on top of the sidebar links.

A reset block additionally restores theme defaults for lists and headings inside `nav`, `aside`, `header`, `footer`, and any element whose class contains `toc`, `sidebar`, `filetree`, `nav`, `graph` or `search`, in case a given template places chrome inside `<main>`.

Base typography — body font, links, code, focus rings — is intentionally global.

## Behaviour notes

- The marker must be followed by a space. `!important` at the start of a bullet is left alone.
- Works in nested lists, inside blockquote callouts, and in both tight and loose list items.
- Ordered list items are handled the same way as bullets.
- Hides `.page-break` / `.page-break-label` elements, which the Obsidian Page Break plugin writes into markdown as raw HTML. Without this they publish as visible instruction text.

## Compatibility

No npm dependencies — the hook is plain JavaScript against the markdown-it instance the template already provides. Requires a Digital Garden template with plugin support.

## Licence

MIT
