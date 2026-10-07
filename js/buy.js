/* =====================================================================
   The Buy page.

   Reads ?p=slug&plan=code, asks bf_website_buy_info() for the price and
   the UPI ID, and shows a UPI QR code for exactly that amount. When the
   customer types the UPI transaction ID, bf_website_register() records
   it for the desk to verify; the key is issued from the desk and
   emailed. The page never sends a price: the database decides it.
   ===================================================================== */

(function () {
  "use strict";

  var A = window.PSApi;
  var q = new URLSearchParams(window.location.search);
  var slug = q.get("p") || "";
  var plan = q.get("plan") || "";

  function $(id) { return document.getElementById(id); }

  function fail(msg) {
    $("title").textContent = "This plan is not available";
    $("state").className = "state error";
    $("state").textContent = msg;
  }

  function upiLink(info) {
    var amount = Number(info.amount).toFixed(2);
    var note = ("PatternScouts " + info.product_name + " " + info.plan_name).slice(0, 50);
    // Some UPI apps reject an escaped "@" (%40) in the payee address.
    return "upi://pay?pa=" + encodeURIComponent(info.upi_id).replace(/%40/g, "@") +
      "&pn=" + encodeURIComponent(info.upi_name) +
      "&am=" + amount + "&cu=INR&tn=" + encodeURIComponent(note);
  }

  function show(info) {
    var price = A.money(info.amount, info.currency_symbol);
    document.title = "Buy " + info.product_name + " — PatternScouts";
    if (info.accent_colour) document.documentElement.style.setProperty("--accent", info.accent_colour);
    $("back").href = "product.html?p=" + encodeURIComponent(info.product);
    $("title").textContent = info.product_name + " — " + info.plan_name;
    $("lede").textContent = price + " for " + A.planPeriod(info.days) + ". Your key arrives by email.";
    $("amount").textContent = price;
    $("upi-id").textContent = info.upi_id;
    $("upi-name").textContent = info.upi_name;

    var link = upiLink(info);
    $("open-app").href = link;

    var qr = qrcode(0, "M");
    qr.addData(link);
    qr.make();
    $("qr").innerHTML = qr.createSvgTag({ cellSize: 5, margin: 3, scalable: true });

    $("copy-upi").addEventListener("click", function () {
      var done = function () { $("copy-upi").textContent = "Copied"; };
      if (navigator.clipboard) navigator.clipboard.writeText(info.upi_id).then(done, function () {});
    });

    if (info.support_email) {
      $("support-link").href = "mailto:" + info.support_email;
      $("support-link").textContent = info.support_email;
      $("help-out").textContent = "Questions? Write to " + info.support_email + " with your reference.";
    }

    $("state").hidden = true;
    $("buy").hidden = false;
  }

  function submit(ev) {
    ev.preventDefault();
    var f = ev.target;
    var err = $("error");
    var btn = $("submit");
    err.hidden = true;
    btn.disabled = true;
    btn.textContent = "Sending…";

    A.rpc("bf_website_register", {
      p_name: f.name.value, p_email: f.email.value, p_phone: f.phone.value,
      p_product: slug, p_plan: plan, p_upi_ref: f.ref.value
    }).then(function (r) {
      if (!r || !r.ok) throw new Error((r && r.error) || "Something went wrong. Please try again.");
      $("ref-out").textContent = r.reference;
      $("email-out").textContent = r.email;
      $("buy").hidden = true;
      $("done").hidden = false;
      window.scrollTo(0, 0);
    }).catch(function (e) {
      err.textContent = /rpc .* failed/.test(e.message)
        ? "We could not reach the server. Please check your internet and try again."
        : e.message;
      err.hidden = false;
      btn.disabled = false;
      btn.textContent = "I have paid — send my key";
    });
  }

  if (!slug || !plan) {
    fail("No plan chosen. Go back and pick one.");
    return;
  }

  $("form").addEventListener("submit", submit);

  A.rpc("bf_website_buy_info", { p_product: slug, p_plan: plan })
    .then(function (info) {
      if (!info || !info.ok) fail((info && info.error) || "That plan is not on sale right now.");
      else show(info);
    })
    .catch(function (e) {
      fail("Could not load this page just now. Please refresh, or get in touch.");
      if (window.console) console.error(e);
    });
})();
