export default function calculateLanePositions(numParticipants: number) {
  const trackCenterY = 150;
  let spacing = 45;

  if (numParticipants <= 4) {
    spacing = 45;
  } else if (numParticipants <= 20) {
    spacing = 15;
  } else if (numParticipants <= 100) {
    spacing = 2;
  } else if (numParticipants <= 1000) {
    spacing = 0;
  } else {
    spacing = -2;
  }

  const totalHeight = (numParticipants - 1) * spacing;
  const startY = trackCenterY - totalHeight / 2;

  return Array.from(
    { length: numParticipants },
    (_, i) => startY + i * spacing
  );
}
