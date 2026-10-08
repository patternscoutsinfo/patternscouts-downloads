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
      // the highest version, whatever order GitHub lists them in
      var ver = function (x) { return (x.tag_name.match(/\d+/g) || []).map(Number); };
      var newer = function (a, b) {
        var p = ver(a), q = ver(b);
        for (var i = 0; i < Math.max(p.length, q.length); i++) {
          if ((p[i] || 0) !== (q[i] || 0)) return (p[i] || 0) > (q[i] || 0) ? a : b;
        }
        return a;
      };
      var rel = (list || []).filter(function (x) {
        return !x.draft && !x.prerelease && /^birdflew-v/.test(x.tag_name || "");
      }).reduce(function (best, x) { return best ? newer(best, x) : x; }, null);
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
