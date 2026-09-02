+++
title = "Devlog 01: Shared Types First"
date = 2026-09-01
description = "Day 1 of building the Hackatime TUI in Go: setting up shared types, designing the btop-style layout wireframe, and unblocking the team."
+++

Okay so, first real day on the Hackatime TUI. 3 person team, Bubbletea for the
TUI part, one guy on backend wiring, one guy on widgets, and me doing
dashboard/nav stuff.

### Unblocking the Team First

First thing I did was just... define the shared types. Dashboard, Filters,
the whole shape of the panel data. Didn't touch any actual logic before this,
cuz both backend guy and widget guy are kinda stuck until they know what the
data even looks like. Felt like the responsible thing to do lmao, be the guy
who unblocks everyone instead of just diving into my own corner.

### The Fixed Header & Wireframe Slots

After that I built out the fixed header, renders username, streak, the whole
filter row (Date Range / Project / Language / OS / Editor / Category)... I
basically just referenced the real Hackatime dashboard for this. It looks
right now, which is nice, but it doesn't DO anything yet lol. Next up is
making it actually usable, dropdowns opening/closing, moving the cursor
around, filters actually triggering a refetch.

Also threw together the card and panel grid, just wireframes with empty
slots for now (Project Durations, Languages, Timeline, etc) so widget guy
has something concrete to build into whenever he starts.

Getting started is always the hardest part for me, every single time. But
once the first commit was up everything just kinda... flowed after that.

### The Planned Layout

This is our planned layout for the dashboard:

```text
┌──────────────────┬──────────────────────────────────────────────────────────────────────────────────┐
│ [●] Chish 🇮🇳     │ Keep Track of Your Coding Time                                                   │
│ [🔥 3 day streak]│ Today: 43m 27s logged (Python, JS, Rust, etc.) using Neovim & VSCode             │
│                  ├──────────────────────────────────────────────────────────────────────────────────┤
│ > [Home]         │ [Date: All Time ▾] [Project: All ▾] [Lang: All ▾] [OS: All ▾] [Editor: All ▾]    │
│   Projects       ├──────────────┬──────────────┬──────────────┬──────────────┬──────────────────────┤
│   Settings       │ TOTAL TIME   │ TOP PROJECT  │ TOP LANGUAGE │ TOP OS       │ TOP EDITOR           │
│                  │ 520h 34m     │ kasumi       │ Rust         │ Linux        │ VSCode               │
│                  └──────────────┴──────────────┴──────────────┴──────────────┴──────────────────────┤
│                                                                                                     │
│ ┌─ Project Durations ────────────────────────────┐ ┌─ Languages ──────────────────────────────────┐ │
│ │ kasumi            ██████████████████ 31h 28m   │ │ Rust       ████████████░░░░░░░░░  38%        │ │
│ │ skora-backend     ██████████████████ 31h 27m   │ │ Python     ████████░░░░░░░░░░░░░  22%        │ │
│ │ stacksense        █████████████░░░░░ 22h 25m   │ │ Svelte     ████░░░░░░░░░░░░░░░░░  12%        │ │
│ │ the-verse-...     ██████████░░░░░░░░ 19h 54m   │ │ C / Go     ███░░░░░░░░░░░░░░░░░░   8%        │ │
│ │ desktop-editor    ████████░░░░░░░░░░ 16h 44m   │ │ Other      ██████░░░░░░░░░░░░░░░  20%        │ │
│ └────────────────────────────────────────────────┘ └──────────────────────────────────────────────┘ │
│                                                                                                     │
│ ┌─ Editors ──────────────────────────────────────┐ ┌─ Operating Systems ──────────────────────────┐ │
│ │ VSCode            ██████████████████  48%      │ │ Linux      ████████████████████  100%        │ │
│ │ Neovim            ██████████░░░░░░░░  28%      │ │                                              │ │
│ │ Zed / CLion       ████░░░░░░░░░░░░░░  14%      │ │                                              │ │
│ │ Godot / Other     ███░░░░░░░░░░░░░░░  10%      │ │                                              │ │
│ └────────────────────────────────────────────────┘ └──────────────────────────────────────────────┘ │
│                                                                                                     │
│ ┌─ Project Timeline (Stacked Weekly Activity) ────────────────────────────────────────────────────┐ │
│ │ 22h ┤  █                                                                                        │ │
│ │ 16h ┤  █                                                                                        │ │
│ │ 11h ┤  █    █         █                                                                         │ │
│ │  5h ┤  █    █    █    █    █    █    █                                      █                   │ │
│ │  0h ┴──┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴───────────  │ │
│ │       Jun15 Jun22 Jun29 Jul6 Jul13 Jul20 Jul27 Aug3 Aug10 Aug17 Aug24 Aug31                     │ │
│ └─────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                     │
│ ┌─ Coding Rhythm (Activity Heatmap) ──────────────────────────────────────────────────────────────┐ │
│ │      12AM    3AM    6AM    9AM   12PM    3PM    6PM    9PM                                      │ │
│ │ Mon  [ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][■][■][■][■]                               │ │
│ │ Tue  [ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][■][■][■]                               │ │
│ │ Wed  [ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][■][■][■][■][■][■][■][■]                               │ │
│ │ Thu  [ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][■][■][■]                               │ │
│ │ Fri  [ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][■][■][■][■][■][■][■][■]                               │ │
│ │ Sat  [ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][■][■][■][■][■][■][■][■][■][■]                               │ │
│ │ Sun  [■][■][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][ ][■][■][■][■][■][■]                               │ │
│ └─────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                     │
│ ┌─ Today's Goal ─────────────────────────────────┐ ┌─ AI vs Human Coding ─────────────────────────┐ │
│ │               ╭─────────╮                      │ │ [AI 7%]                [Human Coding 93%]    │ │
│ │               │   73%   │                      │ │ ███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    │ │
│ │               ╰─────────╯                      │ │                                              │ │
│ │ 27% below usual  |  Today: 43m / Usual: 59m    │ │ AI: 32h 15m (7%)   |   Human: 450h 58m (93%) │ │
│ └────────────────────────────────────────────────┘ └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Current Progress

Here is how the wireframe looks right now in the terminal:

![Image](/screenshots/hackatime-tui-1.png)

