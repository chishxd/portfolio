+++
title = "Fixing Sphinx's Hyphen-Eating Search"
date = 2026-09-01
description = "Debugging why Sphinx search ignored CLI flags like -v and --force, and fixing the Python tokenizer using regex negative lookbehinds."
+++

So Sphinx's search was doing this annoying thing where searching for `-v`
or `--force` just... returned nothing. Even in docs that literally have
those exact flags written out.

### The Mystery: Python Indexer vs JavaScript Search

My first instinct was to go poke the JS search code since, well, that's
what actually runs the query right. But that's only treating the symptom
lol, by the time a query even reaches the JS side, the index has ALREADY
lost the hyphens. Turns out the Python indexer was stripping leading
hyphens before terms even got stored. So `-v` was being indexed as just
`v`, and no amount of JS fixing was ever gonna find that.

### Flags vs Compound Words

Real fix had to happen on the Python side, regex change. The annoying part
was telling apart something like `-v` (a flag, keep the hyphen) from the
hyphen inside `extra-curricular` (a compound word, don't treat it special).
Those two cases look kinda similar but need totally different handling...

This is what led me to **negative lookbehind**, which I'd genuinely never used
before. `(?<!pattern)` basically checks "hey is this pattern NOT sitting
right before me" without actually consuming any characters. Zero width
check, so it doesn't eat part of what you're trying to match.

### The Regex Fix

Ended up with this:

```regex
(?<!\w)-{1,2}\w[\w-]*|\w+
```

Reading it out... match one or two hyphens followed by a word character
(and then whatever word/hyphen stuff after), BUT only if there's not
already a word character sitting right before those hyphens. That's what
kicks out the `extra-curricular` case while still letting `-v` and
`--force` through clean. The `|\w+` at the end is just... normal word
matching for everything that isn't hyphen-flag-shaped.

PR's up against Sphinx now. Fingers crossed for review lol.
