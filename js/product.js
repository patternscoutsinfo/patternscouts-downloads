/* =====================================================================
   One product's page.

   Reads ?p=slug, calls ps_product(), and renders what the software is
   for, then its own prices. Every number comes from the database; if it
   cannot be fetched the page says so instead of guessing.
   ===================================================================== */

(function () {
  "use strict";

  var A = window.PSApi;
  var slug = new URLSearchParams(window.location.search).get("p");

  var elHead = document.getElementById("head");
  var elAbout = document.getElementById("about");
  var elPlans = document.getElementById("plans");
  var elAlso = document.getElementById("also");
  var secAbout = document.getElementById("about-section");
  var secPlans = document.getElementById("plans-section");

  function fail(msg) {
    elHead.innerHTML = '<div class="state error">' + A.escapeHtml(msg) +
      ' <a href="/#software">See all software</a>.</div>';
  }

  if (!slug) { fail("No software chosen."); return; }

  function buyHref(plan) {
    return "/buy.html?p=" + encodeURIComponent(slug) + "&plan=" + encodeURIComponent(plan.code);
  }

  function planCard(plan, p, symbol, best) {
    var price = A.money(plan.price, symbol);
    var strike = A.money(plan.strike_price, symbol);
    var features = Array.isArray(plan.features) && plan.features.length
      ? "<ul>" + plan.features.map(function (f) { return "<li>" + A.escapeHtml(f) + "</li>"; }).join("") + "</ul>"
      : "";
    var cta = p.sellable && Number(plan.price) > 0
      ? '<a class="btn btn-primary btn-block" href="' + buyHref(plan) + '">Buy ' + A.escapeHtml(plan.name) + "</a>"
      : '<span class="btn btn-block" aria-disabled="true">Not on sale yet</span>';
    var machines = plan.seat_limit > 1 ? " &middot; " + plan.seat_limit + " computers" : " &middot; 1 computer";
    return (
      '<article class="card plan' + (best ? " best" : "") + '">' +
        (best ? '<span class="badge badge-best">Best value</span>' : "") +
        '<p class="plan-name">' + A.escapeHtml(plan.name) + "</p>" +
        '<div class="price-row"><span class="price">' + (price || "&mdash;") + "</span>" +
          (strike ? '<span class="strike">' + strike + "</span>" : "") + "</div>" +
        '<p class="per">for ' + A.escapeHtml(A.planPeriod(plan.days)) + machines + "</p>" +
        '<p class="blurb">' + A.escapeHtml(plan.blurb || "") + "</p>" +
        features + cta +
      "</article>"
    );
  }

  A.rpc("ps_product", { p_slug: slug })
    .then(function (p) {
      if (!p) { fail("We could not find that software. It may have been renamed."); return; }

      var symbol = p.currency_symbol || "Rs.";
      var accent = p.accent_colour || "#17624F";
      document.title = p.name + " — PatternScouts";
      document.documentElement.style.setProperty("--accent", accent);
      var meta = document.querySelector('meta[name="description"]');
      if (meta && p.one_liner) meta.setAttribute("content", p.one_liner);

      var badge = p.status === "coming_soon" ? '<span class="badge badge-soon">Coming soon</span>'
        : p.status === "beta" ? '<span class="badge badge-beta">Beta</span>' : "";
      var cta = p.sellable
        ? '<div class="hero-actions"><a class="btn btn-primary" href="#plans-section">See plans and buy</a>' +
          '<a class="btn btn-ghost" href="/download.html">Download Bird Flew</a></div>'
        : '<div class="hero-actions"><a class="btn btn-ghost" href="/contact.html?topic=Buying">Tell me when it launches</a></div>';

      elHead.innerHTML =
        '<div class="product-hero" style="--accent:' + A.escapeHtml(accent) + '">' +
          '<div class="product-icon" aria-hidden="true">' + A.escapeHtml(p.icon || "") + "</div>" +
          "<div>" +
            "<h1>" + A.escapeHtml(p.name) + " " + badge + "</h1>" +
            '<p class="lede"><strong style="color:var(--ink)">' + A.escapeHtml(p.tagline || "") + "</strong> " +
              A.escapeHtml(p.one_liner || "") + "</p>" +
            cta +
          "</div>" +
        "</div>";

      var about = "";
      if (p.what_it_is_for) {
        about += '<div class="callout" style="margin-bottom:28px"><h2 style="font-size:1.35rem">What it is built for</h2><p>' +
          A.escapeHtml(p.what_it_is_for) + "</p></div>";
      }
      if (p.long_description) about += '<div class="prose">' + A.paragraphs(p.long_description) + "</div>";
      if (Array.isArray(p.features) && p.features.length) {
        about += '<div class="features">' + p.features.map(function (f) {
          var title = typeof f === "object" ? (f.title || f.name || "") : String(f);
          var desc = typeof f === "object" ? (f.description || f.desc || "") : "";
          return '<div class="feature"><h4>' + A.escapeHtml(title) + "</h4>" +
            (desc ? "<p>" + A.escapeHtml(desc) + "</p>" : "") + "</div>";
        }).join("") + "</div>";
      }
      if (about) { elAbout.innerHTML = about; secAbout.hidden = false; }

      var plans = p.plans || [];
      if (plans.length) {
        // "Best value": the longest plan, when there is more than one paid plan.
        var paid = plans.filter(function (pl) { return Number(pl.price) > 0 && pl.code !== "trial"; });
        var bestCode = paid.length > 1
          ? paid.slice().sort(function (a, b) { return (b.days || 99999) - (a.days || 99999); })[0].code : null;
        elPlans.innerHTML = plans.map(function (pl) {
          return planCard(pl, p, symbol, pl.code === bestCode);
        }).join("");
        document.getElementById("plans-sub").textContent = p.sellable
          ? "Pay by UPI. Your key arrives by email, and the plan never renews on its own."
          : "These are the plans it will launch with.";
        secPlans.hidden = false;
      }

      var bundles = (p.bundles || []).filter(function (b) { return b && Number(b.price) > 0; });
      if (bundles.length) {
        elAlso.innerHTML = bundles.map(function (b) {
          var price = A.money(b.price, symbol);
          return '<div class="callout"><h3>' + A.escapeHtml(b.name) + "</h3><p>" + A.escapeHtml(b.description || "") +
            (price ? " <strong>" + price + "</strong>." : "") + ' <a href="/#combo">See the combo</a></p></div>';
        }).join("");
      }
    })
    .catch(function (e) {
      fail("Could not load this page just now. Please refresh.");
      if (window.console) console.error(e);
    });
})();
