(function () {
  "use strict";

  /* ---------------------------------------------------------
     Footer year
  --------------------------------------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     Mobile navigation toggle
  --------------------------------------------------------- */
  var navToggle = document.getElementById("nav-toggle");
  var mainNav = document.getElementById("main-nav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close the mobile menu after choosing a link
    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------------------------------------------------
     Treatment category modal
  --------------------------------------------------------- */
  var modal = document.getElementById("category-modal");
  var modalTitle = document.getElementById("modal-title");
  var modalPlatforms = document.getElementById("modal-platforms");
  var modalClose = document.getElementById("modal-close");
  var lastFocusedCard = null;

  function openModal(name, platforms) {
    modalTitle.textContent = name;
    modalPlatforms.textContent = "Available on: " + platforms;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modalClose.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocusedCard) lastFocusedCard.focus();
  }

  document.querySelectorAll(".device-card").forEach(function (card) {
    card.addEventListener("click", function () {
      lastFocusedCard = card;
      openModal(card.dataset.name, card.dataset.platforms);
    });
  });

  if (modalClose) modalClose.addEventListener("click", closeModal);

  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
    // Clicking the "Request a quote" CTA inside the modal should also close it
    // so the smooth-scroll to #contact isn't hidden behind the overlay.
    var modalCta = document.getElementById("modal-cta");
    if (modalCta) modalCta.addEventListener("click", closeModal);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && !modal.hidden) closeModal();
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

  function validate() {
    var valid = true;

    var name = form.elements.name;
    if (!name.value.trim()) {
      setError(name, "Please enter your name.");
      valid = false;
    } else {
      setError(name, "");
    }

    var email = form.elements.email;
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim() || !emailPattern.test(email.value.trim())) {
      setError(email, "Please enter a valid email address.");
      valid = false;
    } else {
      setError(email, "");
    }

    var message = form.elements.message;
    if (!message.value.trim()) {
      setError(message, "Let us know which devices you're interested in.");
      valid = false;
    } else {
      setError(message, "");
    }

    return valid;
  }

  if (form) {
    ["name", "email", "message"].forEach(function (fieldName) {
      var field = form.elements[fieldName];
      if (field) field.addEventListener("blur", validate);
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!validate()) {
        statusEl.textContent = "Please fix the highlighted fields and try again.";
        statusEl.className = "form-status error";
        return;
      }

      // Honeypot check
      if (form.elements._gotcha && form.elements._gotcha.value) {
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
      statusEl.textContent = "";
      statusEl.className = "form-status";

      var endpoint = form.getAttribute("action");
      var isConfigured = endpoint && endpoint.indexOf("YOUR_FORM_ID") === -1;

      if (!isConfigured) {
        // Formspree endpoint hasn't been set up yet — fall back to a clear,
        // honest confirmation so the demo still "works" end to end.
        setTimeout(function () {
          statusEl.textContent =
            "Thanks! (Demo mode: connect a Formspree endpoint in index.html to actually deliver this message.)";
          statusEl.className = "form-status success";
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
          form.reset();
        }, 500);
        return;
      }

      fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      })
        .then(function (response) {
          if (response.ok) {
            statusEl.textContent = "Thanks — a specialist will be in touch shortly.";
            statusEl.className = "form-status success";
            form.reset();
          } else {
            return response.json().then(function (data) {
              var msg =
                (data && data.errors && data.errors.map(function (er) { return er.message; }).join(", ")) ||
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
          submitBtn.textContent = originalLabel;
        });
    });
  }
})();
