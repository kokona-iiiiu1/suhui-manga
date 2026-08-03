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

  // ---- Waline 评论初始化 ----
  // serverURL: 部署在 Vercel 的 Waline 服务端（Neon Postgres 存储）
  // login: disable → 完全匿名，无需登录；requiredMeta: [nick] → 只需昵称
  var commentsEl = document.getElementById("comments");
  if (commentsEl && window.Waline) {
    try {
      window.Waline.init({
        el: "#comments",
        serverURL: "https://suhui-waline.vercel.app",
        lang: "zh-CN",
        pageview: false,
        dark: "auto",
        login: "disable",
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
