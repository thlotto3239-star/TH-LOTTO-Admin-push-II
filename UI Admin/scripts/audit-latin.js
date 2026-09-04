(() => {
  const out = new Map();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const p = node.parentElement;
    if (!p || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(p.tagName)) continue;
    const t = node.textContent.replace(/\s+/g, " ").trim();
    if (!t || !/[A-Za-z]{2,}/.test(t)) continue;
    const key = t.slice(0, 140);
    out.set(key, (out.get(key) || 0) + 1);
  }
  return JSON.stringify(Array.from(out.entries()));
})()
