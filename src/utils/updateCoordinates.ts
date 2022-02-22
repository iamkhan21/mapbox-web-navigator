import { distance, point } from "@turf/turf";

export function updateCoordinates(
  coordinates: number[][],
  currentPosition: number[]
) {
  const dist = calculateDistance(currentPosition, coordinates[0]);
  let closest = [dist, 0];

  for (let i = 1, len = coordinates.length; i < len; i++) {
    const dist = calculateDistance(currentPosition, coordinates[i]);

    if (dist < closest[0]) {
      closest = [dist, i];
    }
  }

  return [currentPosition, ...coordinates.slice(closest[1] + 1)];
}

function calculateDistance(from: number[], to: number[]) {
  const p1 = point(from);
  const p2 = point(to);

  return distance(p1, p2, { units: "miles" });
}
