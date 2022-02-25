export type Lat = number;
export type Lng = number;

export type GooglePoint = {
  lat: Lat;
  lng: Lng;
};

export type RawGooglePoint = {
  lat: () => Lat;
  lng: () => Lng;
};

export type GeoPoint = [Lng, Lat];

export function convertCoordinatesFromGoogleFormat(
  points: GooglePoint[] | RawGooglePoint[],
  isRaw = false
): GeoPoint[] {
  const convertor = isRaw
    ? convertPointFromRawGoogleFormat
    : convertPointFromGoogleFormat;

  // @ts-ignore
    return points.map(convertor);
}
export function convertCoordinatesToGoogleFormat(
  points: GeoPoint[]
): GooglePoint[] {
  return points.map(convertPointToGoogleFormat);
}

export function convertPointFromRawGoogleFormat({
  lng,
  lat,
}: RawGooglePoint): GeoPoint {
  return [+lng().toFixed(5), +lat().toFixed(5)];
}
export function convertPointFromGoogleFormat({
  lng,
  lat,
}: GooglePoint): GeoPoint {
  return [lng, lat];
}

export function convertPointToGoogleFormat([lng, lat]: GeoPoint): GooglePoint {
  return { lng, lat };
}

