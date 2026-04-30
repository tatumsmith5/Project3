document.addEventListener('DOMContentLoaded', () => {
  const svg      = document.getElementById('g7-svg');
  const BOB_AMP  = 8;      // SVG units — vertical bob height
  const BOB_FREQ = 0.0016; // rad/ms — one full cycle ~3.9 seconds
  const SNAP     = 100;    // SVG units — drop zone radius on blob

  // Blob bounding box center — the target
  const blobBB = document.getElementById('g7-blob').getBBox();
  const blobCx = blobBB.x + blobBB.width  / 2;
  const blobCy = blobBB.y + blobBB.height / 2;

  const items = Array.from(document.querySelectorAll('.g7-item'));
  const state = new Map();

  // Stagger each item's bob phase by a quarter wave for a wave effect
  items.forEach((item, i) => {
    const bb = item.getBBox();
    state.set(item, {
      origCx:   bb.x + bb.width  / 2,
      origCy:   bb.y + bb.height / 2,
      phase:    (Math.PI / 2) * i,
      curDx:    0,
      curDy:    0,
      dragOffX: 0,
      dragOffY: 0,
      placed:   false,
    });
  });

  let dragging = null;
  let placed   = 0;
  let won      = false;

  function toSVG(e) {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  function applyTransform(item) {
    const s = state.get(item);
    item.setAttribute('transform',
      `translate(${s.curDx.toFixed(3)},${s.curDy.toFixed(3)})`);
  }

  // Bobbing animation — runs continuously
  function animate(t) {
    items.forEach(item => {
      const s = state.get(item);
      if (s.placed || item === dragging) return;
      s.curDx = 0;
      s.curDy = BOB_AMP * Math.sin(t * BOB_FREQ + s.phase);
      applyTransform(item);
    });
    requestAnimationFrame(animate);
  }

  // Drag start — always draggable, even if already placed
  items.forEach(item => {
    item.addEventListener('pointerdown', e => {
      e.preventDefault();
      const s = state.get(item);
      dragging = item;
      item.setPointerCapture(e.pointerId);
      const pt   = toSVG(e);
      s.dragOffX = (s.origCx + s.curDx) - pt.x;
      s.dragOffY = (s.origCy + s.curDy) - pt.y;
      if (s.placed) {
        s.placed = false;
        placed--;
      }
      item.parentNode.appendChild(item); // bring to front
    });
  });

  // Drag move
  svg.addEventListener('pointermove', e => {
    if (!dragging) return;
    e.preventDefault();
    const pt = toSVG(e);
    const s  = state.get(dragging);
    s.curDx  = (pt.x + s.dragOffX) - s.origCx;
    s.curDy  = (pt.y + s.dragOffY) - s.origCy;
    applyTransform(dragging);
  });

  // Drag end — place on blob or return to bobbing
  svg.addEventListener('pointerup', () => {
    if (!dragging) return;
    const item = dragging;
    dragging   = null;

    const s     = state.get(item);
    const curCx = s.origCx + s.curDx;
    const curCy = s.origCy + s.curDy;
    const dist  = Math.hypot(curCx - blobCx, curCy - blobCy);

    if (dist < SNAP) {
      s.placed = true;
      placed++;
      if (!won && placed === items.length) {
        won = true;
        setTimeout(showWin, 400);
      }
    }
    // If not on blob, animate() resumes bobbing from next frame
  });

  svg.addEventListener('pointercancel', () => {
    if (dragging) {
      const s = state.get(dragging);
      s.placed = false;
    }
    dragging = null;
  });

  function showWin() {
    const instr = document.getElementById('g7-instr');
    if (instr) {
      instr.textContent = 'you did it!';
      instr.setAttribute('fill', '#c9abcd');
    }
  }

  requestAnimationFrame(animate);
});
