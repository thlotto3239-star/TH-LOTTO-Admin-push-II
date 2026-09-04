(() => {
  const issues = [];
  const isScrollableAncestor = (el) => {
    let a = el.parentElement;
    while (a) {
      const c = getComputedStyle(a);
      if (c.overflowX === "auto" || c.overflowX === "scroll") return true;
      a = a.parentElement;
    }
    return false;
  };
  for (const el of document.querySelectorAll("body *")) {
    if (["SCRIPT", "STYLE", "NOSCRIPT", "LINK", "META", "INPUT", "TEXTAREA"].includes(el.tagName)) continue;
    const hasText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim());
    const cls = (el.className || "").toString();
    if (hasText && !isScrollableAncestor(el)) {
      const cs = getComputedStyle(el);
      if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0 && cs.overflowX === "visible") {
        issues.push({ k: "clipX", tag: el.tagName, cls: cls.slice(0, 70), text: (el.textContent || "").trim().slice(0, 50), sw: el.scrollWidth, cw: el.clientWidth });
      }
      if (el.scrollHeight > el.clientHeight + 4 && el.clientHeight > 0 && (cs.overflowY === "hidden" || cs.overflow === "hidden")) {
        issues.push({ k: "clipY", tag: el.tagName, cls: cls.slice(0, 70), text: (el.textContent || "").trim().slice(0, 50), sh: el.scrollHeight, ch: el.clientHeight });
      }
    }
    if (cls.includes("rounded-full") && (el.textContent || "").trim() && el.clientWidth > 0) {
      const cs = getComputedStyle(el);
      const lh = parseFloat(cs.lineHeight);
      if (lh && el.clientHeight > lh * 1.7) {
        issues.push({ k: "wrapped-pill", tag: el.tagName, cls: cls.slice(0, 70), text: (el.textContent || "").trim().slice(0, 50), h: el.clientHeight, lh });
      }
    }
  }
  return JSON.stringify(issues.slice(0, 40));
})()
