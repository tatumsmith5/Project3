document.addEventListener('DOMContentLoaded', () => {
  const blobs = ['g5-blob-1', 'g5-blob-2', 'g5-blob-3', 'g5-blob-4'].map(id => document.getElementById(id));
  const distractors = ['g5-dist-1','g5-dist-2','g5-dist-3','g5-dist-4','g5-dist-5','g5-dist-6','g5-dist-7','g5-dist-8'].map(id => document.getElementById(id));
  const allEls = [...blobs, ...distractors];
  let blobsFound = 0;
  let loopTimeout = null;

  function shuffle(arr) {
    const s = [...arr];
    for (let i = s.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [s[i], s[j]] = [s[j], s[i]];
    }
    return s;
  }

  // Place element at a random position within the SVG display area.
  // Sets --tx/--ty so the CSS transform translate moves it there.
  function setRandomPosition(el) {
    const bbox = el.getBBox();
    const scale = 393 / 294.48;
    const ew = bbox.width * scale;
    const eh = bbox.height * scale;
    const cx = (bbox.x + bbox.width / 2) * scale;
    const cy = (bbox.y + bbox.height / 2) * scale;
    const margin = 12;
    const targetX = margin + ew / 2 + Math.random() * (393 - ew - margin * 2);
    const targetY = margin + eh / 2 + Math.random() * (852 - eh - margin * 2);
    el.style.setProperty('--tx', `${targetX - cx}px`);
    el.style.setProperty('--ty', `${targetY - cy}px`);
  }

  function startLoop() {
    if (blobsFound === 4) return;

    const active = allEls.filter(el => !el.dataset.found);
    const queue = shuffle(active);
    let idx = 0;

    function showNext() {
      if (blobsFound === 4) return;
      if (idx >= queue.length) {
        loopTimeout = setTimeout(endCycle, 1200);
        return;
      }
      const el = queue[idx++];
      if (!el.dataset.found) {
        setRandomPosition(el);
        el.classList.add('g5-visible');
      }
      loopTimeout = setTimeout(showNext, 400);
    }

    function endCycle() {
      active.forEach(el => {
        if (!el.dataset.found) el.classList.remove('g5-visible');
      });
      loopTimeout = setTimeout(startLoop, 600);
    }

    showNext();
  }

  blobs.forEach(blob => {
    blob.addEventListener('click', () => {
      if (blob.dataset.found) return;
      blob.dataset.found = 'true';
      blob.classList.add('g5-popped');
      blobsFound++;
      if (blobsFound === 4) {
        clearTimeout(loopTimeout);
        setTimeout(showWin, 500);
      }
    });
  });

  function showWin() {
    const instr = document.getElementById('g5-instr');
    if (instr) {
      instr.textContent = 'you did it!';
      instr.setAttribute('fill', '#c9abcd');
    }
  }

  startLoop();
});
