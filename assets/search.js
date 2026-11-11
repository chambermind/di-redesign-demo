(function () {
  var BASE = window.__BASE || '/';
  var q = document.getElementById('q'), res = document.getElementById('res'), cnt = document.getElementById('count');
  var data = null;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]; }); }
  function norm(s) { return s.toLowerCase(); }
  function run() {
    if (!data) return;
    var terms = norm(q.value).split(/\s+/).filter(function (t) { return t.length > 1; });
    if (!terms.length) { res.innerHTML = ''; cnt.textContent = data.length + ' articles in the archive'; return; }
    var out = [];
    for (var i = 0; i < data.length; i++) {
      var d = data[i], t = norm(d[1]), c = norm(d[4].join(' ')), b = norm(d[5]), score = 0, ok = true;
      for (var j = 0; j < terms.length; j++) {
        var s = 0;
        if (t.indexOf(terms[j]) > -1) s += 6;
        if (c.indexOf(terms[j]) > -1) s += 3;
        if (b.indexOf(terms[j]) > -1) s += 1;
        if (!s) { ok = false; break; }
        score += s;
      }
      if (ok) out.push([score, d]);
    }
    out.sort(function (a, b) { return b[0] - a[0] || (a[1][2] < b[1][2] ? 1 : -1); });
    cnt.textContent = out.length + ' result' + (out.length === 1 ? '' : 's') + (out.length > 60 ? ' (showing the best 60)' : '');
    res.innerHTML = out.slice(0, 60).map(function (r) {
      var d = r[1];
      return '<article class="card"><time>' + esc(d[2]) + '</time><h3><a href="' + BASE + d[3] + '">' + esc(d[1]) + '</a></h3><p>' + esc(d[5].slice(0, 180)) + '…</p></article>';
    }).join('');
  }
  var m = /[?&]q=([^&]*)/.exec(location.search);
  if (m) q.value = decodeURIComponent(m[1].replace(/\+/g, ' '));
  document.getElementById('sf').addEventListener('submit', function (e) { e.preventDefault(); run(); });
  q.addEventListener('input', run);
  fetch(BASE + 'assets/search.json').then(function (r) { return r.json(); }).then(function (j) { data = j; run(); });
})();
