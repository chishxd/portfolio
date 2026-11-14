+++
title = "Escaping AI Tutorial Hell and Learning to Actually Think in Code"
date = 2026-09-09
description = "How I caught myself falling into AI tutorial hell, broke the habit to design structs and TUI layout math from scratch, and survived team Git merges."
[taxonomies]
tags = ["learning", "ai", "tui", "git"]
+++

Two friends and I are building a regex parser and interactive TUI in Go for Hack Club-- basically regex101,
but running directly inside the terminal using Bubble Tea.

One took the engine (lexer, parser, NFA matcher), the second built the bridge between the two, and I took the TUI.

Early in the project, I caught myself falling into a dangerous habit that almost every junior dev 
is struggling with right now. I stopped it before it ruined my learning, broke the crutch, and forced 
myself to build the core architecture from first principles.

<!-- more -->

Here is what that trap actually looked like, how I broke out of it, and the mental models that finally made things click.

---

## The New "Tutorial Hell"

We all know traditional tutorial hell: watching someone build a clone on YouTube, typing along with them, and walking away having learned almost nothing.

The new version is subtler: **personalized, infinitely flexible AI tutorial hell**.

When I started sketching out the TUI, I wasn't blindly copy-pasting code blocks. I was asking questions, reading the explanations, and manually typing the code out line-by-line. On paper, it looked like productive engineering—my commits were atomic, the editor was moving, and my WakaTime hours were ticking up.

Then, a couple of hours in, I paused and tested myself on a blank buffer. 

My brain went completely blank. I couldn't design a clean struct on my own, I couldn't decide where a test file should live, and I couldn't sketch a layout from scratch.

I realized I was just copying someone else's homework. When you retype generated code, you're only exercising **recognition memory** (*"I understand this line as I read and type it"*), not **generative recall** (*"I can architect this structure from nothing"*). The moment you hit an unprompted edge case, you're helpless without the text box.

I immediately killed that workflow. If I was going to build this TUI, every struct, layout calculation, and test needed to originate in my own head.

Here are the concepts that actually unfroze my brain.

---

## 1. What Actually Goes in a Struct?

Whenever I tried to create a component, I'd freeze wondering what fields belonged inside a struct. I was overthinking it like some abstract, academic OOP hierarchy.

In reality, a struct is just a contiguous block of memory holding variables that change together. The easiest mental model for a TUI component is three simple buckets:

1. **Static config that never changes** (maximum widths, fixed border styles, keybinding definitions).
2. **State that changes on keystrokes** (cursor position, active focus flags, raw input text).
3. **Cached outputs** so you don't recompute heavy work every frame (regex match byte-offsets, syntax error messages).

And if you don't know what to put in a struct yet? **Don't make one.** Write raw, loose variables inside a dirty test function first. The moment you find yourself repeatedly passing the same three loose variables into multiple functions together, that's your struct announcing its own existence.

---

## 2. Terminal UIs are Just Bounding Box Math

Designing a 2D layout on a blank screen paralyzed me until I realized terminal windows aren't infinite canvases—they are just a fixed grid of character cells (width `W` by height `H`).

Every terminal interface is composed of just two primitives: vertical splits (stacking rows) and horizontal splits (columns). From there, you classify every box as either **Fixed** or **Stretchy**:

* **Fixed:** The header is always 1 row. The regex pattern input is 3 rows. The status bar at the bottom is 1 row.
* **Stretchy:** The test string editor and match results take whatever height remains.

```text
Remaining Height   = Total Height - (Header + Pattern Box + Footer)
Left Column Width  = Total Width / 2
Right Column Width = Total Width - Left Column Width
```

The moment I wrote that basic arithmetic down on paper, the blank-canvas anxiety vanished. It's just boxes inside boxes.

---

## 3. The Git Conflict Panic

Then came our first real team workflow collision.

I finished the base TUI, merged it to `main`, and started working on macro navigation on a new feature branch. At the exact same time, my friend branched off to build widgets. Both of our features legitimately needed new fields inside our root `AppState` struct in `app.go`.

He finished first and merged his PR into `main`.

When I went to open my PR, GitHub slapped me with the red conflict warning. My initial reaction was panic: *"Wait, did we wreck the repo? How do I update this without blowing away my branch?"*

The workflow turned out to be much simpler and less intimidating than I expected:

1. **Stash uncommitted work:** If you're halfway through writing something and it doesn't compile yet, don't make a messy `"wip"` commit. Just `git stash`. It cleans your working tree immediately.
2. **Pull main directly into your branch:** You don't need a stressful rebase dance when you're just unblocking a branch. Merging `main` directly gives you the current upstream state cleanly:
   ```bash
   git pull origin main
   ```
3. **Resolve the conflict markers:** Open the file, find the `<<<<<<< HEAD` markers, and keep *both* additions:
   ```go
   type AppState struct {
       // my fields
       NavIndex     int
       KeyMap       map[string]string
       // my friend's field from main
       ActiveWidget WidgetType
   }
   ```
4. **Compile and test locally before committing:** Run `go build ./...` and `go test ./...`. If the compiler passes and the test suite is green, `git add`, `git commit`, and push. The GitHub warning disappears.
5. **Restore unfinished work:** Run `git stash pop` to bring your work-in-progress back.

---

## The New Rule: The Closed-Tab Method

To actually get better (especially since I want to tackle low-level systems programming in Rust, Zig, and C), I established a strict rule for myself on this project:

If I get stuck on how an API works or why an algorithm is failing, I am allowed to look up documentation or ask an LLM to explain the underlying concept. **Then I have to close the tab.**

No side-by-side copy-typing with the answer sitting on a second monitor. I close it, turn back to a blank buffer, write the test case, break it, fix the off-by-one errors myself, and let my brain do the actual heavy lifting.

Right now I'm writing the match-span highlighter and test suite completely by hand. It's noticeably slower, but the code actually belongs to me.
