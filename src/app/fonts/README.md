# Homepage font assets

The homepage typography roles are:

- `--font-trionn-display`: Familjen Grotesk Variable Regular
- `--font-trionn-body`: Neue Haas Display Roman
- `--font-trionn-mono`: Martian Mono Light
- `--font-trionn-editorial`: PP Editorial New Ultralight (reserved; not used by the current homepage DOM)

All four roles use the same WOFF2 binaries as the reference site. They are
loaded through `next/font/local`, use `font-display: swap`, and have
font-specific Arial metric fallbacks. Display, body, and mono are preloaded
because they appear above the fold; the currently unused editorial face is not.

Familjen Grotesk and Martian Mono are distributed under the SIL Open Font
License; their notices are stored beside the binaries. Neue Haas Display and PP
Editorial New are commercial typefaces and require appropriate production-use
licenses from their respective foundries.
