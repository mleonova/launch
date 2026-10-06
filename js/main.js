(function () {
  "use strict";

  document.documentElement.classList.add("js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     Image fallback: if a remote photo fails, use the local file
  --------------------------------------------------------- */
  function useFallback(img) {
    var fb = img.getAttribute("data-fallback");
    if (!fb || img.dataset.fellBack) return;
    img.dataset.fellBack = "1";
    img.removeAttribute("srcset");
    img.src = fb;
  }
  document.querySelectorAll("img[data-fallback]").forEach(function (img) {
    if (img.complete && img.naturalWidth === 0) useFallback(img);
    img.addEventListener("error", function () { useFallback(img); });
  });

  /* ---------------------------------------------------------
     Footer year
  --------------------------------------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     Header state, scroll progress, back-to-top, parallax
  --------------------------------------------------------- */
  var header = document.getElementById("site-header");
  var progress = document.getElementById("scroll-progress");
  var toTop = document.getElementById("to-top");
  var parallax = document.querySelector("[data-parallax]");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle("is-scrolled", y > 10);
    if (progress) progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    if (toTop) toTop.classList.toggle("is-visible", y > 900);
    if (parallax && !reduceMotion && window.innerWidth > 980 && y < 1200) {
      parallax.style.transform = "translateY(" + y * 0.08 + "px)";
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  if (toTop) toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* ---------------------------------------------------------
     Mobile navigation
  --------------------------------------------------------- */
  var navToggle = document.getElementById("nav-toggle");
  var mainNav = document.getElementById("main-nav");

  function setNav(open) {
    mainNav.classList.toggle("open", open);
    header.classList.toggle("menu-open", open);
    document.body.classList.toggle("no-scroll", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () { setNav(!mainNav.classList.contains("open")); });
    mainNav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setNav(false); }); });
    window.addEventListener("resize", function () { if (window.innerWidth > 860) setNav(false); });
  }

  /* ---------------------------------------------------------
     Active nav link on scroll
  --------------------------------------------------------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.main-nav a[href^="#"]:not(.btn)'));
  if ("IntersectionObserver" in window) {
    var sectionObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = "#" + entry.target.id;
        navLinks.forEach(function (l) { l.classList.toggle("is-current", l.getAttribute("href") === id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    navLinks.forEach(function (l) {
      var s = document.querySelector(l.getAttribute("href"));
      if (s) sectionObs.observe(s);
    });
  }

  /* ---------------------------------------------------------
     Reveal on scroll (staggered within each parent)
  --------------------------------------------------------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains("reveal"); });
        el.style.transitionDelay = Math.min(siblings.indexOf(el), 5) * 80 + "ms";
        el.classList.add("is-visible");
        revealObs.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { revealObs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------------------------------------------------------
     Count-up stats
  --------------------------------------------------------- */
  var counters = document.querySelectorAll("[data-count]");
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (reduceMotion || target === 0) { el.textContent = target; return; }
    var start = null, dur = 1200;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = "0";
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); countObs.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { countObs.observe(c); });
  }

  /* ---------------------------------------------------------
     How it works: the step nearest the middle of the screen lights up,
     and the line fills smoothly as you scroll.
  --------------------------------------------------------- */
  var howSec = document.querySelector("[data-how]");
  if (howSec) {
    var tl = howSec.querySelector("[data-timeline]");
    var tlSteps = Array.prototype.slice.call(howSec.querySelectorAll(".tl-step"));
    var tlFill = howSec.querySelector(".tl-line-fill");
    var lineEl = howSec.querySelector(".tl-line");
    var targetFill = 0, shownFill = 0, raf = null;

    function animateFill() {
      shownFill += (targetFill - shownFill) * 0.18;
      if (Math.abs(targetFill - shownFill) < 0.001) shownFill = targetFill;
      tlFill.style.transform = "scaleY(" + shownFill.toFixed(4) + ")";
      raf = shownFill !== targetFill ? requestAnimationFrame(animateFill) : null;
    }

    // Run the line exactly from the first circle's center to the last circle's center
    function sizeLine() {
      var nums = howSec.querySelectorAll(".tl-num");
      var base = tl.getBoundingClientRect().top;
      var first = nums[0].getBoundingClientRect(), last = nums[nums.length - 1].getBoundingClientRect();
      lineEl.style.top = (first.top + first.height / 2 - base) + "px";
      lineEl.style.height = (last.top - first.top) + "px";
      lineEl.style.bottom = "auto";
    }

    function updateHow() {
      var mid = window.innerHeight * 0.55, active = 0;
      tlSteps.forEach(function (st, j) {
        if (st.querySelector(".tl-num").getBoundingClientRect().top < mid) active = j;
      });
      tlSteps.forEach(function (st, j) {
        st.classList.toggle("is-active", j === active);
        st.classList.toggle("is-lit", j <= active);
      });
      var r = lineEl.getBoundingClientRect();
      targetFill = Math.max(0, Math.min(1, (mid - r.top) / r.height));
      if (reduceMotion) { shownFill = targetFill; tlFill.style.transform = "scaleY(" + targetFill + ")"; }
      else if (!raf) raf = requestAnimationFrame(animateFill);
    }

    window.addEventListener("scroll", updateHow, { passive: true });
    window.addEventListener("resize", function () { sizeLine(); updateHow(); });
    window.addEventListener("load", function () { sizeLine(); updateHow(); });
    sizeLine();
    updateHow();
  }

  /* ---------------------------------------------------------
     Accordions: only one open at a time per group
  --------------------------------------------------------- */
  document.querySelectorAll("[data-accordion]").forEach(function (group) {
    var items = group.querySelectorAll("details");
    items.forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (d.open) items.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  });

  /* ---------------------------------------------------------
     Device filter
  --------------------------------------------------------- */
  var chips = document.querySelectorAll(".chip[data-filter]");
  var cards = document.querySelectorAll(".device-card");
  var emptyMsg = document.getElementById("filter-empty");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var f = chip.getAttribute("data-filter");
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-pressed", on ? "true" : "false");
      });
      var shown = 0;
      cards.forEach(function (card) {
        var match = f === "all" || (card.getAttribute("data-brands") || "").split(" ").indexOf(f) > -1;
        card.classList.toggle("is-hidden", !match);
        card.classList.remove("is-entering");
        if (match) { void card.offsetWidth; card.classList.add("is-entering"); shown++; }
      });
      if (emptyMsg) emptyMsg.hidden = shown > 0;
    });
  });

  // Brand names in the brands band jump to Devices with that brand filtered
  document.querySelectorAll("[data-brand-jump]").forEach(function (link) {
    link.addEventListener("click", function () {
      var chip = document.querySelector('.chip[data-filter="' + link.getAttribute("data-brand-jump") + '"]');
      if (chip) chip.click();
    });
  });

  /* ---------------------------------------------------------
     Treatment category modal
  --------------------------------------------------------- */
  var CATEGORIES = {
    tightening: {
      name: "Skin Tightening",
      desc: "Energy-based tightening stimulates collagen to firm lax skin on the face, neck and body — with little to no downtime, which makes it an easy add-on to an existing menu.",
      treats: ["Jowls & jawline", "Neck laxity", "Fine lines", "Body contouring"],
      platforms: "Sciton, Cutera, Lumenis"
    },
    pigment: {
      name: "Pigmented Lesion Removal",
      desc: "Light and laser treatments that target melanin to clear sun spots and uneven tone, often in a short series of sessions.",
      treats: ["Sun & age spots", "Freckles", "Uneven tone", "Sun damage"],
      platforms: "Sciton BBL, Cutera, Solta Clear + Brilliant"
    },
    rejuvenation: {
      name: "Skin Rejuvenation",
      desc: "Gentle fractional and light-based treatments for brighter, smoother skin — popular as recurring maintenance and membership offerings.",
      treats: ["Dullness", "Texture", "Fine lines", "Enlarged pores"],
      platforms: "Sciton MOXI, Solta HALO, Cutera"
    },
    hair: {
      name: "Hair Removal",
      desc: "One of the most requested aesthetic treatments, built on repeat visits — a dependable base of recurring revenue.",
      treats: ["Face", "Underarms", "Legs", "Bikini"],
      platforms: "Lumenis, Sciton BBL"
    },
    tattoo: {
      name: "Tattoo Removal",
      desc: "Laser systems that break down tattoo ink over a series of sessions — a multi-visit treatment with strong patient demand.",
      treats: ["Dark inks", "Colored inks", "Cover-up prep", "Fading"],
      platforms: "Cutera, Lumenis"
    },
    resurfacing: {
      name: "Skin Resurfacing",
      desc: "Fractional and ablative resurfacing for deeper texture and scarring concerns, with adjustable intensity to match patient downtime.",
      treats: ["Acne scars", "Wrinkles", "Texture", "Sun damage"],
      platforms: "Sciton MOXI, ProFractional & TRL, Cutera"
    },
    vascular: {
      name: "Vascular Lesion",
      desc: "Targets visible vessels and redness to calm and even out the complexion.",
      treats: ["Redness", "Spider veins", "Broken capillaries", "Rosacea flushing"],
      platforms: "Sciton BBL, Lumenis"
    },
    womens: {
      name: "Women’s Health Rejuvenation",
      desc: "Energy-based women’s wellness treatments that extend your practice into a fast-growing, high-loyalty category.",
      treats: ["Intimate wellness", "Post-partum care", "Laxity", "Confidence"],
      platforms: "Sciton, Lumenis"
    }
  };

  var modal = document.getElementById("category-modal");
  var modalTitle = document.getElementById("modal-title");
  var modalDesc = document.getElementById("modal-desc");
  var modalTreats = document.getElementById("modal-treats");
  var modalPlatforms = document.getElementById("modal-platforms");
  var modalImg = document.getElementById("modal-img");
  var modalClose = document.getElementById("modal-close");
  var modalCta = document.getElementById("modal-cta");
  var lastFocused = null;

  function openModal(card) {
    var c = CATEGORIES[card.getAttribute("data-id")];
    if (!c) return;
    modalTitle.textContent = c.name;
    modalDesc.textContent = c.desc;
    modalPlatforms.textContent = c.platforms;
    modalTreats.innerHTML = "";
    c.treats.forEach(function (t) { var li = document.createElement("li"); li.textContent = t; modalTreats.appendChild(li); });
    modalImg.innerHTML = "";
    var src = card.querySelector("img");
    if (src) {
      var img = src.cloneNode();
      img.removeAttribute("loading");
      img.sizes = "(max-width: 720px) 100vw, 340px";
      img.addEventListener("error", function () { useFallback(img); });
      modalImg.appendChild(img);
    }
    modalCta.setAttribute("data-category", c.name);
    lastFocused = card;
    modal.hidden = false;
    document.body.classList.add("no-scroll");
    requestAnimationFrame(function () { modal.classList.add("is-open"); });
    modalClose.focus();
  }

  function closeModal(returnFocus) {
    modal.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    setTimeout(function () { modal.hidden = true; }, reduceMotion ? 0 : 250);
    if (returnFocus !== false && lastFocused) lastFocused.focus();
  }

  cards.forEach(function (card) { card.addEventListener("click", function () { openModal(card); }); });
  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
    modal.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var f = modal.querySelectorAll("button, a[href]");
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }
  if (modalCta) modalCta.addEventListener("click", function () {
    // Pre-fill the inquiry with the chosen category
    var msg = document.getElementById("message");
    var name = modalCta.getAttribute("data-category");
    if (msg && name && msg.value.indexOf(name) === -1) {
      msg.value = (msg.value ? msg.value + "\n" : "") + "I'm interested in " + name + ".";
    }
    closeModal(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (modal && !modal.hidden) closeModal();
      else if (mainNav && mainNav.classList.contains("open")) setNav(false);
    }
  });

  /* ---------------------------------------------------------
     "Talk to us about selling/subleasing" links pre-select the interest chip
  --------------------------------------------------------- */
  document.querySelectorAll("[data-interest]").forEach(function (link) {
    link.addEventListener("click", function () {
      var want = link.getAttribute("data-interest");
      document.querySelectorAll('input[name="interest"]').forEach(function (box) { box.checked = box.value === want; });
    });
  });

  /* ---------------------------------------------------------
     Contact form: validation + Formspree AJAX submission
  --------------------------------------------------------- */
  var form = document.getElementById("inquiry-form");
  var statusEl = document.getElementById("form-status");

  function setError(field, message) {
    var errorEl = form.querySelector('[data-error-for="' + field.name + '"]');
    if (errorEl) errorEl.textContent = message || "";
    field.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function validate(only) {
    var valid = true;
    var checks = {
      name: function (v) { return v ? "" : "Please enter your name."; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Please enter a valid email address."; },
      message: function (v) { return v ? "" : "Let us know which devices or treatments you're considering."; }
    };
    Object.keys(checks).forEach(function (k) {
      if (only && only !== k) return;
      var field = form.elements[k];
      var msg = checks[k](field.value.trim());
      setError(field, msg);
      if (msg) valid = false;
    });
    return valid;
  }

  if (form) {
    ["name", "email", "message"].forEach(function (k) {
      var field = form.elements[k];
      field.addEventListener("blur", function () { if (field.value.trim()) validate(k); });
      field.addEventListener("input", function () { if (field.getAttribute("aria-invalid") === "true") validate(k); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) {
        statusEl.textContent = "Please fix the highlighted fields and try again.";
        statusEl.className = "form-status error";
        var bad = form.querySelector('[aria-invalid="true"]');
        if (bad) bad.focus();
        return;
      }
      if (form.elements._gotcha && form.elements._gotcha.value) return;

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
      statusEl.textContent = "";
      statusEl.className = "form-status";

      var endpoint = form.getAttribute("action");
      var isConfigured = endpoint && endpoint.indexOf("YOUR_FORM_ID") === -1;

      if (!isConfigured) {
        setTimeout(function () {
          statusEl.textContent = "Thanks! (Demo mode: connect a Formspree endpoint in index.html to actually deliver this message.)";
          statusEl.className = "form-status success";
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalHTML;
          form.reset();
        }, 500);
        return;
      }

      fetch(endpoint, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) })
        .then(function (response) {
          if (response.ok) {
            statusEl.textContent = "Thanks — a specialist will be in touch shortly.";
            statusEl.className = "form-status success";
            form.reset();
          } else {
            return response.json().then(function (data) {
              var msg = (data && data.errors && data.errors.map(function (er) { return er.message; }).join(", ")) ||
                "Something went wrong. Please try again or email us directly.";
              throw new Error(msg);
            });
          }
        })
        .catch(function (err) {
          statusEl.textContent = err.message || "Something went wrong. Please try again.";
          statusEl.className = "form-status error";
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalHTML;
        });
    });
  }
})();
