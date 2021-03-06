import { lineString, point, Units } from "@turf/helpers";
import pointToLineDistance from "@turf/point-to-line-distance";
import length from "@turf/length";
import { GeoPoint } from "./convertors";

function findDistanceToLine(
  coordinates: number[][],
  position: number[]
): number {
  const line = lineString(coordinates);
  const pt = point(position);

  return +pointToLineDistance(pt, line, { units: "meters" }).toFixed();
}

export function updateCoordinates(
  coordinates: number[][],
  currentPosition: number[]
): GeoPoint[] {
  let closest = [Number.MAX_VALUE, 0];

  for (let i = 1, len = coordinates.length; i < len; i++) {
    let dist = findDistanceToLine(
      [coordinates[i - 1], coordinates[i]],
      currentPosition
    );

    if (dist <= closest[0]) {
      closest = [dist, i];
    } else {
      break;
    }
  }
  return [currentPosition, ...coordinates.slice(closest[1])] as GeoPoint[];
}

export function calcDistance(
  coordinates: number[][],
  units: Units = "meters"
): number {
  const line = lineString(coordinates);

  return length(line, { units });
}
