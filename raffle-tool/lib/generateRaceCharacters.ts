export default function generateRaceCharacters(numParticipants: number) {
  const baseCharacters = [
    "/chog.png",
    "/fishnad.png",
    "/molandak.png",
    "/salmonad.png",
  ];
  const characters = [];
  for (let i = 0; i < numParticipants; i++) {
    characters.push(baseCharacters[i % baseCharacters.length]);
  }
  return characters;
}
