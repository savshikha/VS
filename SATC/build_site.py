"""
Build a single HTML file with all dialogue embedded. Open it in a browser — no server needed.
Run once:  python build_site.py
Then open:  SATC/index.html  (double-click or File > Open in browser)
"""
import os
import sys
import time
import json
import pandas as pd

from search import load_dialogues

def main():
    t0 = time.perf_counter()
    df = load_dialogues()
    print("Loaded CSV ({:.1f}s)".format(time.perf_counter() - t0), file=sys.stderr)
    df = df.rename(columns={c: c.strip() for c in df.columns})
    # Vectorized row build (much faster than iterrows)
    season = pd.to_numeric(df.get("Season", pd.Series(dtype=float)), errors="coerce")
    episode = pd.to_numeric(df.get("Episode", pd.Series(dtype=float)), errors="coerce")
    speaker = df.get("Speaker", pd.Series(dtype=str)).fillna("").astype(str).str.strip()
    line = df.get("Line", pd.Series(dtype=str)).fillna("").astype(str).str.strip()

    def _int(x):
        try:
            return None if pd.isna(x) else int(float(x))
        except (TypeError, ValueError):
            return None

    rows = [
        {"season": _int(s), "episode": _int(e), "speaker": sp, "line": ln}
        for s, e, sp, ln in zip(season, episode, speaker, line)
    ]
    print("Built rows ({:.1f}s)".format(time.perf_counter() - t0), file=sys.stderr)
    try:
        import orjson
        data_js = orjson.dumps(rows).decode("utf-8")
    except ImportError:
        data_js = json.dumps(rows)
    print("JSON encoded ({:.1f}s)".format(time.perf_counter() - t0), file=sys.stderr)
    # Prevent </script> in dialogue from closing the script tag
    data_js = data_js.replace("</", "<\\/")

    # Use /avatars/ when deploying to Vercel (images copied during build)
    avatar_base = "/avatars/" if os.environ.get("VERCEL") else "../SATC files/"

    html = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SATC Word Search</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #faf8f5;
      --card: #fff;
      --text: #2c2a26;
      --muted: #6b6560;
      --accent: #c9a86c;
      --accent-soft: #e8dcc8;
      --border: #e5e0d8;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background: var(--bg);
      color: var(--text);
      font-family: 'DM Sans', sans-serif;
      font-size: 16px;
      line-height: 1.5;
    }
    .wrap {
      max-width: 720px;
      margin: 0;
      padding: 2rem 1.25rem 3rem;
      text-align: left;
    }
    h1 {
      font-family: 'Cormorant Garamond', serif;
      font-weight: 600;
      font-size: 1.75rem;
      margin: 0 0 0.5rem;
      color: var(--text);
    }
    .sub {
      font-size: 0.9rem;
      color: var(--muted);
      margin-bottom: 0.75rem;
    }
    .top-words-wrap {
      margin-bottom: 1.25rem;
      padding: 0.6rem 0;
    }
    .top-words-wrap .top-words-title {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 0.5rem;
    }
    .top-words-wrap .top-words-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem 1rem;
    }
    .top-words-wrap .top-word-item {
      font-size: 0.9rem;
      color: var(--text);
    }
    .top-words-wrap .top-word-item .char-name {
      font-weight: 600;
      color: var(--accent);
    }
    .top-words-wrap .top-word-item .word {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
    }
    .search-row {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }
    .search-row input {
      flex: 1;
      padding: 0.75rem 1rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      font: inherit;
      background: var(--card);
      color: var(--text);
    }
    .search-row input::placeholder { color: var(--muted); }
    .search-row input:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-soft);
    }
    .search-row button {
      padding: 0.75rem 1.25rem;
      border: none;
      border-radius: 8px;
      background: var(--accent);
      color: #fff;
      font: inherit;
      font-weight: 500;
      cursor: pointer;
    }
    .search-row button:hover { filter: brightness(0.95); }
    .search-row button:active { transform: scale(0.98); }
    .meta {
      font-size: 0.95rem;
      color: var(--text);
      margin-top: 0.5rem;
    }
    .pills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    .pill {
      display: inline-block;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      background: var(--accent-soft);
      color: var(--text);
      font-size: 0.9rem;
      cursor: pointer;
      border: 2px solid transparent;
    }
    .pill:hover { filter: brightness(0.95); }
    .pill.is-selected {
      border-color: var(--accent);
      background: var(--accent);
      color: #fff;
    }
    .barcode-wrap {
      width: 80vw;
      margin: 1.5rem 0 0 0;
      padding: 0;
      overflow-x: auto;
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch;
    }
    .barcode-character {
      margin-bottom: 1.25rem;
    }
    .barcode-character:last-child { margin-bottom: 0; }
    .barcode-character-label {
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--text);
      margin-bottom: 0.35rem;
    }
    .barcode-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .barcode-avatar {
      width: 64px;
      height: 64px;
      min-width: 64px;
      min-height: 64px;
      border-radius: 50%;
      background: var(--border);
      flex-shrink: 0;
      overflow: hidden;
      border: 4px solid var(--border);
      box-sizing: border-box;
    }
    .barcode-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .barcode-viz-inner {
      position: relative;
      display: inline-block;
      flex: 1;
      min-width: 0;
      border-radius: 4px;
      background: #f0eeeb;
      overflow-x: auto;
      overflow-y: hidden;
    }
    .barcode-character canvas.barcode-main {
      display: block;
      height: 64px;
      cursor: default;
      position: relative;
      z-index: 0;
    }
    .barcode-overlay {
      position: absolute;
      left: 0;
      top: 0;
      pointer-events: none;
      z-index: 1;
      box-shadow: 0 2px 12px rgba(0,0,0,0.2);
    }
    .barcode-tooltip {
      position: fixed;
      z-index: 1000;
      max-width: 320px;
      padding: 0.6rem 0.85rem;
      background: #fff;
      border: 1px solid var(--border);
      border-radius: 10px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      font-size: 0.9rem;
      line-height: 1.4;
      color: var(--text);
      pointer-events: none;
      display: none;
    }
    .barcode-tooltip::before {
      content: '';
      position: absolute;
      bottom: -8px;
      left: var(--arrow-left, 24px);
      transform: translateX(-50%);
      border: 8px solid transparent;
      border-top-color: #fff;
      border-bottom: none;
    }
    .barcode-tooltip .tooltip-speaker {
      font-weight: 600;
      color: var(--accent);
      margin-bottom: 0.25rem;
    }
    .barcode-tooltip .tooltip-line {
      font-family: 'Cormorant Garamond', serif;
    }
    .character-circles-wrap {
      margin: 1.25rem 0 0 0;
      padding: 0;
    }
    .character-circles-wrap .circles-title {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 0.75rem;
    }
    .character-circles-wrap .circles-inner {
      position: relative;
      min-height: 120px;
      width: 100%;
    }
    .character-circles-wrap .circle-item {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
    }
    .character-circles-wrap .circle-avatar {
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
      background: var(--border);
      border: 3px solid var(--border);
      box-sizing: border-box;
      box-shadow: 0 4px 14px rgba(0,0,0,0.08);
    }
    .character-circles-wrap .circle-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .character-circles-wrap .circle-label,
    .character-circles-wrap .circle-count {
      display: none;
    }
    .character-circles-wrap .circle-label {
      font-size: 0.8rem;
      color: var(--text);
      font-weight: 500;
      text-align: center;
      max-width: 120px;
    }
    .character-circles-wrap .circle-count {
      font-size: 0.75rem;
      color: var(--muted);
    }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Sex and the City — Word Search</h1>
    <p class="sub">Search for a word or theme in the series dialogue.</p>
    <div class="top-words-wrap" id="topWordsWrap" aria-label="Most used word per character"></div>
    <div class="search-row">
      <input
        type="text"
        id="q"
        placeholder="e.g. Manolo, love, brunch..."
        autocomplete="off"
        aria-label="Search word or theme"
      />
      <button type="button" id="btn">Search</button>
    </div>
    <div class="meta" id="meta" aria-live="polite"></div>
    <div class="character-circles-wrap" id="characterCirclesWrap" style="display:none;"></div>
    <div class="pills" id="pills"></div>
    <div class="barcode-wrap" id="barcodeWrap" style="display:none;"></div>
  </div>
  <div class="barcode-tooltip" id="barcodeTooltip" role="tooltip"></div>
  <script>
    window.SATC_DATA = __DATA__;
    var qEl = document.getElementById('q');
    var btn = document.getElementById('btn');
    var meta = document.getElementById('meta');
    var pillsEl = document.getElementById('pills');
    var characterCirclesWrap = document.getElementById('characterCirclesWrap');
    var barcodeWrap = document.getElementById('barcodeWrap');
    var SHOW_OTHERS_IN_CIRCLES = false;

    var MAIN_CHARACTERS = [
      { display: 'Carrie Bradshaw', match: function(s) { var t = (s || '').trim(); return t === 'Carrie' || (t.indexOf('Carrie') === 0 && t.indexOf('Carrie Fisher') === -1); }},
      { display: 'Samantha Jones', match: function(s) { var t = (s || '').trim(); return t === 'Samantha' || t.indexOf('Samantha') === 0; }},
      { display: 'Charlotte York', match: function(s) { var t = (s || '').trim(); return t === 'Charlotte' || t.indexOf('Charlotte') === 0; }},
      { display: 'Miranda Hobbes', match: function(s) { var t = (s || '').trim(); return t === 'Miranda' || (t.indexOf('Miranda') === 0 && t.indexOf("Miranda's") === -1 && t.indexOf('Mirando') === -1); }},
      { display: 'Mr. Big (John James Preston)', match: function(s) { var t = (s || '').trim(); return t === 'Big' || t === 'Mr.Big' || t === 'Mr. Big'; }},
      { display: 'Steve Brady', match: function(s) { var t = (s || '').trim(); return t === 'Steve' || t === 'Steve Brady'; }},
      { display: 'Harry Goldenblatt', match: function(s) { var t = (s || '').trim(); return t === 'Harry'; }},
      { display: 'Stanford Blatch', match: function(s) { var t = (s || '').trim(); return t === 'Stanford' || t === 'Stanford Blatch'; }},
      { display: 'Anthony Marentino', match: function(s) { var t = (s || '').trim(); return t === 'Anthony' || t.indexOf('Anthony') === 0; }},
      { display: 'Aidan Shaw', match: function(s) { var t = (s || '').trim(); return t === 'Aidan' || t === '"Aidan'; }}
    ];
    function getSpeakerGroup(speaker) {
      for (var i = 0; i < MAIN_CHARACTERS.length; i++) {
        if (MAIN_CHARACTERS[i].match(speaker)) return MAIN_CHARACTERS[i].display;
      }
      return 'Others';
    }
    var CHAR_IMAGES = {
      'Carrie Bradshaw': 'Carrie.png',
      'Samantha Jones': 'Samantha.png',
      'Charlotte York': 'Charlotte.png',
      'Miranda Hobbes': 'Miranda.png',
      'Mr. Big (John James Preston)': 'mr Big.jpg',
      'Steve Brady': 'Steve Brady.png',
      'Harry Goldenblatt': 'Harry.png',
      'Stanford Blatch': 'Standford.png',
      'Anthony Marentino': 'Anthony.png',
      'Aidan Shaw': 'Aidan.png'
    };
    var AVATAR_BASE = '__AVATAR_BASE__';

    var STOPWORDS = new Set(['a','an','the','and','or','but','in','on','at','to','for','of','with','by','from','as','is','was','are','were','been','be','have','has','had','do','does','did','will','would','could','should','may','might','must','shall','can','this','that','these','those','i','you','he','she','it','we','they','what','which','who','whom','me','him','her','us','them','my','your','his','its','our','their','so','just','than','too','very','when','where','why','how','all','each','every','both','few','more','most','other','some','such','no','nor','not','only','own','same','if','then','into','out','up','down','about','over','after','before','between','through','during','again','here','there','yes','oh','well','like','get','got','go','going','went','come','came','see','saw','think','thought','know','knew','want','wanted','say','said','tell','told','really','right','back','thing','things','something','anything','everything','nothing','one','two','way','lot','lots','kind','kinds','sort','bit','anything','everything','someone','anyone','everyone','nothing','i\\'m','don\\'t','can\\'t','won\\'t','it\\'s','that\\'s','what\\'s','we\\'re','they\\'re','you\\'re','he\\'s','she\\'s','isn\\'t','aren\\'t','wasn\\'t','weren\\'t','haven\\'t','hasn\\'t','hadn\\'t','doesn\\'t','didn\\'t','wouldn\\'t','couldn\\'t','shouldn\\'t','mustn\\'t','let\\'s','there\\'s','here\\'s','who\\'s','how\\'s','where\\'s','i\\'ve','you\\'ve','we\\'ve','they\\'ve','could\\'ve','would\\'ve','should\\'ve','i\\'ll','you\\'ll','he\\'ll','she\\'ll','we\\'ll','they\\'ll','i\\'d','you\\'d','he\\'d','she\\'d','we\\'d','they\\'d','didn\\'t','doesn\\'t','wasn\\'t','weren\\'t','isn\\'t','aren\\'t','gonna','carrie','samantha','charlotte','miranda','big','steve','harry','stanford','anthony','aidan']);

    function buildTopWordsSection() {
      var wrap = document.getElementById('topWordsWrap');
      if (!wrap || !window.SATC_DATA || !Array.isArray(window.SATC_DATA)) return;
      var chars = MAIN_CHARACTERS.concat([{ display: 'Others', match: function() { return false; } }]);
      var listEl = document.createElement('div');
      listEl.className = 'top-words-list';
      chars.forEach(function(ch) {
        var isOthers = ch.display === 'Others';
        var lines = window.SATC_DATA.filter(function(r) {
          var g = getSpeakerGroup(r.speaker);
          return isOthers ? g === 'Others' : g === ch.display;
        }).map(function(r) { return (r.line || '').toLowerCase(); }).join(' ');
        var count = {};
        var tokens = lines.replace(/[^a-z0-9\\'\\s-]/gi, ' ').split(/\\s+/);
        tokens.forEach(function(t) {
          var w = t.replace(/^['"-]+|['"-]+$/g, '').toLowerCase();
          if (w.length < 2) return;
          if (STOPWORDS.has(w)) return;
          count[w] = (count[w] || 0) + 1;
        });
        var top = '';
        var max = 0;
        for (var w in count) { if (count[w] > max) { max = count[w]; top = w; } }
        if (!top) return;
        var item = document.createElement('span');
        item.className = 'top-word-item';
        item.innerHTML = '<span class="char-name">' + escapeAttr(ch.display) + '</span>: <span class="word">' + escapeAttr(top) + '</span>';
        listEl.appendChild(item);
      });
      wrap.innerHTML = '';
      var title = document.createElement('div');
      title.className = 'top-words-title';
      title.textContent = 'Most used word (per character)';
      wrap.appendChild(title);
      wrap.appendChild(listEl);
    }

    var MAX_CANVAS_WIDTH = 4096;
    var BAR_HEIGHT = 64;
    var MAGNIFY_SLICE = 100;
    var FOCUS_DISPLAY_SCALE = 1.5;
    var FOCUS_HEIGHT_SCALE = 2.9;
    var RED_OVERLAY_WIDTH = 2;
    var DIM_OPACITY = 0.4;
    var currentQuery = '';
    var selectedSeason = null;

    function getFilteredData() {
      if (!window.SATC_DATA) return [];
      if (selectedSeason === null) return window.SATC_DATA;
      return window.SATC_DATA.filter(function(r) { return r.season === selectedSeason; });
    }

    function drawBarcodeInto(query, data, canvas, overlay, baseRef, tooltipsRef) {
      try {
        if (!query || !canvas) return;
        data = data || [];
        var q = query.toLowerCase();
        var n = data.length;
        if (n === 0) { canvas.width = 0; canvas.height = BAR_HEIGHT; tooltipsRef.length = 0; return; }
        var canvasW = Math.min(n, MAX_CANVAS_WIDTH);
        var step = n / canvasW;
        canvas.width = canvasW;
        canvas.height = BAR_HEIGHT;
        if (overlay) { overlay.width = canvasW; overlay.height = BAR_HEIGHT; }
        var base = baseRef.base;
        if (!base) { base = document.createElement('canvas'); baseRef.base = base; }
        base.width = canvasW;
        base.height = BAR_HEIGHT;
        var ctx = canvas.getContext('2d');
        if (!ctx) return;
        tooltipsRef.length = canvasW;
        for (var x = 0; x < canvasW; x++) {
          var i0 = Math.floor(x * step);
          var i1 = Math.min(Math.floor((x + 1) * step), n);
          var firstMatch = null;
          for (var i = i0; i < i1; i++) {
            if ((data[i].line || '').toLowerCase().indexOf(q) !== -1) {
              firstMatch = { speaker: data[i].speaker, line: data[i].line, season: data[i].season, episode: data[i].episode };
              break;
            }
          }
          tooltipsRef[x] = firstMatch;
          ctx.fillStyle = firstMatch ? '#c24' : '#e5e0d8';
          ctx.fillRect(x, 0, 1, BAR_HEIGHT);
        }
        base.getContext('2d').drawImage(canvas, 0, 0);
      } catch (e) {
        console.error('Barcode draw failed', e);
      }
    }

    var barcodeTooltipEl = document.getElementById('barcodeTooltip');
    function escapeAttr(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
    function showBarcodeTooltip(x, y, info) {
      if (!barcodeTooltipEl || !info) return;
      var speaker = escapeAttr((info.speaker || '').trim() || '—');
      var line = escapeAttr((info.line || '').trim() || '');
      var s = info.season != null ? info.season : '';
      var e = info.episode != null ? info.episode : '';
      barcodeTooltipEl.innerHTML = '<div class="tooltip-speaker">' + speaker + (s ? ' · S' + s + ' E' + e : '') + '</div><div class="tooltip-line">' + line + '</div>';
      barcodeTooltipEl.style.display = 'block';
      var gap = 12;
      var left = x - barcodeTooltipEl.offsetWidth / 2;
      var top = y - barcodeTooltipEl.offsetHeight - gap;
      if (left + barcodeTooltipEl.offsetWidth > window.innerWidth - 8) left = window.innerWidth - barcodeTooltipEl.offsetWidth - 8;
      if (left < 8) left = 8;
      if (top < 8) top = 8;
      barcodeTooltipEl.style.left = left + 'px';
      barcodeTooltipEl.style.top = top + 'px';
      var arrowLeft = x - left;
      barcodeTooltipEl.style.setProperty('--arrow-left', arrowLeft + 'px');
    }
    function hideBarcodeTooltip() {
      if (barcodeTooltipEl) barcodeTooltipEl.style.display = 'none';
    }

    function updateBarcodeOverlay(col, offsetX, canvas, overlay, base, tooltips) {
      if (!base || !canvas || !overlay || !tooltips || tooltips.length === 0) return;
      var w = canvas.width;
      var half = Math.floor(MAGNIFY_SLICE / 2);
      var sx = Math.max(0, col - half);
      var sw = Math.min(MAGNIFY_SLICE, w - sx);
      if (sw <= 0) return;
      var ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, w, BAR_HEIGHT);
      ctx.save();
      ctx.globalAlpha = DIM_OPACITY;
      ctx.drawImage(base, 0, 0, w, BAR_HEIGHT, 0, 0, w, BAR_HEIGHT);
      ctx.restore();
      var overlayW = 0, i;
      for (i = 0; i < sw; i++) overlayW += tooltips[sx + i] ? RED_OVERLAY_WIDTH : 1;
      overlay.width = overlayW;
      overlay.height = BAR_HEIGHT;
      var ctxOver = overlay.getContext('2d');
      if (ctxOver) {
        var x = 0;
        for (i = 0; i < sw; i++) {
          var isRed = !!tooltips[sx + i];
          var barW = isRed ? RED_OVERLAY_WIDTH : 1;
          ctxOver.fillStyle = isRed ? '#c24' : '#e5e0d8';
          ctxOver.fillRect(x, 0, barW, BAR_HEIGHT);
          x += barW;
        }
      }
      var displayW = Math.round(overlayW * FOCUS_DISPLAY_SCALE);
      var displayH = Math.round(BAR_HEIGHT * FOCUS_HEIGHT_SCALE);
      overlay.style.width = displayW + 'px';
      overlay.style.height = displayH + 'px';
      overlay.style.left = Math.max(0, offsetX - displayW / 2) + 'px';
      overlay.style.top = '0';
      overlay.style.display = 'block';
    }
    function clearBarcodeOverlay(canvas, overlay, base) {
      if (!base || !canvas) return;
      var ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(base, 0, 0);
      if (overlay) {
        overlay.style.display = 'none';
        var ctxOver = overlay.getContext('2d');
        if (ctxOver) ctxOver.clearRect(0, 0, overlay.width, overlay.height);
      }
    }

    function buildCharacterCircles() {
      var query = currentQuery;
      var data = getFilteredData();
      if (!characterCirclesWrap || !query || !data.length) return;
      var q = (query || '').toLowerCase();
      var chars = MAIN_CHARACTERS.slice();
      if (SHOW_OTHERS_IN_CIRCLES) chars.push({ display: 'Others', match: function() { return false; } });
      var list = [];
      chars.forEach(function(ch) {
        var isOthers = ch.display === 'Others';
        var charData = data.filter(function(r) {
          var g = getSpeakerGroup(r.speaker);
          return isOthers ? g === 'Others' : g === ch.display;
        });
        var matchCount = charData.filter(function(r) { return (r.line || '').toLowerCase().indexOf(q) !== -1; }).length;
        if (matchCount === 0) return;
        list.push({ ch: ch, matchCount: matchCount });
      });
      list.sort(function(a, b) {
        if (a.ch.display === 'Others') return 1;
        if (b.ch.display === 'Others') return -1;
        return b.matchCount - a.matchCount;
      });
      characterCirclesWrap.innerHTML = '';
      if (list.length === 0) {
        characterCirclesWrap.style.display = 'none';
        return;
      }
      var minCount = list[list.length - 1].matchCount;
      var maxCount = list[0].matchCount;
      var range = Math.max(maxCount - minCount, 1);
      var minSize = 40;
      var maxSize = 200;
      var title = document.createElement('div');
      title.className = 'circles-title';
      title.textContent = 'By character (size = mentions)';
      characterCirclesWrap.appendChild(title);
      var padding = 16;
      var gap = 4;
      var containerWidth = (characterCirclesWrap.parentElement && characterCirclesWrap.parentElement.offsetWidth) || 680;
      var maxX = containerWidth - padding;
      var maxY = 600;
      var circles = list.map(function(item) {
        var matchCount = item.matchCount;
        var size = minSize + (matchCount - minCount) / range * (maxSize - minSize);
        return { item: item, size: size, r: size / 2 };
      });
      circles.sort(function(a, b) { return b.size - a.size; });
      var positions = [];
      function dist(a, b) {
        var dx = a.cx - b.cx, dy = a.cy - b.cy;
        return Math.sqrt(dx * dx + dy * dy);
      }
      function inBounds(cx, cy, r) {
        return cx - r >= padding && cy - r >= padding && cx + r <= maxX && cy + r <= maxY;
      }
      function overlaps(cx, cy, r, skipIndex) {
        for (var k = 0; k < positions.length; k++) {
          if (k === skipIndex) continue;
          var p = positions[k];
          if (dist({ cx: cx, cy: cy }, p) < r + p.r + gap) return true;
        }
        return false;
      }
      var r0 = circles[0].r;
      positions.push({ cx: padding + r0, cy: padding + r0, r: r0 });
      var center0 = { cx: positions[0].cx, cy: positions[0].cy };
      for (var i = 1; i < circles.length; i++) {
        var c = circles[i];
        var best = null;
        var bestScore = 1e9;
        for (var j = 0; j < positions.length; j++) {
          var p = positions[j];
          var d = p.r + c.r + gap;
          for (var step = 0; step < 72; step++) {
            var angle = (step / 72) * Math.PI * 2;
            var cx = p.cx + d * Math.cos(angle);
            var cy = p.cy + d * Math.sin(angle);
            if (!inBounds(cx, cy, c.r) || overlaps(cx, cy, c.r, -1)) continue;
            var score = (cx - center0.cx) * (cx - center0.cx) + (cy - center0.cy) * (cy - center0.cy);
            if (score < bestScore) { bestScore = score; best = { cx: cx, cy: cy }; }
          }
        }
        if (best) positions.push({ cx: best.cx, cy: best.cy, r: c.r });
        else positions.push({ cx: padding + c.r, cy: padding + positions[positions.length - 1].cy + positions[positions.length - 1].r + c.r + gap, r: c.r });
      }
      var minLeft = 1e9, minTop = 1e9, maxRight = 0, maxBottom = 0;
      positions.forEach(function(p) {
        minLeft = Math.min(minLeft, p.cx - p.r);
        minTop = Math.min(minTop, p.cy - p.r);
        maxRight = Math.max(maxRight, p.cx + p.r);
        maxBottom = Math.max(maxBottom, p.cy + p.r);
      });
      var inner = document.createElement('div');
      inner.className = 'circles-inner';
      inner.style.minHeight = (maxBottom - minTop + padding * 2) + 'px';
      list.forEach(function(_, index) {
        var c = circles[index];
        var ch = c.item.ch;
        var matchCount = c.item.matchCount;
        var size = c.size;
        var p = positions[index];
        var itemEl = document.createElement('div');
        itemEl.className = 'circle-item';
        itemEl.style.left = (p.cx - p.r) + 'px';
        itemEl.style.top = (p.cy - p.r) + 'px';
        var avatar = document.createElement('div');
        avatar.className = 'circle-avatar';
        avatar.style.width = size + 'px';
        avatar.style.height = size + 'px';
        avatar.setAttribute('aria-hidden', 'true');
        var imgSrc = CHAR_IMAGES[ch.display] ? (AVATAR_BASE + CHAR_IMAGES[ch.display]) : null;
        if (imgSrc) {
          var img = document.createElement('img');
          img.src = imgSrc;
          img.alt = '';
          img.setAttribute('loading', 'lazy');
          avatar.appendChild(img);
        }
        itemEl.appendChild(avatar);
        var label = document.createElement('div');
        label.className = 'circle-label';
        label.textContent = ch.display;
        itemEl.appendChild(label);
        var countEl = document.createElement('div');
        countEl.className = 'circle-count';
        countEl.textContent = matchCount + (matchCount === 1 ? ' time' : ' times');
        itemEl.appendChild(countEl);
        inner.appendChild(itemEl);
      });
      characterCirclesWrap.appendChild(inner);
      characterCirclesWrap.style.display = 'block';
    }

    function buildCharacterBarcodes() {
      var query = currentQuery;
      var data = getFilteredData();
      if (!query || !data.length) return;
      barcodeWrap.innerHTML = '';
      var q = (currentQuery || '').toLowerCase();
      var chars = MAIN_CHARACTERS.concat([{ display: 'Others', match: function() { return false; }}]);
      var list = [];
      chars.forEach(function(ch) {
        var isOthers = ch.display === 'Others';
        var charData = data.filter(function(r) {
          var g = getSpeakerGroup(r.speaker);
          return isOthers ? g === 'Others' : g === ch.display;
        });
        var matchCount = charData.filter(function(r) { return (r.line || '').toLowerCase().indexOf(q) !== -1; }).length;
        if (matchCount === 0 || charData.length === 0) return;
        list.push({ ch: ch, charData: charData, matchCount: matchCount });
      });
      list.sort(function(a, b) {
        if (a.ch.display === 'Others') return 1;
        if (b.ch.display === 'Others') return -1;
        return b.matchCount - a.matchCount;
      });
      list.forEach(function(item) {
        var ch = item.ch;
        var charData = item.charData;
        var matchCount = item.matchCount;
        var section = document.createElement('div');
        section.className = 'barcode-character';
        var label = document.createElement('div');
        label.className = 'barcode-character-label';
        label.textContent = ch.display + ' (' + matchCount + ')';
        section.appendChild(label);
        var row = document.createElement('div');
        row.className = 'barcode-row';
        var avatar = document.createElement('div');
        avatar.className = 'barcode-avatar';
        avatar.setAttribute('aria-hidden', 'true');
        var imgSrc = CHAR_IMAGES[ch.display] ? (AVATAR_BASE + CHAR_IMAGES[ch.display]) : null;
        if (imgSrc) {
          var img = document.createElement('img');
          img.src = imgSrc;
          img.alt = '';
          img.setAttribute('loading', 'lazy');
          avatar.appendChild(img);
        }
        row.appendChild(avatar);
        var inner = document.createElement('div');
        inner.className = 'barcode-viz-inner';
        var canvas = document.createElement('canvas');
        canvas.className = 'barcode-main';
        var overlay = document.createElement('canvas');
        overlay.className = 'barcode-overlay';
        var baseRef = { base: null };
        var tooltips = [];
        drawBarcodeInto(query, charData, canvas, overlay, baseRef, tooltips);
        canvas._base = baseRef.base;
        canvas._overlay = overlay;
        canvas._tooltips = tooltips;
        inner.appendChild(canvas);
        inner.appendChild(overlay);
        row.appendChild(inner);
        section.appendChild(row);
        barcodeWrap.appendChild(section);
        canvas.addEventListener('mousemove', function(e) {
          if (tooltips.length === 0) return;
          var rect = canvas.getBoundingClientRect();
          var scaleX = canvas.width / rect.width;
          var offsetX = e.clientX - rect.left;
          var col = Math.floor(offsetX * scaleX);
          if (col >= 0 && col < tooltips.length) {
            updateBarcodeOverlay(col, offsetX, canvas, overlay, baseRef.base, tooltips);
            var info = tooltips[col];
            if (info) showBarcodeTooltip(e.clientX, e.clientY, info);
            else hideBarcodeTooltip();
          } else {
            clearBarcodeOverlay(canvas, overlay, baseRef.base);
            hideBarcodeTooltip();
          }
        });
        canvas.addEventListener('mouseleave', function() {
          hideBarcodeTooltip();
          clearBarcodeOverlay(canvas, overlay, baseRef.base);
        });
      });
      barcodeWrap.style.display = barcodeWrap.children.length ? 'block' : 'none';
    }

    function runSearch() {
      var query = (qEl.value || '').trim();
      pillsEl.innerHTML = '';
      barcodeWrap.style.display = 'none';
      if (characterCirclesWrap) characterCirclesWrap.style.display = 'none';
      if (!query) {
        meta.textContent = '';
        return;
      }
      if (!window.SATC_DATA || !Array.isArray(window.SATC_DATA)) {
        meta.textContent = 'Word not found.';
        return;
      }
      var q = query.toLowerCase();
      var matches = window.SATC_DATA.filter(function(r) {
        return (r.line || '').toLowerCase().indexOf(q) !== -1;
      });
      var n = matches.length;
      if (n === 0) {
        meta.textContent = 'Word not found.';
        return;
      }
      meta.textContent = "Mentioned '" + n + "' times.";
      var bySeason = {};
      matches.forEach(function(r) {
        var s = r.season != null ? r.season : 0;
        bySeason[s] = (bySeason[s] || 0) + 1;
      });
      var seasons = Object.keys(bySeason).map(Number).sort(function(a, b) { return a - b; });
      selectedSeason = null;
      currentQuery = query;
      pillsEl.innerHTML = '';
      var allPill = document.createElement('span');
      allPill.className = 'pill is-selected';
      allPill.textContent = 'All';
      allPill.setAttribute('data-season', 'all');
      allPill.addEventListener('click', function() {
        selectedSeason = null;
        pillsEl.querySelectorAll('.pill').forEach(function(p) { p.classList.remove('is-selected'); });
        allPill.classList.add('is-selected');
        try { buildCharacterCircles(); buildCharacterBarcodes(); } catch (e) { console.error(e); }
      });
      pillsEl.appendChild(allPill);
      seasons.forEach(function(season) {
        if (bySeason[season] === 0) return;
        var span = document.createElement('span');
        span.className = 'pill';
        span.textContent = 'Season ' + season + ' (' + bySeason[season] + ')';
        span.setAttribute('data-season', String(season));
        span.addEventListener('click', function() {
          selectedSeason = season;
          pillsEl.querySelectorAll('.pill').forEach(function(p) { p.classList.remove('is-selected'); });
          span.classList.add('is-selected');
          try { buildCharacterCircles(); buildCharacterBarcodes(); } catch (e) { console.error(e); }
        });
        pillsEl.appendChild(span);
      });
      try {
        buildCharacterCircles();
        buildCharacterBarcodes();
      } catch (e) { console.error(e); }
    }

    btn.addEventListener('click', runSearch);
    qEl.addEventListener('keydown', function(e) { if (e.key === 'Enter') runSearch(); });
    buildTopWordsSection();
  </script>
</body>
</html>'''

    out_path = os.path.join(os.path.dirname(__file__), "index.html")
    html = html.replace("__AVATAR_BASE__", avatar_base)
    placeholder = "__DATA__"
    i = html.index(placeholder)
    tw = time.perf_counter()
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html[:i])
        f.write(data_js)
        f.write(html[i + len(placeholder) :])
    print("Wrote file ({:.1f}s)".format(time.perf_counter() - tw), file=sys.stderr)
    print("Built:", out_path, "(total {:.1f}s)".format(time.perf_counter() - t0))
    print("Open this file in your browser (double-click or File > Open).")

if __name__ == "__main__":
    main()
