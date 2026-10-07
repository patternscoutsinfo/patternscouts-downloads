/* =====================================================================
   The contact form. Messages land in website_enquiries
   (crow_website_enquiry), which the admin desk pulls with everything
   else from the website.
   ===================================================================== */

(function () {
  "use strict";

  var A = window.PSApi;
  var form = document.getElementById("contact-form");
  var err = document.getElementById("contact-error");
  var ok = document.getElementById("contact-ok");
  var btn = document.getElementById("contact-submit");

  var topic = new URLSearchParams(window.location.search).get("topic");
  if (topic && form.topic.querySelector('option[value="' + topic.replace(/"/g, "") + '"]')) form.topic.value = topic;

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    err.hidden = true;
    var name = form.name.value.trim(), mobile = form.mobile.value.trim();
    var email = form.email.value.trim(), message = form.message.value.trim();
    if (!name || !mobile || !email || !message) {
      err.textContent = "Please fill in every field.";
      err.hidden = false;
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      err.textContent = "Please check your email address.";
      err.hidden = false;
      return;
    }
    btn.disabled = true;
    btn.textContent = "Sending…";
    A.rpc("crow_website_enquiry", {
      p_name: name, p_mobile: mobile, p_email: email, p_topic: form.topic.value, p_message: message
    }).then(function (r) {
      if (!r || !r.ok) throw new Error((r && r.message) || "Could not send. Please try again.");
      form.hidden = true;
      ok.textContent = r.message || "Thank you. We will get back to you within one business day.";
      ok.hidden = false;
    }).catch(function (e) {
      err.textContent = /rpc .* failed/.test(e.message)
        ? "We could not reach the server. Please email us instead." : e.message;
      err.hidden = false;
      btn.disabled = false;
      btn.textContent = "Send message";
    });
  });
})();
