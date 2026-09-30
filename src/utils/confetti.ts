import confetti from 'canvas-confetti';

/**
 * 1위 챔피언 축하 황금 폭죽 이펙트
 */
export function triggerGoldConfetti() {
  // 골드, 앰버, 옐로우 색상
  const colors = ['#f59e0b', '#fbbf24', '#fef08a', '#ffffff', '#d97706'];

  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors,
    ticks: 200,
    gravity: 1.2,
    decay: 0.94,
    startVelocity: 30,
  });

  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });
  }, 200);
}

/**
 * 꼴찌 멤버 응원용 따뜻한 하트 폭죽
 */
export function triggerRescueCheer() {
  const colors = ['#f43f5e', '#fb7185', '#38bdf8', '#34d399'];

  confetti({
    particleCount: 40,
    spread: 60,
    origin: { y: 0.7 },
    colors,
    shapes: ['circle'],
    scalar: 1.2,
  });
}
