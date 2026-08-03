/* ============================================================
   阅读器 reader.js — 页漫翻页模式（一次一页，非条漫）
   - 59 页：00-cover(封面) + 01~57 + 00-back(封底)
   - 章节映射（以 PPT 章节划分为准，实施时已核实页号）
   - ← → 键盘翻页、点击左右区域翻页、缩略图跳转、±2 页预加载
   ============================================================ */
(function () {
  "use strict";

  // ---- 页面清单（59 页，与转换脚本输出一致）----
  var PAGE_COUNT = 59;
  var IMG_BASE = "assets/img/pages/";

  // 页面文件名（按序）
  var pageFiles = [];
  pageFiles.push("00-cover.webp");                       // 0  封面
  for (var i = 1; i <= 57; i++) pageFiles.push(("0" + i).slice(-2) + ".webp"); // 1-57 正文
  pageFiles.push("00-back.webp");                        // 58 封底

  // ---- 章节划分（封面/相识/熟知/灾厄·轮回/封底）----
  // 从 PPT 章节结构推断；页号边界以作品实际章节为准
  var chapters = [
    { name: "封面", start: 0, end: 0 },
    { name: "相识", start: 1, end: 22 },
    { name: "熟知", start: 23, end: 40 },
    { name: "灾厄 · 轮回", start: 41, end: 57 },
    { name: "封底", start: 58, end: 58 }
  ];

  // ---- DOM 引用 ----
  var img = document.getElementById("pageImg");
  var stage = document.getElementById("readerStage");
  var navPrev = document.getElementById("navPrev");
  var navNext = document.getElementById("navNext");
  var thumbsBar = document.getElementById("thumbsBar");
  var chapterName = document.getElementById("chapterName");
  var pageIndicator = document.getElementById("pageIndicator");

  var current = 0;          // 当前页索引（0~58）
  var preloadCache = {};    // 预加载图片缓存

  function chapterOf(idx) {
    for (var c = 0; c < chapters.length; c++) {
      if (idx >= chapters[c].start && idx <= chapters[c].end) return chapters[c];
    }
    return chapters[chapters.length - 1];
  }

  function fileOf(idx) {
    if (idx < 0 || idx >= PAGE_COUNT) return null;
    return IMG_BASE + pageFiles[idx];
  }

  // ---- 预加载 ±2 页 ----
  function preload(idx) {
    for (var d = -2; d <= 2; d++) {
      var f = fileOf(idx + d);
      if (f && !preloadCache[f]) {
        var im = new Image();
        im.src = f;
        preloadCache[f] = im;
      }
    }
  }

  // ---- 渲染当前页 ----
  function render() {
    var ch = chapterOf(current);
    img.src = fileOf(current);
    img.alt = "《溯洄》第 " + (current + 1) + " 页 · " + ch.name;
    chapterName.textContent = ch.name;
    pageIndicator.textContent = (current + 1) + " / " + PAGE_COUNT;

    // 导航区可用性
    navPrev.classList.toggle("disabled", current === 0);
    navNext.classList.toggle("disabled", current === PAGE_COUNT - 1);

    // 缩略图高亮 + 滚动到可见
    var thumbs = thumbsBar.querySelectorAll(".thumb");
    thumbs.forEach(function (t, i) {
      t.classList.toggle("current", i === current);
    });
    var cur = thumbs[current];
    if (cur && cur.scrollIntoView) {
      cur.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    }

    preload(current);
  }

  function go(idx) {
    if (idx < 0 || idx >= PAGE_COUNT || idx === current) return;
    current = idx;
    render();
    // 点击后滚动到阅读器顶部，保证从页首开始看
    stage.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function nextPage() { go(current + 1); }
  function prevPage() { go(current - 1); }

  // ---- 构建缩略图条（59 个缩略图）----
  function buildThumbs() {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < PAGE_COUNT; i++) {
      var t = document.createElement("img");
      t.className = "thumb";
      t.src = fileOf(i);
      t.alt = "第 " + (i + 1) + " 页";
      t.loading = "lazy";
      t.addEventListener("click", (function (idx) {
        return function () { go(idx); };
      })(i));
      frag.appendChild(t);
    }
    thumbsBar.appendChild(frag);
  }

  // ---- 事件绑定 ----
  navPrev.addEventListener("click", prevPage);
  navNext.addEventListener("click", nextPage);

  // 点击左右区域翻页（40% 左右分区）
  stage.addEventListener("click", function (e) {
    if (e.target === navPrev || e.target === navNext) return;
    var rect = stage.getBoundingClientRect();
    var x = e.clientX - rect.left;
    if (x < rect.width * 0.45) prevPage();
    else nextPage();
  });

  // 键盘翻页
  document.addEventListener("keydown", function (e) {
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    if (e.key === "ArrowLeft") { e.preventDefault(); prevPage(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); nextPage(); }
  });

  // 触屏滑动（左右）
  var touchX = null;
  stage.addEventListener("touchstart", function (e) {
    touchX = e.touches[0].clientX;
  }, { passive: true });
  stage.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 48) {
      if (dx > 0) prevPage(); else nextPage();
    }
    touchX = null;
  }, { passive: true });

  // ---- 初始化 ----
  buildThumbs();
  render();
})();
