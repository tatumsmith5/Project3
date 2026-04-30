document.addEventListener('DOMContentLoaded', () => {
  const TILE_SIZE = 120;
  const GAP = 2;
  const CELL = TILE_SIZE + GAP; // 122px per grid step

  // Scale factor: display tile size / SVG grid cell size
  const SCALE = TILE_SIZE / 92.72;

  // SVG background dimensions at this scale
  const BG_W = Math.round(294.48 * SCALE); // 381px
  const BG_H = Math.round(639.36 * SCALE); // 827px

  // Where the puzzle grid starts in the scaled SVG
  const GRID_X = Math.round(8.08 * SCALE);   // 10px
  const GRID_Y = Math.round(180.66 * SCALE); // 234px

  // Solved state: tiles 1-8 in order, 0 (empty) at bottom-right (index 8)
  const SOLVED = [1, 2, 3, 4, 5, 6, 7, 8, 0];

  let state = [...SOLVED];
  let tileDivs = {};
  let moving = false;

  // Background-position for a given tile value (1-8)
  function bgPos(tileValue) {
    const srcIdx = tileValue - 1;
    const col = srcIdx % 3;
    const row = Math.floor(srcIdx / 3);
    return `${-(GRID_X + col * TILE_SIZE)}px ${-(GRID_Y + row * TILE_SIZE)}px`;
  }

  // Grid indices adjacent to idx (up/down/left/right)
  function getAdjacent(idx) {
    const row = Math.floor(idx / 3);
    const col = idx % 3;
    const adj = [];
    if (row > 0) adj.push(idx - 3);
    if (row < 2) adj.push(idx + 3);
    if (col > 0) adj.push(idx - 1);
    if (col < 2) adj.push(idx + 1);
    return adj;
  }

  function isSolved() {
    return SOLVED.every((v, i) => v === state[i]);
  }

  // Shuffle by making random valid moves from solved state (always solvable)
  function shuffle(arr) {
    const s = [...arr];
    let emptyIdx = s.indexOf(0);
    for (let i = 0; i < 300; i++) {
      const adj = getAdjacent(emptyIdx);
      const next = adj[Math.floor(Math.random() * adj.length)];
      [s[emptyIdx], s[next]] = [s[next], s[emptyIdx]];
      emptyIdx = next;
    }
    return s;
  }

  // Move tile divs to their current state positions
  function updatePositions(animate) {
    state.forEach((tileValue, posIdx) => {
      if (tileValue === 0) return;
      const div = tileDivs[tileValue];
      div.style.transition = animate ? 'left 0.14s ease, top 0.14s ease' : 'none';
      div.style.left = `${(posIdx % 3) * CELL}px`;
      div.style.top = `${Math.floor(posIdx / 3) * CELL}px`;
    });
  }

  function slide(tileValue) {
    if (moving) return;
    const posIdx = state.indexOf(tileValue);
    const emptyIdx = state.indexOf(0);
    if (!getAdjacent(emptyIdx).includes(posIdx)) return;

    moving = true;
    [state[emptyIdx], state[posIdx]] = [state[posIdx], state[emptyIdx]];
    updatePositions(true);

    setTimeout(() => {
      moving = false;
      if (isSolved()) {
        setTimeout(() => {
          const instr = document.querySelector('.instruction');
          if (instr) { instr.textContent = 'you did it!'; instr.style.color = '#7a9acd'; }
        }, 200);
      }
    }, 150);
  }

  function init() {
    const container = document.getElementById('puzzle-container');

    for (let v = 1; v <= 8; v++) {
      const div = document.createElement('div');
      div.className = 'tile';
      div.style.backgroundImage = "url('game2.svg')";
      div.style.backgroundSize = `${BG_W}px ${BG_H}px`;
      div.style.backgroundPosition = bgPos(v);
      div.addEventListener('click', () => slide(v));
      container.appendChild(div);
      tileDivs[v] = div;
    }

    state = shuffle([...SOLVED]);
    updatePositions(false); // place tiles instantly without animation

    // Enable transitions after initial placement settles
    requestAnimationFrame(() => requestAnimationFrame(() => {
      Object.values(tileDivs).forEach(div => {
        div.style.transition = 'left 0.14s ease, top 0.14s ease';
      });
    }));
  }

  init();
});
