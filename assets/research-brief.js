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

  function currentSection() {
    if (location.pathname.startsWith("/research/")) return "research";
    if (location.pathname.startsWith("/daily/")) return "daily";
    if (location.pathname.startsWith("/deliverables/")) return "deliverables";
    return "overview";
  }

  function makePortalTopbar() {
    const section = currentSection();
    const topbar = document.createElement("header");
    topbar.className = "portal-top legacy-portal-top";
    topbar.innerHTML = `
      <div class="portal-wrap portal-top-inner">
        <a class="portal-identity" href="/">
          <span class="portal-logo">CP</span>
          <span>
            <strong>CoBuddy Pages</strong>
            <span>Daily · Research · Deliverables</span>
          </span>
        </a>
        <nav class="portal-nav" aria-label="站点导航">
          <a href="/"${section === "overview" ? ' class="current"' : ""}>Overview</a>
          <a href="/research/"${section === "research" ? ' class="current"' : ""}>Research</a>
          <a href="/daily/"${section === "daily" ? ' class="current"' : ""}>Daily</a>
          <a href="/deliverables/"${section === "deliverables" ? ' class="current"' : ""}>Deliverables</a>
        </nav>
      </div>
    `;
    return topbar;
  }

  function normalizeLegacyTopbar() {
    if (document.querySelector(".portal-top")) return;
    const main = document.querySelector("main");
    const legacyTopbar = document.querySelector(".rb-topbar, .topbar");
    const portalTopbar = makePortalTopbar();
    if (legacyTopbar) {
      legacyTopbar.remove();
    }
    if (main) {
      document.body.insertBefore(portalTopbar, main);
    } else {
      document.body.insertBefore(portalTopbar, document.body.firstChild);
    }
  }

  function enhanceReportPage() {
    if (location.pathname === "/" || location.pathname.endsWith("/myopenclawpublish/")) {
      document.body.classList.add("rb-index");
      const main = document.querySelector("main");
      if (main && !main.querySelector(".rb-topbar, .topbar")) {
        document.body.insertBefore(makePortalTopbar(), main);
      }
      return;
    }

    const main = document.querySelector("main");
    if (!main || main.querySelector(".rb-layout, .layout")) {
      document.body.classList.add("rb-report-page");
      normalizeLegacyTopbar();
      return;
    }

    document.body.classList.add("rb-report-page");

    const topbar = makePortalTopbar();
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
    document.body.insertBefore(topbar, main);
    layout.appendChild(toc);
    layout.appendChild(article);
    layout.appendChild(summary);
    main.appendChild(layout);
  }

  applyTheme(currentTheme());
  if (document.body.classList.contains("portal-page")) {
    return;
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhanceReportPage);
  } else {
    enhanceReportPage();
  }
})();
