+++
title = "Random"
description = "Books, problems, and whatever I picked up along the way."
sort_by = "date"
template = "random.html"
+++

A junk drawer for anything I want to write down. A book I am reading, a DSA
problem I worked through, something I learned in Rust or Svelte last week. It
all lands in the same list and gets divided up by tags instead of folders, so
if an entry fits two categories it shows up in both. Nothing here is organised
by topic on purpose - the tags do that job.

There is no nav entry for this. Find it from the [homepage](@/_index.md).

<div class="random-howto">
<details>
<summary>Adding an entry(Cuz I forget how to do this later)</summary>

Create a file under <code>content/random/</code>. Only <code>title</code>,
<code>date</code> and <code>tags</code> are required.

A **reading** entry:

```toml
+++
title = "A Game of Thrones"
date = 2026-09-28
description = "One line on what it is."

[taxonomies]
tags = ["reading", "fiction"]

[extra]
author = "George R. R. Martin"
link = "https://..."      # where it lives
status = "reading"        # reading / finished / dropped
+++
```

A **problem** entry:

```toml
+++
title = "Two Pointers"
date = 2026-09-28
description = "One line on the problem."

[taxonomies]
tags = ["dsa", "arrays"]

[extra]
difficulty = "easy"       # easy / medium / hard
problem = "https://..."   # link to the problem
related = ["other-slug"]  # slugs of related entries
+++
```

`tags` lives in its own <code>[taxonomies]</code> table because Zola reads it
to build the tag pages. Everything in <code>[extra]</code> is optional and
only shows up if it is set, so a half-filled entry still builds.

</details>
</div>
