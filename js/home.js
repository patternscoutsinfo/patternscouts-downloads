/* =====================================================================
   The home page.

   One call to ps_catalogue() draws the product cards and the combo
   offers. There is not a single price in the HTML: if the call fails the
   page says so rather than showing a number that might be wrong. A new
   product is a new row in ps_products -- nothing here changes.
   ===================================================================== */

(function () {
  "use strict";

  var A = window.PSApi;
  var elProducts = document.getElementById("products");
  var elBundles = document.getElementById("bundles");
  var secCombo = document.getElementById("combo");

  function href(slug) { return "/product.html?p=" + encodeURIComponent(slug); }

  function badge(p) {
    if (p.status === "coming_soon") return '<span class="badge badge-soon">Coming soon</span>';
    if (p.status === "beta") return '<span class="badge badge-beta">Beta</span>';
    return "";
  }

  /* "From Rs. 200 a month": the cheapest paid plan that is not a trial. */
  function fromPrice(p, symbol) {
    var plans = (p.plans || []).filter(function (pl) {
      return pl.code !== "trial" && Number(pl.price) > 0;
    });
    if (!p.sellable || !plans.length) return "";
    plans.sort(function (a, b) { return Number(a.price) - Number(b.price); });
    var pl = plans[0];
    return '<p class="from">From <strong>' + A.money(pl.price, symbol) + "</strong> / " +
      A.escapeHtml(A.planPeriod(pl.days).replace(/^a /, "")) + "</p>";
  }

  function productCard(p, symbol) {
    var cta = p.sellable
      ? '<a class="btn btn-primary" href="' + href(p.slug) + '">See plans</a>'
      : '<a class="btn btn-ghost" href="' + href(p.slug) + '">See what it does</a>';
    return (
      '<article class="card product-card" style="--accent:' + A.escapeHtml(p.accent_colour || "#17624F") + '">' +
        '<div class="product-icon" aria-hidden="true">' + A.escapeHtml(p.icon || "") + "</div>" +
        "<h3>" + A.escapeHtml(p.name) + " " + badge(p) + "</h3>" +
        '<p class="tagline">' + A.escapeHtml(p.tagline || "") + "</p>" +
        '<p class="one-liner">' + A.escapeHtml(p.one_liner || "") + "</p>" +
        fromPrice(p, symbol) +
        '<div class="card-actions">' + cta + "</div>" +
      "</article>"
    );
  }

  var FUTURE =
    '<article class="card product-card future-card" style="--accent:var(--line)">' +
      '<div class="product-icon" aria-hidden="true">&#10024;</div>' +
      "<h3>More tools on the way</h3>" +
      '<p class="one-liner">We are building more apps for everyday office work. Tell us the job you would like automated next &mdash; it may be the next one we make.</p>' +
      '<div class="card-actions"><a class="btn btn-ghost" href="/contact.html?topic=Idea">Suggest a tool</a></div>' +
    "</article>";

  function bundleCard(b, symbol) {
    var sym = b.currency === "INR" ? symbol : b.currency;
    var price = A.money(b.price, sym);
    var list = A.money(b.list_total, sym);
    var saving = A.money(b.saving, sym);
    var items = (b.items || []).map(function (i) {
      return "<li>" + A.escapeHtml(i.product_name || i.product) + "</li>";
    }).join("");
    // A bundle is only buyable when every product inside it is on sale.
    var cta = b.sellable
      ? '<a class="btn btn-primary" href="/contact.html?topic=Buying">Get the bundle</a>'
      : '<span class="btn" aria-disabled="true">Available when every app has launched</span>';
    return (
      '<div class="combo">' +
        "<div>" +
          '<p class="eyebrow" style="color:var(--saffron)">Better together</p>' +
          "<h3>" + A.escapeHtml(b.name) + "</h3>" +
          "<p>" + A.escapeHtml(b.description || "") + "</p>" +
          "<ul>" + items + "</ul>" +
        "</div>" +
        '<div class="combo-price">' +
          (list && Number(b.saving) > 0 ? '<span class="strike">' + list + "</span>" : "") +
          '<span class="price">' + (price || "&mdash;") + "</span>" +
          (saving && Number(b.saving) > 0
            ? '<span class="saving">You save ' + saving +
              (b.discount_pct ? " &middot; " + Math.round(b.discount_pct) + "% off" : "") + "</span>"
            : "") +
          cta +
        "</div>" +
      "</div>"
    );
  }

  A.rpc("ps_catalogue")
    .then(function (data) {
      if (!data) throw new Error("empty catalogue");
      var symbol = data.currency_symbol || "Rs.";
      var products = (data.products || []).filter(function (p) { return p.status !== "beta"; });
      elProducts.innerHTML = products.map(function (p) { return productCard(p, symbol); }).join("") + FUTURE;

      var bundles = (data.bundles || []).filter(function (b) { return b && Number(b.price) > 0; });
      if (bundles.length) {
        elBundles.innerHTML = bundles.map(function (b) { return bundleCard(b, symbol); }).join("");
        secCombo.hidden = false;
      }
    })
    .catch(function (e) {
      // Deliberately no fallback prices. A wrong number is worse than none.
      elProducts.innerHTML = '<div class="state error">Could not load the software list just now. Please refresh, or <a href="/contact.html">get in touch</a>.</div>';
      if (window.console) console.error(e);
    });
})();
