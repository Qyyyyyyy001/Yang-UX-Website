// Section scrollspy: highlights the section closest to the viewport center
// and lets the user click any item to jump there.
(function () {
  // Auto-hide topbar — visible at top, hides on scroll-down, returns on scroll-up.
  var bar = document.querySelector(".case-topbar");
  if (bar) {
    var lastY = window.scrollY || 0;
    var ticking2 = false;
    var THRESHOLD = 8; // ignore tiny jitter
    function bump() {
      ticking2 = false;
      var y = window.scrollY || 0;
      var dy = y - lastY;
      if (y < 80) {
        // Always show near the top
        bar.classList.remove("is-hidden");
      } else if (Math.abs(dy) > THRESHOLD) {
        if (dy > 0) bar.classList.add("is-hidden");
        else bar.classList.remove("is-hidden");
      }
      lastY = y;
    }
    window.addEventListener("scroll", function () {
      if (!ticking2) { window.requestAnimationFrame(bump); ticking2 = true; }
    }, { passive: true });
  }

  var spy = document.getElementById("caseSpy");
  if (!spy) return;
  var items = Array.prototype.slice.call(spy.querySelectorAll(".case-spy__item"));
  var sections = items.map(function (it) {
    return document.getElementById(it.getAttribute("data-target"));
  });
  items.forEach(function (it) {
    it.addEventListener("click", function () {
      var target = document.getElementById(it.getAttribute("data-target"));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  var ticking = false;
  function update() {
    ticking = false;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var center = window.scrollY + vh * 0.5;
    var bestIdx = 0;
    var bestDist = Infinity;
    for (var i = 0; i < sections.length; i++) {
      var s = sections[i]; if (!s) continue;
      var rect = s.getBoundingClientRect();
      var sCenter = window.scrollY + rect.top + rect.height * 0.5;
      var d = Math.abs(sCenter - center);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    }
    for (var j = 0; j < items.length; j++) {
      items[j].classList.toggle("is-active", j === bestIdx);
    }
    var firstSec = sections[0];
    if (firstSec) {
      var firstRect = firstSec.getBoundingClientRect();
      spy.classList.toggle("is-on", firstRect.top < vh * 0.5);
    }
  }
  function onScroll() {
    if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
})();
