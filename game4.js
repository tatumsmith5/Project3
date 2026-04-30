document.addEventListener('DOMContentLoaded', () => {
  const svg = document.getElementById('g4-svg');
  const chars = Array.from(document.querySelectorAll('.g4-char'));
  const CLEAR_DIST = 80; // SVG units

  let active = null;
  let startSVG = { x: 0, y: 0 };
  let startTx = 0;
  let startTy = 0;

  function toSVGCoords(e) {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  function getTranslate(el) {
    return {
      x: parseFloat(el.dataset.tx || '0'),
      y: parseFloat(el.dataset.ty || '0'),
    };
  }

  function applyTranslate(el, tx, ty) {
    el.setAttribute('transform', `translate(${tx},${ty})`);
    el.dataset.tx = tx;
    el.dataset.ty = ty;
  }

  function checkCleared(el) {
    if (el.dataset.cleared) return;
    const tx = parseFloat(el.dataset.tx || '0');
    const ty = parseFloat(el.dataset.ty || '0');
    if (Math.sqrt(tx * tx + ty * ty) >= CLEAR_DIST) {
      el.dataset.cleared = 'true';
      if (chars.every(c => c.dataset.cleared === 'true')) {
        showWin();
      }
    }
  }

  function showWin() {
    const instr = document.querySelector('.g4-cls-11');
    if (instr) { instr.textContent = 'you did it!'; instr.setAttribute('fill', '#e06c5d'); }
  }

  chars.forEach(char => {
    char.addEventListener('pointerdown', e => {
      e.preventDefault();
      active = char;
      char.setPointerCapture(e.pointerId);
      const svgPt = toSVGCoords(e);
      startSVG = svgPt;
      const t = getTranslate(char);
      startTx = t.x;
      startTy = t.y;
      char.parentNode.appendChild(char); // bring to front
      char.style.cursor = 'grabbing';
    });
  });

  svg.addEventListener('pointermove', e => {
    if (!active) return;
    e.preventDefault();
    const svgPt = toSVGCoords(e);
    const dx = svgPt.x - startSVG.x;
    const dy = svgPt.y - startSVG.y;
    applyTranslate(active, startTx + dx, startTy + dy);
  });

  svg.addEventListener('pointerup', e => {
    if (!active) return;
    checkCleared(active);
    active.style.cursor = '';
    active = null;
  });

  svg.addEventListener('pointercancel', () => {
    if (active) active.style.cursor = '';
    active = null;
  });
});
