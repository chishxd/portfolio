// Client-side filter for the random section list.
//
// Every entry carries a data-search attribute holding its title, tags,
// author and body text, so filtering is just hiding <li>s. No index to
// build or parse, and nothing to download: it runs on the markup that is
// already in the page.
(() => {
  const input = document.querySelector("[data-lrn-search]");
  if (!input) return;

  // Lowercased once here rather than at build time, so matching is a plain
  // substring test with no per-keystroke case folding.
  const items = Array.from(document.querySelectorAll(".lrn-entry[data-search]")).map(
    (el) => ({ el, hay: el.dataset.search.toLowerCase() })
  );
  const empty = document.querySelector("[data-lrn-empty]");
  const count = document.querySelector("[data-lrn-count]");
  const clear = document.querySelector("[data-lrn-clear]");

  // All words have to appear somewhere, so "two pointers" narrows rather
  // than widening the way an OR would.
  const terms = () => input.value.toLowerCase().split(/\s+/).filter(Boolean);

  function run() {
    const q = terms();
    let shown = 0;

    for (const { el, hay } of items) {
      const hit = q.every((t) => hay.includes(t));
      el.hidden = !hit;
      if (hit) shown++;
    }

    if (count) {
      count.textContent = q.length
        ? shown + (shown === 1 ? " match" : " matches")
        : items.length + (items.length === 1 ? " entry" : " entries");
    }
    if (empty) empty.hidden = shown !== 0 || q.length === 0;
    if (clear) clear.hidden = q.length === 0;
  }

  input.addEventListener("input", run);
  input.addEventListener("search", run);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && input.value) {
      e.stopPropagation();
      input.value = "";
      run();
    }
    // "/" focuses the search box, the way it does on most docs sites.
    // Skipped while already typing so it does not get inserted mid-word.
    if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const t = e.target;
      const typing =
        t instanceof HTMLInputElement ||
        t instanceof HTMLTextAreaElement ||
        (t && t.isContentEditable);
      if (typing) return;
      e.preventDefault();
      input.focus();
      input.select();
    }
  });

  run();
})();
