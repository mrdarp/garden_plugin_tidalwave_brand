"use strict";

/**
 * Tidalwave Brand — build hooks.
 *
 * Purpose
 * -------
 * Obsidian's List Callouts plugin marks a bullet as a callout by putting a
 * single character and a space at the head of the item:
 *
 *     - ! Do not cut into the screen mesh.
 *     - @ The ink number is printed on the top of the screen.
 *     - & Refill from the dispenser on the metal shelves.
 *
 * That convention exists only inside Obsidian. The garden renders the
 * markdown itself, so without this rule the marker character publishes as
 * literal text at the head of the bullet.
 *
 * Stripping a leading text node is a content transform, not a style, so CSS
 * cannot do it. This rule removes the marker during parsing and records what
 * it was on the <li> as a class and a data attribute, letting the stylesheet
 * render the marker back as a styled glyph.
 *
 * Constraints observed
 * --------------------
 * - No npm dependencies. Plugins may only require what the template already
 *   ships, so this is plain JavaScript against the markdown-it instance.
 * - Defensive throughout. A malformed token stream must never break a build.
 */

/** Marker character -> semantic name used for the CSS class. */
const KINDS = {
  "!": "warning",
  "@": "reference",
  "&": "aside",
  "?": "question",
  "~": "note",
  "$": "success",
  "%": "muted",
};

/**
 * Every marker the Obsidian List Callouts plugin ships by default.
 *
 * This deliberately covers the full set rather than only the ones currently
 * in use. A narrower default fails silently: an unlisted marker publishes as
 * literal text at the head of the bullet, and nothing anywhere reports it.
 * Requiring a following space keeps ordinary prose safe, and a sweep of the
 * vault found no bullet where a marker character plus a space was anything
 * other than a callout.
 */
const DEFAULT_MARKERS = "!@&?~$%";

/**
 * Build the core rule.
 *
 * Runs BEFORE markdown-it's `inline` rule, so the marker is removed from the
 * raw content string and the inline children are generated from the cleaned
 * text. Doing it afterwards would mean editing the token content and its
 * children in parallel and keeping them consistent.
 *
 * @param {string} markerChars Characters treated as callout markers.
 */
function createRule(markerChars) {
  const markers = new Set(String(markerChars || DEFAULT_MARKERS).split(""));

  return function tidalwaveListCallouts(state) {
    if (!state || !Array.isArray(state.tokens)) return;

    const tokens = state.tokens;

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== "list_item_open") continue;

      // A list item's text is the first inline token inside it. Loose list
      // items wrap it in a paragraph; tight ones don't.
      let j = i + 1;
      if (tokens[j] && tokens[j].type === "paragraph_open") j++;

      const inline = tokens[j];
      if (!inline || inline.type !== "inline" || typeof inline.content !== "string") {
        continue;
      }

      // One non-space character, then at least one space. Requiring the space
      // is what keeps ordinary text safe: "!important" has no space after the
      // "!" and is left alone.
      const match = /^(\S)[ \t]+/.exec(inline.content);
      if (!match) continue;

      const char = match[1];
      if (!markers.has(char)) continue;

      inline.content = inline.content.slice(match[0].length);

      const open = tokens[i];
      if (typeof open.attrJoin !== "function") continue;

      open.attrJoin("class", "lc-list-callout");
      open.attrJoin("class", "lc-" + (KINDS[char] || "generic"));
      open.attrSet("data-lc", char);
    }
  };
}

const DEFAULT_REVISION_HEADERS = "Version|Date|Author|Change Summary";

/**
 * Tag a table whose header row matches a known signature, so CSS can give it
 * fixed column proportions.
 *
 * Why this is a markdown rule rather than a selector
 * --------------------------------------------------
 * A revision table is identified by the TEXT of its header row, and CSS has
 * no way to match text. Two positional attempts failed before this one: a
 * `table:last-of-type` selector that silently matched every four-column
 * table on the site, and a hand-written `<div>` wrapper that worked but
 * broke Obsidian's Live Preview, which does not parse markdown inside raw
 * HTML blocks.
 *
 * Doing it at build time avoids both. The markdown stays clean, the editor
 * is untouched, and the match is exact rather than positional.
 */
function createTableRule(headerSignature) {
  const want = String(headerSignature || "")
    .split("|")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  if (want.length < 2) return null;

  const clean = s => String(s || "").replace(/[*_`]/g, "").trim().toLowerCase();

  return function tidalwaveRevisionTable(state) {
    if (!state || !Array.isArray(state.tokens)) return;

    const tokens = state.tokens;

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== "table_open") continue;

      const cells = [];
      let inHead = false;

      for (let j = i + 1; j < tokens.length; j++) {
        const type = tokens[j].type;
        if (type === "thead_open") { inHead = true; continue; }
        if (type === "thead_close" || type === "table_close") break;
        if (inHead && type === "inline") cells.push(clean(tokens[j].content));
      }

      if (cells.length !== want.length) continue;
      if (!cells.every((c, k) => c === want[k])) continue;

      if (typeof tokens[i].attrJoin === "function") {
        tokens[i].attrJoin("class", "tw-revision");
      }
    }
  };
}

module.exports = {
  /**
   * @param {object} md      markdown-it instance
   * @param {object} context { settings, manifest, pluginDir }
   */
  setupMarkdown(md, context) {
    const settings = (context && context.settings) || {};

    const markers = settings.markers || DEFAULT_MARKERS;
    md.core.ruler.before("inline", "tidalwave_list_callouts", createRule(markers));

    const headers = settings.revisionTableHeaders === undefined
      ? DEFAULT_REVISION_HEADERS
      : settings.revisionTableHeaders;

    const tableRule = createTableRule(headers);
    if (tableRule) {
      md.core.ruler.before("inline", "tidalwave_revision_table", tableRule);
    }
  },
};
