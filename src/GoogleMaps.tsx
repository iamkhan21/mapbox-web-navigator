import React, { FC, useEffect, useRef, useState } from "react";
import { Wrapper } from "@googlemaps/react-wrapper";
import {
  convertCoordinatesFromGoogleFormat,
  convertCoordinatesToGoogleFormat,
  convertPointFromGoogleFormat,
  GeoPoint,
  GooglePoint,
} from "./utils/convertors";
import { calcDistance, updateCoordinates } from "./utils/helpers";

interface Props {
  finalPosition?: GooglePoint;
}

const positions = [
  { lng: -122.671179, lat: 45.524483 },
  { lng: -122.672561, lat: 45.524526 },
  { lng: -122.673481, lat: 45.52419 },
  { lng: -122.673333, lat: 45.52353 },
  { lng: -122.673515, lat: 45.523122 },
  { lng: -122.67337203025818, lat: 45.5222625700842 },
  { lng: -122.6741123199463, lat: 45.52092453410748 },
  { lng: -122.67509937286377, lat: 45.521247770432666 },
  { lng: -122.67441272735596, lat: 45.52304432918567 },
  { lng: -122.673019, lat: 45.523128 },
  { lng: -122.671943, lat: 45.523119 },
  { lng: -122.670661, lat: 45.523046 },
  { lng: -122.669219, lat: 45.523063 },
  { lng: -122.666982, lat: 45.522989 },
  { lng: -122.665214, lat: 45.522967 },
  { lng: -122.663329, lat: 45.523052 },
  { lng: -122.661842, lat: 45.522543 },
  { lng: -122.663837, lat: 45.522249 },
  { lng: -122.663622, lat: 45.524448 },
];

let x = 1;

const Map: FC<Props> = ({ finalPosition }) => {
  const element = useRef<HTMLDivElement>(null);
  const map = useRef(null);

  const route = useRef([]);

  const point = useRef(null);
  const line = useRef(null);

  const speed = useRef(1);

  const [time, setTime] = useState(0);
  const [distance, setDistance] = useState(0);
  const [position, setPosition] = useState<GooglePoint>(positions[0]);

  useEffect(() => {
    const center = position;
    const zoom = 15;

    if (element.current) {
      // @ts-ignore
      map.current = new window.google.maps.Map(element.current, {
        center,
        zoom,
      });
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (finalPosition) {
        const { distance, time, path } = await getRoute(
          position,
          finalPosition
        );
        // @ts-ignore
        route.current = path;
        speed.current = distance / time;

        setTime(time);
        setDistance(distance);
        drawPath(route.current);
      }
    })();
  }, [finalPosition]);
  // @ts-ignore
  useEffect(async () => {
    drawPoint(position);
    if (finalPosition) {
      const path = updateCoordinates(
        route.current,
        convertPointFromGoogleFormat(position)
      );

      const dist = calcDistance(path);
      // @ts-ignore
      route.current = path;

      setTime(dist / speed.current);
      setDistance(dist);
      drawPath(route.current);
    }
  }, [position]);

  function drawPoint(position: GooglePoint) {
    if (point.current) {
      // @ts-ignore
      point.current?.setMap(null);
    }
    // @ts-ignore
    point.current = new window.google.maps.Marker({
      position,
      map: map.current,
    });
  }

  function drawPath(points: GeoPoint[]) {
    if (line.current) {
      // @ts-ignore
      line.current?.setMap(null);
    }
    // @ts-ignore
    line.current = new window.google.maps.Polyline({
      path: convertCoordinatesToGoogleFormat(points),
      geodesic: true,
      strokeColor: "#02baf2",
      strokeOpacity: 2.0,
      strokeWeight: 4,
      map: map.current,
    });
  }

  function getRoute(
    from: GooglePoint,
    to: GooglePoint
  ): Promise<{ path: GeoPoint[]; distance: number; time: number }> {
    // @ts-ignore
    const directionsService = new window.google.maps.DirectionsService();

    return new Promise((resolve) => {
      // @ts-ignore
      directionsService.route(
        {
          origin: from,
          destination: to,
          // @ts-ignore
          travelMode: window.google.maps.TravelMode.DRIVING,
          // @ts-ignore
          unitSystem: window.google.maps.UnitSystem.METRIC,
        },
        // @ts-ignore
        function (result, status) {
          if (status == "OK") {
            const calcs = result.routes[0];
            const path = convertCoordinatesFromGoogleFormat(
              calcs.overview_path,
              true
            );

            const {
              distance: { value: distance },
              duration: { value: time },
            } = calcs.legs[0];

            resolve({ path, distance, time });
          }
        }
      );
    });
  }

  function updateLocation() {
    if (x < positions.length) {
      setPosition(positions[x]);
      x++;
    }
  }

  return (
    <>
      <section>
        <button onClick={updateLocation}>Update location</button>
      </section>
      <hr />
      <section>
        <p>Distance: {distance.toFixed()} meters</p>
        <p>Time: {(time / 60).toFixed()} mins</p>
      </section>
      <hr />
      <section style={{ height: "80vh" }} ref={element} />
    </>
  );
};

const apiKey = import.meta.env.VITE_GOOGLEMAP_KEY;

const finalPosition = { lat: 45.524449, lng: -122.663728 };

const GoogleMaps = () => {
  const [final, setFinal] = useState<GooglePoint>();

  return (
    <>
      <button onClick={() => setFinal(finalPosition)}>Build route</button>
      <hr />
      <Wrapper apiKey={apiKey}>
        <Map finalPosition={final} />
      </Wrapper>
    </>
  );
};

export default GoogleMaps;
