export default function getRandomWinners(addresses: string[], count: number) {
  const shuffled = [...addresses].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
