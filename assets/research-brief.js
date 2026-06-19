(function () {
  const STORAGE_KEY = "research-brief-theme";

  function currentTheme() {
    return localStorage.getItem(STORAGE_KEY) || "light";
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
    document.querySelectorAll(".theme-toggle").forEach((button) => {
      button.textContent = theme === "dark" ? "Light" : "Dark";
      button.setAttribute("aria-label", theme === "dark" ? "Use light theme" : "Use dark theme");
    });
  }

  function slugify(text) {
    return text
      .trim()
      .toLowerCase()
      .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
      .replace(/^-+|-+$/g, "");
  }

  function makeTopbar(root) {
    const topbar = document.createElement("div");
    topbar.className = "rb-topbar";
    topbar.innerHTML = `
      <div class="rb-brand">
        <strong>OpenClaw Research Brief</strong>
        <span>AI、软件与市场的公开研究简报</span>
      </div>
      <a class="rb-back" href="${root}">返回首页</a>
    `;
    return topbar;
  }

  function makeThemeToggle() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "theme-toggle";
    button.addEventListener("click", () => {
      applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
    });
    return button;
  }

  function ensureThemeToggle() {
    const topbar = document.querySelector(".topbar, .rb-topbar");
    if (!topbar || topbar.querySelector(".theme-toggle")) return;
    topbar.appendChild(makeThemeToggle());
    applyTheme(currentTheme());
  }

  function pageRootPath() {
    const depth = location.pathname.split("/").filter(Boolean).length;
    if (depth <= 1) return "./";
    return "../".repeat(depth - 1);
  }

  function enhanceReportPage() {
    if (location.pathname === "/" || location.pathname.endsWith("/myopenclawpublish/")) {
      document.body.classList.add("rb-index");
      const main = document.querySelector("main");
      if (main && !main.querySelector(".rb-topbar, .topbar")) {
        main.insertBefore(makeTopbar("./"), main.firstChild);
      }
      ensureThemeToggle();
      return;
    }

    const main = document.querySelector("main");
    if (!main || main.querySelector(".rb-layout, .layout")) {
      document.body.classList.add("rb-report-page");
      ensureThemeToggle();
      return;
    }

    document.body.classList.add("rb-report-page");

    const root = pageRootPath();
    const topbar = makeTopbar(root);
    const layout = document.createElement("div");
    layout.className = "rb-layout";
    const toc = document.createElement("aside");
    toc.className = "rb-panel rb-toc";
    toc.setAttribute("aria-label", "文章目录");
    toc.innerHTML = `<h2 class="rb-panel-title">目录</h2>`;
    const article = document.createElement("article");
    article.className = "rb-report";
    const summary = document.createElement("aside");
    summary.className = "rb-panel rb-summary-panel";
    summary.setAttribute("aria-label", "报告摘要");

    const existingNodes = Array.from(main.childNodes);
    existingNodes.forEach((node) => article.appendChild(node));

    const title = document.title || "研究报告";
    const description = document.querySelector('meta[name="description"]')?.content || "公开研究报告";
    const dateMatch = location.pathname.match(/\/(20\d{2})\/(\d{2})\/(\d{2})\//);
    const dateText = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : "";

    const firstHeading = article.querySelector("h1");
    if (firstHeading) {
      const reportHeader = document.createElement("header");
      reportHeader.className = "rb-report-header";
      const eyebrow = document.createElement("p");
      eyebrow.className = "eyebrow";
      eyebrow.textContent = "Research Brief";
      const deck = document.createElement("p");
      deck.className = "deck";
      deck.textContent = description;
      const meta = document.createElement("p");
      meta.className = "meta";
      meta.innerHTML = [dateText, "Research", "OpenClaw"].filter(Boolean).map((item) => `<span>${item}</span>`).join("");
      reportHeader.appendChild(eyebrow);
      reportHeader.appendChild(firstHeading);
      reportHeader.appendChild(deck);
      reportHeader.appendChild(meta);
      article.insertBefore(reportHeader, article.firstChild);
    }

    const headings = Array.from(article.querySelectorAll("h2"));
    headings.slice(0, 12).forEach((heading, index) => {
      if (!heading.id) {
        heading.id = slugify(heading.textContent) || `section-${index + 1}`;
      }
      const link = document.createElement("a");
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent;
      toc.appendChild(link);
    });

    summary.innerHTML = `
      <h2 class="rb-panel-title">报告摘要</h2>
      <ul class="rb-summary-list">
        <li><strong>标题</strong><span>${title}</span></li>
        <li><strong>日期</strong><span>${dateText || "未标注"}</span></li>
        <li><strong>摘要</strong><span>${description}</span></li>
      </ul>
    `;

    main.textContent = "";
    main.appendChild(topbar);
    layout.appendChild(toc);
    layout.appendChild(article);
    layout.appendChild(summary);
    main.appendChild(layout);
    ensureThemeToggle();
  }

  applyTheme(currentTheme());
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhanceReportPage);
  } else {
    enhanceReportPage();
  }
})();
