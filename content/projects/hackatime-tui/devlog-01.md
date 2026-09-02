+++
title = "Devlog 01: Shared Types First"
date = 2026-09-01
+++

Okay so, first real day on the Hackatime TUI. 3 person team, Bubbletea for the
TUI part, one guy on backend wiring, one guy on widgets, and me doing
dashboard/nav stuff.

First thing I did was just... define the shared types. Dashboard, Filters,
the whole shape of the panel data. Didn't touch any actual logic before this,
cuz both backend guy and widget guy are kinda stuck until they know what the
data even looks like. Felt like the responsible thing to do lmao, be the guy
who unblocks everyone instead of just diving into my own corner.

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
