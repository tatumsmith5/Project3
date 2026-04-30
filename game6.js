document.addEventListener('DOMContentLoaded', () => {
  const svg = document.getElementById('g6-svg');
  const SCALE = 393 / 294.48;
  const SPEED = 0.028;   // SVG units per ms — slow drift
  const SNAP  = 52;      // SVG units — drop radius to count as a match

  // Float zone (SVG units) — full width, clear of top/bottom blob corners
  const ZONE = { left: 14, right: 280, top: 118, bottom: 488 };

  // Blob target centers computed from their geometry
  const blobIds = ['g6-blob-blue', 'g6-blob-lime', 'g6-blob-purple', 'g6-blob-yellow'];
  const blobCenter = {};
  blobIds.forEach(id => {
    const bb = document.getElementById(id).getBBox();
    blobCenter[id.replace('g6-blob-', '')] = {
      x: bb.x + bb.width  / 2,
      y: bb.y + bb.height / 2,
    };
  });

  const icons = Array.from(document.querySelectorAll('.g6-icon'));
  const iconState = new Map();

  icons.forEach(icon => {
    const bb  = icon.getBBox();
    const cx  = bb.x + bb.width  / 2;
    const cy  = bb.y + bb.height / 2;
    const ang = Math.random() * Math.PI * 2;
    iconState.set(icon, {
      x: cx, y: cy,
      origCx: cx, origCy: cy,
      hw: bb.width  / 2,
      hh: bb.height / 2,
      vx: Math.cos(ang) * SPEED,
      vy: Math.sin(ang) * SPEED,
      solved: false,
    });
  });

  let dragging   = null;
  let dragOffX   = 0;
  let dragOffY   = 0;
  let solved     = 0;
  let lastT      = null;

  function applyTransform(icon) {
    const s  = iconState.get(icon);
    const dx = (s.x - s.origCx).toFixed(3);
    const dy = (s.y - s.origCy).toFixed(3);
    icon.setAttribute('transform', `translate(${dx},${dy})`);
  }

  function animate(t) {
    if (lastT === null) lastT = t;
    const dt = Math.min(t - lastT, 50);
    lastT = t;

    icons.forEach(icon => {
      const s = iconState.get(icon);
      if (s.solved || icon === dragging) return;

      s.x += s.vx * dt;
      s.y += s.vy * dt;

      // Bounce off zone walls
      if (s.x - s.hw < ZONE.left)   { s.x = ZONE.left   + s.hw; s.vx =  Math.abs(s.vx); }
      if (s.x + s.hw > ZONE.right)  { s.x = ZONE.right  - s.hw; s.vx = -Math.abs(s.vx); }
      if (s.y - s.hh < ZONE.top)    { s.y = ZONE.top    + s.hh; s.vy =  Math.abs(s.vy); }
      if (s.y + s.hh > ZONE.bottom) { s.y = ZONE.bottom - s.hh; s.vy = -Math.abs(s.vy); }

      applyTransform(icon);
    });

    requestAnimationFrame(animate);
  }

  function toSVG(e) {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  // Drag start
  icons.forEach(icon => {
    icon.addEventListener('pointerdown', e => {
      const s = iconState.get(icon);
      if (s.solved) return;
      e.preventDefault();
      dragging = icon;
      icon.setPointerCapture(e.pointerId);
      const pt = toSVG(e);
      dragOffX = s.x - pt.x;
      dragOffY = s.y - pt.y;
      icon.parentNode.appendChild(icon); // bring to front
    });
  });

  // Drag move
  svg.addEventListener('pointermove', e => {
    if (!dragging) return;
    e.preventDefault();
    const pt = toSVG(e);
    const s  = iconState.get(dragging);
    s.x = pt.x + dragOffX;
    s.y = pt.y + dragOffY;
    applyTransform(dragging);
  });

  // Drag end — check for color match
  svg.addEventListener('pointerup', () => {
    if (!dragging) return;
    const icon  = dragging;
    dragging    = null;

    const s     = iconState.get(icon);
    const color = icon.dataset.color;
    const bc    = blobCenter[color];
    const dist  = Math.hypot(s.x - bc.x, s.y - bc.y);

    if (dist < SNAP) {
      s.solved = true;
      icon.style.transition = 'opacity 0.25s ease';
      icon.style.opacity    = '0';
      setTimeout(() => { icon.style.visibility = 'hidden'; }, 270);
      solved++;
      if (solved === icons.length) setTimeout(showWin, 450);
    }
    // Wrong blob or open space → icon resumes floating from current position
  });

  svg.addEventListener('pointercancel', () => { dragging = null; });

  function showWin() {
    const instr = document.getElementById('g6-instr');
    if (instr) {
      instr.textContent = 'you did it!';
      instr.setAttribute('fill', '#7a9acd');
    }
  }

  requestAnimationFrame(animate);
});
