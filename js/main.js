/* ============================================================
   main.js — 导航滚动高亮、入场动效、Waline 评论初始化
   ============================================================ */
(function () {
  "use strict";

  // ---- 导航滚动高亮当前锚点 ----
  var anchors = document.querySelectorAll("[data-anchor]");
  var sections = [];
  anchors.forEach(function (a) {
    var id = a.getAttribute("data-anchor");
    var el = document.getElementById(id);
    if (el) sections.push({ link: a, el: el });
  });

  function onScroll() {
    var pos = window.scrollY + 90; // 顶部导航偏移
    var currentId = null;
    sections.forEach(function (s) {
      if (s.el.offsetTop <= pos) currentId = s.el.id;
    });
    anchors.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-anchor") === currentId);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---- 入场动效（IntersectionObserver）----
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  // ---- 主题切换（深海蓝 ⇄ 晴空蓝） ----
  var themeToggle = document.getElementById("themeToggle");
  var themeLabel = document.getElementById("themeLabel");
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("suhui-theme", theme); } catch (e) {}
    var dot = themeToggle.querySelector(".theme-toggle-dot");
    dot.classList.toggle("deep", theme === "deepsea");
    dot.classList.toggle("sky", theme === "sky");
    themeLabel.textContent = theme === "deepsea" ? "深海" : "晴空";
  }
  if (themeToggle) {
    var initial = document.documentElement.getAttribute("data-theme") || "deepsea";
    themeToggle.addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme") || "deepsea";
      applyTheme(cur === "deepsea" ? "sky" : "deepsea");
    });
    applyTheme(initial);
  }

  // ---- Waline 评论初始化 ----
  // serverURL: 部署在 Vercel 的 Waline 服务端（Neon Postgres 存储）
  // login: enable → 匿名/登录并存：不登录可匿名评论，登录后可管理（删除）自己的评论
  // requiredMeta: [nick] → 只需昵称
  var commentsEl = document.getElementById("comments");
  if (commentsEl && window.Waline) {
    try {
      window.Waline.init({
        el: "#comments",
        serverURL: "https://suhui-waline.vercel.app",
        lang: "zh-CN",
        pageview: false,
        dark: "auto",
        login: "enable",
        requiredMeta: ["nick"],
        emoji: false,
        meta: ["nick", "mail"],
        search: false,
        copyright: false,
      });
    } catch (e) {
      console.error("[Waline] 初始化失败:", e);
    }
  }
})();
