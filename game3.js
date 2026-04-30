document.addEventListener('DOMContentLoaded', () => {
  const bubbles = Array.from(document.querySelectorAll('.bubble'));
  let remaining = bubbles.length;

  bubbles.forEach(bubble => {
    bubble.addEventListener('click', () => {
      if (bubble.dataset.popped) return;
      bubble.dataset.popped = 'true';

      bubble.style.transformBox = 'fill-box';
      bubble.style.transformOrigin = 'center';
      bubble.style.transition = 'transform 0.12s ease-out, opacity 0.18s ease';
      bubble.style.transform = 'scale(1.35)';
      bubble.style.opacity = '0';
      bubble.style.pointerEvents = 'none';

      setTimeout(() => {
        bubble.style.visibility = 'hidden';
        remaining--;
        if (remaining === 0) showComplete();
      }, 200);
    });
  });

  function showComplete() {
    const instr = document.querySelector('.g3-cls-15');
    if (instr) { instr.textContent = 'you did it!'; instr.setAttribute('fill', '#719bd1'); }
  }
});
