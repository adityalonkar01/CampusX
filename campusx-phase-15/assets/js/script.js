document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Dynamic footer year.
  const year = document.querySelector("#current-year");
  if (year) year.textContent = new Date().getFullYear();

  // Add shadow to sticky header after scrolling.
  const header = document.querySelector(".site-header");
  const updateHeader = () => header?.classList.toggle("scrolled", window.scrollY > 10);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  // Smooth in-page navigation for same-page anchors.
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    const targetId = link.getAttribute("href");
    if (!targetId || targetId === "#") return;
    const target = document.querySelector(targetId);
    if (!target) return;
    link.addEventListener("click", event => {
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  });

  // Reveal content as it enters the viewport.
  const revealItems = document.querySelectorAll(".reveal");
  if (reduceMotion) {
    revealItems.forEach(item => item.classList.add("visible"));
  } else if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("visible"));
  }

  // Highlight the relevant in-page navigation item while scrolling.
  const sectionLinks = [...document.querySelectorAll('.primary-nav .nav-link[data-section]')];
  const trackedSections = sectionLinks.map(link => ({ link, section: document.getElementById(link.dataset.section) })).filter(item => item.section);
  if ("IntersectionObserver" in window && trackedSections.length) {
    const activeObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach(link => link.classList.remove("active"));
        const match = trackedSections.find(item => item.section === entry.target);
        match?.link.classList.add("active");
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });
    trackedSections.forEach(item => activeObserver.observe(item.section));
  }

  // Accessible, subtle number counters. Values are placeholders for future DB data.
  const counters = document.querySelectorAll("[data-counter]");
  const setCounter = element => {
    const target = Number(element.dataset.counter);
    const suffix = element.dataset.suffix || "";
    element.textContent = `${target.toLocaleString()}${suffix}`;
  };
  const animateCounter = element => {
    if (reduceMotion) return setCounter(element);
    const target = Number(element.dataset.counter);
    const suffix = element.dataset.suffix || "";
    const duration = 900;
    const start = performance.now();
    const tick = now => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = `${Math.round(target * eased).toLocaleString()}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window && counters.length) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(counter => counterObserver.observe(counter));
  } else {
    counters.forEach(setCounter);
  }

  // Contact form: frontend-only validation for future PHP integration.
  const form = document.querySelector("#contact-form");
  if (form) {
    const status = document.querySelector("#contact-status");
    const message = document.querySelector("#message");
    const messageCount = document.querySelector("#message-count");
    const toast = document.querySelector("#toast");

    const showToast = text => {
      if (!toast) return;
      toast.textContent = text;
      toast.classList.add("show");
      window.clearTimeout(showToast.timeout);
      showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 3200);
    };

    const setError = (field, messageText) => {
      const wrapper = field.closest(".form-field");
      const error = document.querySelector(`[data-error-for="${field.id}"]`);
      wrapper?.classList.toggle("invalid", Boolean(messageText));
      if (error) error.textContent = messageText;
      field.setAttribute("aria-invalid", String(Boolean(messageText)));
    };

    const validate = field => {
      const value = field.value.trim();
      let error = "";
      if (field.required && !value) error = "This field is required.";
      else if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Enter a valid email address.";
      else if (field.minLength > 0 && value && value.length < field.minLength) error = `Use at least ${field.minLength} characters.`;
      else if (field.maxLength > 0 && value.length > field.maxLength) error = `Use no more than ${field.maxLength} characters.`;
      setError(field, error);
      return !error;
    };

    const fields = [...form.querySelectorAll("input, textarea")];
    fields.forEach(field => {
      field.addEventListener("blur", () => validate(field));
      field.addEventListener("input", () => {
        if (field.closest(".form-field")?.classList.contains("invalid")) validate(field);
        if (field === message && messageCount) messageCount.textContent = `${field.value.length} / ${field.maxLength}`;
      });
    });

    form.addEventListener("submit", event => {
      event.preventDefault();
      const valid = fields.map(validate).every(Boolean);
      if (!valid) {
        status.textContent = "Please correct the highlighted fields before submitting.";
        status.className = "form-status error";
        showToast("Please check the form fields.");
        const firstInvalid = fields.find(field => field.getAttribute("aria-invalid") === "true");
        firstInvalid?.focus();
        return;
      }

      // No network request is made in this frontend-only phase.
      status.textContent = "Your message passed validation. Server submission will be connected in a future PHP integration phase.";
      status.className = "form-status success";
      showToast("Message validated successfully.");
      form.reset();
      fields.forEach(field => setError(field, ""));
      if (messageCount) messageCount.textContent = "0 / 1000";
    });
  }

  // Placeholder footer links intentionally remain inert until legal pages are available.
  document.querySelectorAll(".placeholder-link").forEach(link => {
    link.addEventListener("click", event => event.preventDefault());
  });
});
