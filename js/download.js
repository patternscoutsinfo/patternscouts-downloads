/* =====================================================================
   The "Download for Windows" button: points at the newest Bird Flew
   release in the public downloads repository (releases tagged
   birdflew-v<x>), so a new version needs no change to the website. It
   prefers the one-file installer (...-setup.exe) and falls back to a
   zip. If GitHub cannot be asked, the button opens the releases page.
   ===================================================================== */
(function () {
  "use strict";

  var btn = document.getElementById("get-birdflew");
  var repo = (window.PS || {}).DOWNLOADS_REPO;
  if (!btn || !repo) return;
  btn.href = "https://github.com/" + repo + "/releases";

  fetch("https://api.github.com/repos/" + repo + "/releases?per_page=30")
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (list) {
      var rel = (list || []).find(function (x) {
        return !x.draft && !x.prerelease && /^birdflew-v/.test(x.tag_name || "");
      });
      if (!rel) return;
      var assets = rel.assets || [];
      var asset = assets.find(function (a) { return /setup\.exe$/i.test(a.name); }) ||
                  assets.find(function (a) { return /-windows\.(zip|exe)$/i.test(a.name); });
      if (asset) btn.href = asset.browser_download_url;
      var note = document.getElementById("get-birdflew-note");
      if (note) {
        var mb = asset ? " · " + Math.round(asset.size / 1048576) + " MB" : "";
        note.textContent = "Version " + rel.tag_name.replace(/^birdflew-v/, "") + mb + " · Windows 10 & 11 · free";
      }
    })
    .catch(function () { /* keep the releases page link */ });
})();
