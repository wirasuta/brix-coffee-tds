(function () {
  const BRIX_TDS_FACTOR = 0.85;
  const TEMP_COEFF = 0.0002;
  const REF_TEMP = 20;

  const els = {
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
  };

  let lastEdited = null;

  function getAdjustedBrix(rawBrix, temp) {
    if (temp === REF_TEMP || isNaN(temp)) return rawBrix;
    const correction = 1 + (temp - REF_TEMP) * TEMP_COEFF;
    return rawBrix / correction;
  }

  function brixToTds(brix, temp) {
    return getAdjustedBrix(brix, temp) * BRIX_TDS_FACTOR;
  }

  function tdsToBrix(tds) {
    return tds / BRIX_TDS_FACTOR;
  }

  function calcEY(tds, waterWeight, doseWeight) {
    const brewRatio = waterWeight / doseWeight;
    return (tds * brewRatio) / (1 - tds / 100);
  }

  function calcEEY(tds, brewWeight, doseWeight) {
    return (tds / 100) * brewWeight / doseWeight * 100;
  }

  function getQuality(ey) {
    if (ey < 18) return { cls: 'under', label: 'under-extracted' };
    if (ey <= 22) return { cls: 'optimal', label: 'optimal' };
    return { cls: 'over', label: 'over-extracted' };
  }

  function fmt(val, decimals) {
    if (isNaN(val) || !isFinite(val)) return '—';
    return val.toFixed(decimals);
  }

  function syncBrixTds(source) {
    const temp = parseFloat(els.temperature.value) || REF_TEMP;

    if (source === 'brix') {
      const brix = parseFloat(els.brix.value);
      if (isNaN(brix) || brix === '') {
        els.tds.value = '';
        return;
      }
      const tds = brixToTds(brix, temp);
      els.tds.value = fmt(tds, 2);
    } else {
      const tds = parseFloat(els.tds.value);
      if (isNaN(tds) || tds === '') {
        els.brix.value = '';
        return;
      }
      const brix = tdsToBrix(tds);
      els.brix.value = fmt(brix, 2);
    }
  }

  function recalcTdsFromTemp() {
    if (lastEdited === 'tds') return;
    const brix = parseFloat(els.brix.value);
    if (isNaN(brix)) return;
    const temp = parseFloat(els.temperature.value) || REF_TEMP;
    const tds = brixToTds(brix, temp);
    els.tds.value = fmt(tds, 2);
  }

  function updateEY() {
    const tds = parseFloat(els.tds.value);
    const dose = parseFloat(els.dose.value);
    const water = parseFloat(els.water.value);
    const brewW = parseFloat(els.brewWeight.value);

    if (isNaN(tds) || isNaN(dose) || isNaN(water) || dose <= 0 || water <= 0) {
      els.eyValue.textContent = '—';
      els.qualityDot.className = 'quality-dot';
      els.qualityLabel.textContent = '—';
      els.qualityLabel.className = 'quality-label';
      els.eeyGroup.style.display = 'none';
      return;
    }

    const ey = calcEY(tds, water, dose);
    els.eyValue.textContent = fmt(ey, 1);

    const q = getQuality(ey);
    els.qualityDot.className = 'quality-dot quality-dot--' + q.cls;
    els.qualityLabel.textContent = q.label;
    els.qualityLabel.className = 'quality-label quality-label--' + q.cls;

    if (!isNaN(brewW) && brewW > 0) {
      const eey = calcEEY(tds, brewW, dose);
      els.eeyValue.textContent = fmt(eey, 1);
      els.eeyGroup.style.display = '';
    } else {
      els.eeyGroup.style.display = 'none';
    }
  }

  function onBrixInput() {
    lastEdited = 'brix';
    syncBrixTds('brix');
    updateEY();
  }

  function onTdsInput() {
    lastEdited = 'tds';
    syncBrixTds('tds');
    updateEY();
  }

  function onParamInput() {
    updateEY();
  }

  function onTempInput() {
    recalcTdsFromTemp();
    updateEY();
  }

  function resetAll() {
    els.brix.value = '';
    els.tds.value = '';
    els.dose.value = '';
    els.water.value = '';
    els.method.value = 'filter';
    els.brewWeight.value = '';
    els.temperature.value = '20';
    lastEdited = null;
    updateEY();
  }

  els.brix.addEventListener('input', onBrixInput);
  els.tds.addEventListener('input', onTdsInput);
  els.dose.addEventListener('input', onParamInput);
  els.water.addEventListener('input', onParamInput);
  els.method.addEventListener('change', onParamInput);
  els.brewWeight.addEventListener('input', onParamInput);
  els.temperature.addEventListener('input', onTempInput);
  els.resetBtn.addEventListener('click', resetAll);
})();
