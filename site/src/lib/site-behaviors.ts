// Page behaviors: hero map, mobile menu, scroll reveals, process progress,
// sticky booking bar, lazy Calendly embed and the message form.
// Runs once after React has rendered the page (see App.tsx).

let initialized = false;

// Set by the hosted preview build (see scripts/build-preview.py): the preview host blocks
// third-party frames and mail links, so the calendar links out and the form stays local.
const isPreview = () => Boolean((window as unknown as { OSSMARK_PREVIEW?: boolean }).OSSMARK_PREVIEW);

export function initSite(): () => void {
  if (initialized) return () => {};
  initialized = true;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const SVG_NS = "http://www.w3.org/2000/svg";

  /* ------------------------------------------------------------------
     Placeholder review mode: add ?replace to the URL.
     ------------------------------------------------------------------ */
  if (new URLSearchParams(location.search).has("replace")) {
    document.documentElement.classList.add("show-replace");
    const count = document.querySelectorAll("[data-replace]").length;
    const banner = document.createElement("div");
    banner.className = "show-replace-banner";
    banner.setAttribute("role", "status");
    banner.textContent = `${count} placeholders outlined. See site/REPLACE.md for the full list.`;
    document.body.appendChild(banner);
  }

  /* ------------------------------------------------------------------
     Footer year
     ------------------------------------------------------------------ */
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------------------------
     Header: solid background once the page scrolls
     ------------------------------------------------------------------ */
  const header = document.querySelector<HTMLElement>("[data-header]");
  if (header) {
    const sentinel = document.createElement("div");
    sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none";
    sentinel.setAttribute("aria-hidden", "true");
    document.body.prepend(sentinel);
    new IntersectionObserver(([entry]) => {
      header.classList.toggle("is-scrolled", !entry.isIntersecting);
    }).observe(sentinel);
  }

  /* ------------------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------------------ */
  const toggle = document.querySelector<HTMLButtonElement>("[data-nav-toggle]");
  const nav = document.querySelector<HTMLElement>("[data-nav]");
  if (toggle && nav) {
    const setOpen = (open: boolean) => {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      header?.classList.toggle("nav-open", open);
    };
    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    nav.addEventListener("click", (e) => { if ((e.target as Element).closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia("(min-width: 861px)").addEventListener("change", (e) => { if (e.matches) setOpen(false); });
  }

  /* ------------------------------------------------------------------
     Hero map — South Jersey towns plotted from real coordinates
     ------------------------------------------------------------------ */
  const map = document.querySelector<SVGSVGElement>("[data-map]");
  if (map) buildMap(map);

  function buildMap(svg: SVGSVGElement) {
    // REPLACE: set HUB to the town Ossmark is based in.
    const HUB = "Cherry Hill";
    const towns: [string, number, number, boolean][] = [
      // [name, lat, lon, showLabel]
      ["Burlington", 40.071, -74.865, false],
      ["Moorestown", 39.969, -74.949, true],
      ["Cherry Hill", 39.934, -75.031, true],
      ["Collingswood", 39.918, -75.071, false],
      ["Mount Laurel", 39.934, -74.891, false],
      ["Haddonfield", 39.891, -75.038, false],
      ["Marlton", 39.891, -74.922, false],
      ["Medford", 39.900, -74.823, false],
      ["Voorhees", 39.852, -74.952, false],
      ["Washington Twp", 39.750, -75.070, false],
      ["Mullica Hill", 39.739, -75.224, false],
      ["Glassboro", 39.702, -75.112, true],
      ["Pennsville", 39.653, -75.516, false],
      ["Hammonton", 39.637, -74.802, true],
      ["Vineland", 39.486, -75.026, true],
      ["Millville", 39.402, -75.039, false],
      ["Egg Harbor Twp", 39.380, -74.600, false],
      ["Atlantic City", 39.364, -74.423, true],
      ["Ocean City", 39.278, -74.575, true],
      ["Sea Isle City", 39.153, -74.693, false],
      ["Wildwood", 38.992, -74.815, false],
      ["Cape May", 38.935, -74.906, true],
    ];

    // Equirectangular projection scaled by cos(latitude) so distances read true.
    const W = 400, H = 520, PAD = 34;
    const lats = towns.map((t) => t[1]), lons = towns.map((t) => t[2]);
    const latMin = Math.min(...lats), latMax = Math.max(...lats);
    const lonMin = Math.min(...lons), lonMax = Math.max(...lons);
    const kx = Math.cos(((latMin + latMax) / 2) * Math.PI / 180);
    const spanX = (lonMax - lonMin) * kx, spanY = latMax - latMin;
    const scale = Math.min((W - PAD * 2) / spanX, (H - PAD * 2) / spanY);
    const offX = (W - spanX * scale) / 2, offY = (H - spanY * scale) / 2;
    const project = (lat: number, lon: number): [number, number] => [
      offX + (lon - lonMin) * kx * scale,
      offY + (latMax - lat) * scale,
    ];

    const el = (name: string, attrs: Record<string, string | number>, parent?: Element) => {
      const node = document.createElementNS(SVG_NS, name);
      for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
      if (parent) parent.appendChild(node);
      return node;
    };

    const routes = el("g", { "aria-hidden": "true" }, svg);
    const pulses = el("g", { "aria-hidden": "true" }, svg);
    const dots = el("g", { "aria-hidden": "true" }, svg);
    const labels = el("g", { "aria-hidden": "true" }, svg);

    // Orientation labels (approximate placement)
    const [rx, ry] = project(39.40, -75.38);
    el("text", { x: rx, y: ry, class: "region-label", "text-anchor": "middle" }, labels).textContent = "Delaware Bay";
    const [ox, oy] = project(39.08, -74.43);
    el("text", { x: ox, y: oy, class: "region-label", "text-anchor": "middle" }, labels).textContent = "Atlantic Ocean";

    const hub = towns.find((t) => t[0] === HUB) || towns[0];
    const [hx, hy] = project(hub[1], hub[2]);

    // Order towns by distance from the hub so the animation radiates outward.
    const ordered = towns
      .map((t) => {
        const [x, y] = project(t[1], t[2]);
        return { name: t[0], x, y, label: t[3], d: Math.hypot(x - hx, y - hy) };
      })
      .sort((a, b) => a.d - b.d);

    ordered.forEach((t, i) => {
      const isHub = t.name === hub[0];
      if (!isHub) {
        // Gentle arc from the hub to each town
        const mx = (hx + t.x) / 2, my = (hy + t.y) / 2;
        const nx = -(t.y - hy), ny = t.x - hx;
        const len = Math.hypot(nx, ny) || 1;
        const bend = Math.min(40, t.d * 0.18);
        const cx = mx + (nx / len) * bend, cy = my + (ny / len) * bend;
        const path = el("path", {
          d: `M${hx.toFixed(1)} ${hy.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${t.x.toFixed(1)} ${t.y.toFixed(1)}`,
          class: "route",
        }, routes);
        const L = Math.ceil(t.d * 1.15);
        path.style.setProperty("--len", String(L));
        path.style.setProperty("--i", String(i));

        // Pulse ring; each town fires at its own moment in the cycle.
        const ring = el("circle", { cx: t.x, cy: t.y, r: 5, class: "pulse" }, pulses);
        ring.style.setProperty("--p", String(Math.round((i * 997) % 3600)));
      }

      const dot = el("circle", {
        cx: t.x,
        cy: t.y,
        r: isHub ? 8 : 4.5,
        class: isHub ? "town-dot is-hub" : "town-dot",
      }, dots);
      dot.style.setProperty("--i", String(i));

      if (t.label || isHub) {
        // Labels sit to the right of the dot, except near the coast where they would clip.
        const right = !["Atlantic City", "Ocean City"].includes(t.name);
        // Atlantic City's label sits above its dot so it clears Egg Harbor Twp.
        const above = t.name === "Atlantic City";
        const text = el("text", {
          x: t.x + (right ? 11 : above ? 4 : -11),
          y: t.y + (above ? -11 : 4.5),
          class: "town-label",
          "text-anchor": right ? "start" : "end",
        }, labels);
        text.textContent = t.name;
        text.style.setProperty("--i", String(i));
      }
    });

    // Pause the ambient pulse loop when off screen or the tab is hidden.
    let visible = true;
    const sync = () => svg.classList.toggle("is-paused", !visible || document.hidden);
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: 0.05 }).observe(svg);
    document.addEventListener("visibilitychange", sync);
  }

  /* ------------------------------------------------------------------
     Process steps: progress line fills as each step scrolls into view
     ------------------------------------------------------------------ */
  const steps = document.querySelector<HTMLElement>("[data-steps]");
  if (steps) {
    const items = [...steps.querySelectorAll<HTMLElement>(".step")];
    const reached = new Set<HTMLElement>();
    const update = () => {
      const last = Math.max(-1, ...[...reached].map((el) => items.indexOf(el)));
      items.forEach((el, i) => el.classList.toggle("is-reached", i <= last));
      const progress = items.length > 1 ? Math.max(0, last) / (items.length - 1) : 1;
      steps.style.setProperty("--progress", progress.toFixed(3));
    };
    if (reduceMotion.matches || !("IntersectionObserver" in window)) {
      items.forEach((el) => reached.add(el));
      update();
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { reached.add(e.target as HTMLElement); io.unobserve(e.target); }
        });
        update();
      }, { rootMargin: "0px 0px -35% 0px" });
      items.forEach((el) => io.observe(el));
    }
  }

  /* ------------------------------------------------------------------
     Scroll reveals (a few key blocks, once each) + closing logo reveal
     ------------------------------------------------------------------ */
  const revealTargets = document.querySelectorAll("[data-reveal], [data-closer-logo]");
  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    revealTargets.forEach((el) => el.classList.add("is-in"));
  } else {
    const revealIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); revealIO.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -12% 0px" });
    revealTargets.forEach((el) => revealIO.observe(el));
  }

  /* ------------------------------------------------------------------
     Mobile sticky "Book" bar: shows after the hero, hides at the booking
     section so it never covers the calendar or the form.
     ------------------------------------------------------------------ */
  const sticky = document.querySelector<HTMLElement>("[data-sticky-cta]");
  const heroEl = document.querySelector<HTMLElement>(".hero-actions");
  const bookEl = document.querySelector<HTMLElement>("#book");
  if (sticky && heroEl && bookEl && "IntersectionObserver" in window) {
    let pastHero = false, atBook = false;
    const stickyLink = sticky.querySelector("a")!;
    const syncSticky = () => {
      const show = pastHero && !atBook;
      sticky.classList.toggle("is-visible", show);
      sticky.setAttribute("aria-hidden", String(!show));
      stickyLink.tabIndex = show ? 0 : -1;
    };
    new IntersectionObserver(([e]) => {
      pastHero = !e.isIntersecting && e.boundingClientRect.top < 0;
      syncSticky();
    }).observe(heroEl);
    new IntersectionObserver(([e]) => { atBook = e.isIntersecting; syncSticky(); }, { rootMargin: "0px 0px -20% 0px" }).observe(bookEl);
  }

  /* ------------------------------------------------------------------
     Calendly inline embed, loaded only when the visitor heads for it
     ------------------------------------------------------------------ */
  const cal = document.querySelector<HTMLElement>("[data-calendly]");
  if (cal) {
    let loaded = false;
    const loadCalendly = () => {
      if (loaded || isPreview()) return;
      loaded = true;
      const url = new URL(cal.dataset.url!);
      url.searchParams.set("hide_gdpr_banner", "1");
      url.searchParams.set("background_color", "ffffff");
      url.searchParams.set("text_color", "141414");
      url.searchParams.set("primary_color", "000000");
      url.searchParams.set("embed_domain", location.hostname || "localhost");
      url.searchParams.set("embed_type", "Inline");
      const frame = document.createElement("iframe");
      frame.src = url.toString();
      frame.title = "Book a 15-minute discovery call with Ossmark Media";
      frame.loading = "lazy";
      frame.addEventListener("load", () => cal.classList.add("is-loaded"));
      cal.appendChild(frame);
    };
    // Start loading when the booking section is near, or as soon as someone clicks a "Book" link.
    if ("IntersectionObserver" in window) {
      const calIO = new IntersectionObserver(([e]) => { if (e.isIntersecting) { loadCalendly(); calIO.disconnect(); } }, { rootMargin: "800px 0px" });
      calIO.observe(cal);
    } else {
      loadCalendly();
    }
    document.addEventListener("click", (e) => { if ((e.target as Element).closest('a[href="#book"]')) loadCalendly(); });

    // Calendly posts messages from the iframe; confirm the booking on the page.
    const booked = document.querySelector("[data-booked]");
    window.addEventListener("message", (e) => {
      if (e.origin !== "https://calendly.com" || !e.data || typeof e.data.event !== "string") return;
      if (e.data.event === "calendly.event_scheduled" && booked) {
        booked.textContent = "You’re booked. Check your email for the Zoom link and what to expect.";
        // REPLACE (optional): fire your ad pixels' conversion events here, e.g. fbq('track', 'Schedule').
      }
    });
  }

  /* ------------------------------------------------------------------
     Contact form: validate on blur, summarise errors on submit
     ------------------------------------------------------------------ */
  const form = document.querySelector<HTMLFormElement>("[data-form]");
  if (form) setupForm(form);

  function setupForm(f: HTMLFormElement) {
    const summary = f.querySelector<HTMLElement>("[data-error-summary]")!;
    const status = f.querySelector<HTMLElement>("[data-status]")!;
    const submit = f.querySelector<HTMLButtonElement>("[data-submit]")!;

    type Rule = (v: string) => string;
    const rules: Record<string, Rule> = {
      name: (v) => (v.trim() ? "" : "Enter your name."),
      business: (v) => (v.trim() ? "" : "Enter your business name."),
      email: (v) => {
        if (!v.trim()) return "Enter your email address.";
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Enter an email address like name@business.com.";
      },
    };

    const validate = (input: HTMLInputElement) => {
      const rule = rules[input.name];
      if (!rule) return "";
      const msg = rule(input.value);
      const field = input.closest(".field")!;
      const err = f.querySelector(`#${input.id}-err`);
      field.classList.toggle("has-error", Boolean(msg));
      input.setAttribute("aria-invalid", msg ? "true" : "false");
      if (err) err.textContent = msg;
      return msg;
    };

    Object.keys(rules).forEach((name) => {
      const input = f.elements.namedItem(name) as HTMLInputElement;
      input.addEventListener("blur", () => { if (input.value || input.getAttribute("aria-invalid")) validate(input); });
      input.addEventListener("input", () => { if (input.getAttribute("aria-invalid") === "true") validate(input); });
    });

    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      status.textContent = "";
      status.className = "form-status";

      const errors = Object.keys(rules)
        .map((name) => { const input = f.elements.namedItem(name) as HTMLInputElement; return { input, msg: validate(input) }; })
        .filter((x) => x.msg);

      const list = summary.querySelector("ul")!;
      list.innerHTML = "";
      if (errors.length) {
        errors.forEach(({ input, msg }) => {
          const li = document.createElement("li");
          const a = document.createElement("a");
          a.href = `#${input.id}`;
          a.textContent = msg;
          a.addEventListener("click", (ev) => { ev.preventDefault(); input.focus(); });
          li.appendChild(a);
          list.appendChild(li);
        });
        summary.hidden = false;
        summary.focus();
        return;
      }
      summary.hidden = true;

      const data = Object.fromEntries(new FormData(f).entries());
      const endpoint = f.dataset.endpoint;

      if (isPreview()) {
        status.textContent = "This is a preview, so the message wasn’t sent. On the live site it goes to donoven@ossmark.media.";
        status.classList.add("is-success");
        return;
      }

      if (!endpoint) {
        // No form handler configured yet: hand off to the visitor's email app.
        const body = [
          `Name: ${data.name}`,
          `Business: ${data.business}`,
          `Email: ${data.email}`,
          `Phone: ${data.phone || "-"}`,
          `Monthly ad budget: ${data.budget || "Not sure yet"}`,
          "",
          data.message || "",
        ].join("\n");
        const subject = `Free ad audit request: ${data.business}`;
        location.href = `mailto:${f.dataset.mailto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        status.textContent = "Your email app should open with your request filled in. Hit send and we’ll reply within one business day.";
        status.classList.add("is-success");
        return;
      }

      submit.setAttribute("aria-busy", "true");
      submit.disabled = true;
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(String(res.status));
        f.reset();
        status.textContent = "Request sent. We’ll reply within one business day to book your audit.";
        status.classList.add("is-success");
      } catch {
        status.textContent = `Your request didn’t go through. Please try again, or email us at ${f.dataset.mailto}.`;
        status.classList.add("is-error");
      } finally {
        submit.removeAttribute("aria-busy");
        submit.disabled = false;
      }
    });
  }
  return () => {};
}
