document.addEventListener('DOMContentLoaded', () => {
  const svg = document.getElementById('Layer_1');
  const svgNS = 'http://www.w3.org/2000/svg';
  const THRESHOLD = 24; // SVG units
  const SAMPLES = 100;  // points per arc

  // Spiral order [0,3,1,4,2,5] sampled in REVERSE so entry is outer-left (~25.76, 311.17)
  // and all arc-to-arc connections are seamless
  const allPaths = Array.from(svg.querySelectorAll('.g1-cls-2'));
  const spiralPaths = [0, 3, 1, 4, 2, 5].map(i => allPaths[i]);

  const points = [];
  spiralPaths.forEach(path => {
    const len = path.getTotalLength();
    for (let j = 0; j <= SAMPLES; j++) {
      const p = path.getPointAtLength(len * (1 - j / SAMPLES));
      points.push({ x: p.x, y: p.y });
    }
  });

  // Growing overlay path — appended to as the user traces, never rebuilt from scratch
  const overlayPath = document.createElementNS(svgNS, 'path');
  overlayPath.setAttribute('fill', 'none');
  overlayPath.setAttribute('stroke', '#915c91');
  overlayPath.setAttribute('stroke-width', '17.72');
  overlayPath.setAttribute('stroke-linecap', 'round');
  overlayPath.setAttribute('stroke-linejoin', 'round');
  overlayPath.setAttribute('d', '');
  overlayPath.setAttribute('pointer-events', 'none');

  const clipG = svg.querySelector('.g1-cls-11');
  clipG.insertBefore(overlayPath, clipG.querySelector('g').nextSibling);

  let progress = 0;
  let active = false;

  function fmt(p) {
    return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
  }

  function toSVG(e) {
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  function advance(pos) {
    const prev = progress;
    let stepped;
    do {
      stepped = false;
      if (progress < points.length - 1) {
        const nx = points[progress + 1];
        if (Math.hypot(pos.x - nx.x, pos.y - nx.y) < THRESHOLD) {
          progress++;
          stepped = true;
        }
      }
    } while (stepped);

    if (progress > prev) {
      let d = overlayPath.getAttribute('d');
      if (!d) {
        d = `M${fmt(points[0])}`;
      }
      for (let i = prev + 1; i <= progress; i++) {
        d += ` L${fmt(points[i])}`;
      }
      overlayPath.setAttribute('d', d);
    }

    if (progress >= points.length - 1) {
      active = false;
      const instrText = svg.querySelector('.g1-cls-5');
      if (instrText) {
        instrText.textContent = 'you did it!';
        instrText.setAttribute('fill', '#915c91');
      }
    }
  }

  svg.addEventListener('pointerdown', e => {
    active = true;
    svg.setPointerCapture(e.pointerId);
    advance(toSVG(e));
  });

  svg.addEventListener('pointermove', e => {
    if (active) advance(toSVG(e));
  });

  svg.addEventListener('pointerup', () => { active = false; });
  svg.addEventListener('pointercancel', () => { active = false; });
});
