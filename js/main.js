/* ============================================================
   main.js — 导航滚动高亮、入场动效、评论挂载点
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

  // ============================================================
  // 评论挂载点（预留）
  // ------------------------------------------------------------
  // 接入 Waline（免费、匿名可评）时：
  //   1) 在 Vercel 部署 Waline 服务端，得到 serverURL
  //   2) 取消下方注释，替换 serverURL，并 <script> 引入 @waline/client
  //   3) 删掉 .comments-placeholder 占位块
  // ============================================================
  /*
  var commentsEl = document.getElementById("comments");
  if (commentsEl && window.Waline) {
    window.Waline.init({
      el: "#comments",
      serverURL: "https://your-waline-server.vercel.app",
      lang: "zh-CN",
      pageview: false,
      dark: "auto",
      emoji: ["https://unpkg.com/@waline/emojis@1.2.0/weibo"],
      requiredMeta: ["nick"],   // 只要求昵称，不强制邮箱 → 匿名可评
      login: "disable"          // 完全匿名，无需登录
    });
  }
  */
})();
