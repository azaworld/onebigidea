// One Big Idea Learning Hub: video facades, quizzes, action checklists, progress (XP + streak), search and filters.
(function () {
  var P = document.documentElement.getAttribute('data-base') || '/';
  var KEY = 'obi-progress-v1';
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  var st = load(); st.learned = st.learned || {}; st.quiz = st.quiz || {}; st.days = st.days || [];
  function today() { return new Date().toISOString().slice(0, 10); }
  function touch() { if (st.days.indexOf(today()) < 0) { st.days.push(today()); st.days = st.days.slice(-400); } }
  function xp() { return Object.keys(st.learned).length * 10 + Object.keys(st.quiz).length * 5; }
  function streak() {
    var set = {}; st.days.forEach(function (d) { set[d] = 1; });
    var n = 0, d = new Date();
    if (!set[today()]) d.setDate(d.getDate() - 1);
    while (set[d.toISOString().slice(0, 10)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function paint() {
    document.querySelectorAll('[data-prog]').forEach(function (el) {
      var s = streak();
      el.textContent = xp() + ' XP · ' + (s ? s + '-day streak' : 'start a streak');
    });
    document.querySelectorAll('[data-done-slug]').forEach(function (el) {
      if (st.learned[el.getAttribute('data-done-slug')]) el.hidden = false;
    });
    var lb = document.querySelector('.learned');
    if (lb && st.learned[lb.getAttribute('data-slug')]) {
      lb.classList.add('is-done');
      lb.querySelector('b').textContent = 'Learned. +10 XP';
      var b = lb.querySelector('button'); if (b) { b.textContent = 'Learned'; b.disabled = true; }
    }
  }

  // click-to-play videos (light YouTube embed)
  document.querySelectorAll('.vid button[data-yt]').forEach(function (b) {
    b.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + b.getAttribute('data-yt') + '?autoplay=1&playsinline=1&rel=0';
      f.title = b.getAttribute('aria-label') || 'Video';
      f.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.allowFullscreen = true;
      b.parentNode.appendChild(f);
      b.remove();
      touch(); save(st); paint();
    });
  });

  // quizzes
  document.querySelectorAll('.quiz').forEach(function (q) {
    var ans = Number(q.getAttribute('data-answer')), slug = q.getAttribute('data-slug');
    var res = q.querySelector('.res'), why = q.getAttribute('data-why') || '';
    q.querySelectorAll('.opt').forEach(function (b, i) {
      b.addEventListener('click', function () {
        q.querySelectorAll('.opt').forEach(function (x, j) {
          x.disabled = true; x.classList.toggle('right', j === ans); x.classList.toggle('wrong', j === i && i !== ans);
        });
        if (i === ans) { res.textContent = 'Correct! +5 XP. ' + why; if (slug) st.quiz[slug] = 1; }
        else { res.textContent = 'Not quite. ' + why; }
        touch(); save(st); paint();
      });
    });
  });

  // action checklist (remembered per lesson)
  var page = location.pathname;
  st.acts = st.acts || {};
  document.querySelectorAll('.acts input').forEach(function (c) {
    var k = page + '#' + c.id;
    if (st.acts[k]) c.checked = true;
    c.addEventListener('change', function () { st.acts[k] = c.checked; touch(); save(st); });
  });

  // mark as learned
  var lb = document.querySelector('.learned button');
  if (lb) lb.addEventListener('click', function () {
    st.learned[document.querySelector('.learned').getAttribute('data-slug')] = today();
    touch(); save(st); paint();
  });

  // share / copy
  var cp = document.querySelector('[data-copy]');
  if (cp) cp.addEventListener('click', function () {
    var t = document.querySelector('.toast');
    if (navigator.share) { navigator.share({ title: document.title, url: location.href }).catch(function () {}); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () {
      if (t) { t.textContent = 'Link copied'; setTimeout(function () { t.textContent = ''; }, 2000); }
    }, function () {});
  });

  // filter + live search on lesson grids
  var grid = document.querySelector('[data-grid]');
  if (grid) {
    var cards = [].slice.call(grid.querySelectorAll('.card'));
    var chips = [].slice.call(document.querySelectorAll('[data-filter]'));
    var input = document.querySelector('[data-live]');
    var empty = document.querySelector('[data-empty]');
    var active = 'all';
    function apply() {
      var q = (input && input.value || '').trim().toLowerCase(), shown = 0;
      cards.forEach(function (c) {
        var ok = (active === 'all' || c.getAttribute('data-beat') === active) &&
                 (!q || c.getAttribute('data-text').indexOf(q) >= 0);
        c.hidden = !ok; if (ok) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    }
    chips.forEach(function (c) { c.addEventListener('click', function () {
      active = c.getAttribute('data-filter'); chips.forEach(function (x) { x.classList.toggle('on', x === c); }); apply();
    }); });
    if (input) input.addEventListener('input', apply);
    var q0 = new URLSearchParams(location.search).get('q');
    if (q0 && input) { input.value = q0; apply(); }
  }

  paint();
})();
