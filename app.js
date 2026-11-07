// One Big Idea: quiz reveal, try-this checklist memory, share and copy link.
(function () {
  document.querySelectorAll('.quiz').forEach(function (q) {
    var ans = Number(q.getAttribute('data-answer'));
    var res = q.querySelector('.res');
    var why = q.getAttribute('data-why') || '';
    q.querySelectorAll('.opt').forEach(function (b, i) {
      b.addEventListener('click', function () {
        q.querySelectorAll('.opt').forEach(function (x, j) {
          x.disabled = true;
          x.classList.toggle('right', j === ans);
          x.classList.toggle('wrong', j === i && i !== ans);
        });
        res.textContent = (i === ans ? 'Correct! ' : 'Not quite. ') + why;
      });
    });
  });

  var key = 'obi-try-' + location.pathname;
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) {}
  document.querySelectorAll('.try input').forEach(function (c) {
    if (saved[c.id]) c.checked = true;
    c.addEventListener('change', function () {
      saved[c.id] = c.checked;
      try { localStorage.setItem(key, JSON.stringify(saved)); } catch (e) {}
    });
  });

  var copy = document.querySelector('[data-copy]');
  if (copy) copy.addEventListener('click', function () {
    var t = document.querySelector('.toast');
    var done = function () { if (t) { t.textContent = 'Link copied'; setTimeout(function () { t.textContent = ''; }, 2000); } };
    if (navigator.share) {
      navigator.share({ title: document.title, url: location.href }).catch(function () {});
      return;
    }
    if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done, function () {});
  });
})();
