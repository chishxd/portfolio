+++
title = "Escaping AI Tutorial Hell and Learning to Actually Think in Code"
date = 2026-09-09
description = "How I caught myself falling into AI tutorial hell, broke the habit to design structs and TUI layout math from scratch, and survived team Git merges."
+++

Me and two friends are building a regex parser and interactive TUI in Go for Hack Club -- basically regex101, but running directly inside the terminal using Bubble Tea.

One friend took the engine (lexer, parser, NFA matcher), the third guy was building the bridge between the two, and I took the TUI.

Early in the project, I caught myself falling into a dangerous habit that almost every junior dev is struggling with right now. I stopped it before it ruined my learning, broke the crutch, and forced myself to build the core architecture from first principles.

Here is what that trap actually looked like, how I broke out of it, and the mental models that finally made things click.

## The New "Tutorial Hell"

We all know traditional tutorial hell: watching someone build an app on YouTube, coding along, and learning nothing.

The new version is subtler: **personalized, infinitely flexible AI tutorial hell**.

When I started sketching out the TUI, I wasn't blindly copy-pasting code blocks. I was asking questions, reading the suggestions, and manually typing the code out line by line. On paper, it looked like productive engineering—my commits were atomic, the editor was moving, and my WakaTime hours were ticking up.

But a couple of hours in, I paused and tested myself on a blank buffer. My brain went completely blank. I couldn't design a struct on my own, I couldn't figure out where a test file should live, and I couldn't sketch a layout from scratch.

I realized I was just copying someone else's homework. When you retype generated code, you're only exercising **recognition memory** (_"I understand this line as I type it"_), not **generative recall** (_"I can architect this from nothing"_). The moment you hit an edge case, you're helpless without the prompt box.

I immediately killed that approach. If I was going to build this TUI, every struct, layout calculation, and test needed to originate in my own head.

Here are the concepts that actually unfroze my brain.

## 1. What Actually Goes in a Struct?

Whenever I tried to create a component, I'd freeze wondering what fields belong in a struct. Turns out I was overthinking it like some abstract OOP hierarchy.

A struct is literally just a block of memory holding variables that change together. The easiest way to think about it is three buckets:

1. **Config stuff that never changes** (max widths, fixed borders, keybindings).
2. **State that changes on keystrokes** (cursor index, is this pane focused, raw input text).
3. **Cached outputs** so you don't recompute heavy stuff every frame (match offsets, syntax error messages).

And if you don't know what to put in a struct yet? Just don't make one. Write raw variables inside a dirty test function first. The moment you find yourself passing three loose variables into multiple functions together, that's your struct telling you it exists.

## 2. Terminal UIs are Just Bounding Box Math

Designing the TUI layout was another thing that paralyzed me. 2D space feels endless until you realize terminal windows are just a finite grid of cells (Width $W$ by Height $H$).

Every layout is just two splits: vertical (stacking) and horizontal (side-by-side). You classify every box as either **Fixed** or **Stretchy**:

- **Fixed:** The header is 1 row. The regex input box is 3 rows. The status bar at the bottom is 1 row.
- **Stretchy:** The test string editor and match results take whatever height is left.

```text
Remaining Height = Total Height - (Header + Pattern Box + Footer)
Left Column Width = Total Width / 2
Right Column Width = Total Width - Left Column Width
```

Once I wrote that arithmetic out, the blank canvas vanished. It's just boxes inside boxes.

## 3. The Git Conflict Panic

Then came our first real team workflow collision.

I finished the base TUI, merged it to `main`, and started working on macro navigation on a new branch. At the exact same time, my friend branched off to build widgets. Both of our features legitimately needed new fields inside our root `AppState` struct in `app.go`.

He finished first and merged his PR into `main`.

When I went to open my PR, GitHub slapped me with the red conflict warning. My initial reaction was "wait, did we mess up the repo? How do I even update this without blowing away my branch?"

Turns out the workflow is way simpler than I thought:

1. **Stash dirty work:** If you're halfway through writing something and it doesn't compile yet, don't make a messy "wip" commit. Just `git stash`. It cleans your working directory immediately.
2. **Pull main directly into your branch:** You don't need a crazy rebase dance. Just run:

   ```bash
   git pull origin main
   ```

3. **Fix the conflict markers:** Open the file, find the `<<<<<<< HEAD` markers, and just keep _both_ additions:

   ```go
   type AppState struct {
       // my fields
       NavIndex    int
       KeyMap      map[string]string
       // my friend's field from main
       ActiveWidget WidgetType
   }
   ```

4. **Compile and test locally:** Run `go build ./...` and `go test ./...` before touching Git. If it compiles clean, `git add`, `git commit`, and push. The GitHub warning disappears.
5. Pop your unfinished work back if you stashed: `git stash pop`.

## The New Rule: The Closed-Tab Method

To actually get better (especially since I eventually want to write low-level systems code in Rust, Zig, and C++), I made a rule for myself on this project:

If I get stuck on how an API works or why an algorithm is failing, I can look it up or ask an LLM to explain the concept. **Then I have to close the tab.**

No copy-typing with the answer sitting on the second monitor. I close it, turn back to the editor, write the test case, break it, fix the off-by-one errors myself, and let my brain do the actual heavy lifting.

Currently writing the match span highlighter and unit tests by hand. It's slower, but the code is actually mine now.
