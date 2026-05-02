(function () {
  var BRIX_TDS_FACTOR = 0.85;
  var TEMP_COEFF = 0.0002;
  var REF_TEMP = 20;

  var EY_RANGES = {
    filter:     { min: 18, max: 22 },
    espresso:   { min: 18, max: 21 },
    immersion:  { min: 17, max: 21 },
  };

  var state = {
    anchor: 'brix',
    brix: null,
    tds: null,
    dose: null,
    water: null,
    method: 'filter',
    brewWeight: null,
    temperature: 20,
  };

  var els = {
    brix: document.getElementById('brix'),
    tds: document.getElementById('tds'),
    dose: document.getElementById('dose'),
    water: document.getElementById('water'),
    method: document.getElementById('method'),
    brewWeight: document.getElementById('brewWeight'),
    temperature: document.getElementById('temperature'),
    eyValue: document.getElementById('eyValue'),
    eeyValue: document.getElementById('eeyValue'),
    eeyGroup: document.getElementById('eeyGroup'),
    qualityDot: document.getElementById('qualityDot'),
    qualityLabel: document.getElementById('qualityLabel'),
    resetBtn: document.getElementById('resetBtn'),
    copyBtn: document.getElementById('copyBtn'),
  };

  function adjustedBrix(rawBrix, temp) {
    if (temp === REF_TEMP) return rawBrix;
    return rawBrix / (1 + (temp - REF_TEMP) * TEMP_COEFF);
  }

  function rawBrixFromAdjusted(adjBrix, temp) {
    if (temp === REF_TEMP) return adjBrix;
    return adjBrix * (1 + (temp - REF_TEMP) * TEMP_COEFF);
  }

  function brixToTds(brix, temp) {
    return adjustedBrix(brix, temp) * BRIX_TDS_FACTOR;
  }

  function tdsToBrix(tds, temp) {
    return rawBrixFromAdjusted(tds / BRIX_TDS_FACTOR, temp);
  }

  function calcEY(tds, waterWeight, doseWeight) {
    return (tds * waterWeight / doseWeight) / (1 - tds / 100);
  }

  function calcEEY(tds, brewWeight, doseWeight) {
    return (tds / 100) * brewWeight / doseWeight * 100;
  }

  function getQuality(ey, method) {
    var range = EY_RANGES[method] || EY_RANGES.filter;
    if (ey < range.min) return { cls: 'under', label: 'under-extracted' };
    if (ey <= range.max) return { cls: 'optimal', label: 'optimal' };
    return { cls: 'over', label: 'over-extracted' };
  }

  function fmt(val, d) {
    if (isNaN(val) || !isFinite(val)) return '';
    return val.toFixed(d);
  }

  function serializeState(state) {
    var p = new URLSearchParams();
    if (state.brix !== null) p.set('brix', state.brix);
    if (state.dose !== null) p.set('dose', state.dose);
    if (state.water !== null) p.set('water', state.water);
    if (state.method !== 'filter') p.set('method', state.method);
    if (state.brewWeight !== null) p.set('brew', state.brewWeight);
    if (state.temperature !== 20) p.set('temp', state.temperature);
    return p.toString();
  }

  function shareUrl() {
    var qs = serializeState(state);
    return window.location.origin + window.location.pathname + (qs ? '?' + qs : '');
  }

  function deserializeState() {
    var p = new URLSearchParams(window.location.search);
    var s = {};
    var v;
    v = parseFloat(p.get('brix')); if (!isNaN(v) && v > 0) s.brix = v;
    v = parseFloat(p.get('dose')); if (!isNaN(v) && v > 0) s.dose = v;
    v = parseFloat(p.get('water')); if (!isNaN(v) && v > 0) s.water = v;
    var m = p.get('method'); if (m && EY_RANGES[m]) s.method = m;
    v = parseFloat(p.get('brew')); if (!isNaN(v) && v > 0) s.brewWeight = v;
    v = parseFloat(p.get('temp')); if (!isNaN(v) && v >= 0 && v <= 100) s.temperature = v;
    return s;
  }

  function render() {
    var temp = state.temperature;

    if (state.anchor === 'brix' && state.brix !== null) {
      state.tds = brixToTds(state.brix, temp);
      els.tds.value = fmt(state.tds, 2);
    } else if (state.anchor === 'tds' && state.tds !== null) {
      state.brix = tdsToBrix(state.tds, temp);
      els.brix.value = fmt(state.brix, 2);
    }

    if (state.brix === null && state.anchor !== 'tds') {
      els.tds.value = '';
      state.tds = null;
    }
    if (state.tds === null && state.anchor !== 'brix') {
      els.brix.value = '';
      state.brix = null;
    }

    var tds = state.tds;
    var dose = state.dose;
    var water = state.water;
    var brewW = state.brewWeight;

    if (tds !== null && dose > 0 && water > 0) {
      var ey = calcEY(tds, water, dose);
      els.eyValue.textContent = isNaN(ey) || !isFinite(ey) ? '—' : ey.toFixed(1);

      var q = getQuality(ey, state.method);
      els.qualityDot.className = 'quality-dot quality-dot--' + q.cls;
      els.qualityLabel.textContent = q.label;
      els.qualityLabel.className = 'quality-label quality-label--' + q.cls;

      if (brewW > 0) {
        var eey = calcEEY(tds, brewW, dose);
        els.eeyValue.textContent = isNaN(eey) || !isFinite(eey) ? '—' : eey.toFixed(1);
        els.eeyGroup.style.display = '';
      } else {
        els.eeyGroup.style.display = 'none';
      }
    } else {
      els.eyValue.textContent = '—';
      els.qualityDot.className = 'quality-dot';
      els.qualityLabel.textContent = '—';
      els.qualityLabel.className = 'quality-label';
      els.eeyGroup.style.display = 'none';
    }
  }

  function onBrixInput() {
    state.brix = parseFloat(els.brix.value) || null;
    state.anchor = 'brix';
    render();
  }

  function onTdsInput() {
    state.tds = parseFloat(els.tds.value) || null;
    state.anchor = 'tds';
    render();
  }

  function onParamInput() {
    state.dose = parseFloat(els.dose.value) || null;
    state.water = parseFloat(els.water.value) || null;
    state.method = els.method.value;
    state.brewWeight = parseFloat(els.brewWeight.value) || null;
    render();
  }

  function onTempInput() {
    state.temperature = parseFloat(els.temperature.value) || REF_TEMP;
    render();
  }

  function resetAll() {
    state = {
      anchor: 'brix',
      brix: null, tds: null, dose: null, water: null,
      method: 'filter', brewWeight: null, temperature: 20,
    };
    els.brix.value = '';
    els.tds.value = '';
    els.dose.value = '';
    els.water.value = '';
    els.method.value = 'filter';
    els.brewWeight.value = '';
    els.temperature.value = '20';
    render();
  }

  var SHARE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>';
  var CHECK_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

  function onCopyLink() {
    var url = shareUrl();
    navigator.clipboard.writeText(url).then(function () {
      els.copyBtn.innerHTML = CHECK_ICON;
      els.copyBtn.classList.add('copy-btn--copied');
      setTimeout(function () {
        els.copyBtn.innerHTML = SHARE_ICON;
        els.copyBtn.classList.remove('copy-btn--copied');
      }, 1500);
    }).catch(function () {
      els.copyBtn.innerHTML = '!';
      els.copyBtn.classList.add('copy-btn--error');
      setTimeout(function () {
        els.copyBtn.innerHTML = SHARE_ICON;
        els.copyBtn.classList.remove('copy-btn--error');
      }, 1500);
    });
  }

  els.brix.addEventListener('input', onBrixInput);
  els.tds.addEventListener('input', onTdsInput);
  els.dose.addEventListener('input', onParamInput);
  els.water.addEventListener('input', onParamInput);
  els.method.addEventListener('change', onParamInput);
  els.brewWeight.addEventListener('input', onParamInput);
  els.temperature.addEventListener('input', onTempInput);
  els.resetBtn.addEventListener('click', resetAll);
  els.copyBtn.addEventListener('click', onCopyLink);

  var restored = deserializeState();
  if (restored.brix !== undefined) { state.brix = restored.brix; els.brix.value = restored.brix; }
  if (restored.dose !== undefined) { state.dose = restored.dose; els.dose.value = restored.dose; }
  if (restored.water !== undefined) { state.water = restored.water; els.water.value = restored.water; }
  if (restored.method !== undefined) { state.method = restored.method; els.method.value = restored.method; }
  if (restored.brewWeight !== undefined) { state.brewWeight = restored.brewWeight; els.brewWeight.value = restored.brewWeight; }
  if (restored.temperature !== undefined) { state.temperature = restored.temperature; els.temperature.value = restored.temperature; }
  render();
})();
