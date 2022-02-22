import { lineString, point } from "@turf/helpers";
import pointToLineDistance from "@turf/point-to-line-distance";

function findDistanceToLine(line: number[][], position: number[]): number {
  const l = lineString(line);
  const pt = point(position);

  return pointToLineDistance(pt, l, { units: "meters" });
}

export function updateCoordinates(
  coordinates: number[][],
  currentPosition: number[]
): number[][] {
  let closest = [Number.MAX_VALUE, 0];

  for (let i = 1, len = coordinates.length; i < len; i++) {
    let dist = findDistanceToLine(
      [coordinates[i - 1], coordinates[i]],
      currentPosition
    );

    if (dist < closest[0]) {
      closest = [dist, i];
    } else {
      break;
    }
  }

  return [currentPosition, ...coordinates.slice(closest[1])];
}

// const position = [-122.67160177230834, 45.523254800933906];
//
// const route = [
//   [-122.671454, 45.524581],
//   [-122.673446, 45.524543],
//   [-122.673386, 45.523072],
//   [-122.671695, 45.523082],
//   [-122.671592, 45.523135],
//   [-122.661767, 45.522934],
//   [-122.661771, 45.522219],
//   [-122.66377, 45.522233],
//   [-122.663733, 45.524449],
// ];

// console.log(updateCoordinates(route, position));
