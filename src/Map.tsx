import { useEffect, useRef, useState } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { calcDistance, updateCoordinates } from "./utils/helpers";

const positions = [
  [-122.671179, 45.524483],
  [-122.672561, 45.524526],
  [-122.673481, 45.52419],
  [-122.673333, 45.52353],
  [-122.673515, 45.523122],
  [-122.67337203025818, 45.5222625700842],
  [-122.6741123199463, 45.52092453410748],
  [-122.67509937286377, 45.521247770432666],
  [-122.67441272735596, 45.52304432918567],
  [-122.673019, 45.523128],
  [-122.671943, 45.523119],
  [-122.670661, 45.523046],
  [-122.669219, 45.523063],
  [-122.666982, 45.522989],
  [-122.665214, 45.522967],
  [-122.663329, 45.523052],
  [-122.661842, 45.522543],
  [-122.663837, 45.522249],
  [-122.663622, 45.524448],
];

const accessToken = import.meta.env.VITE_MAP_KEY;

const Map = () => {
  let map = useRef();
  let speed = useRef(0);
  let coordinates = useRef<number[][]>([[], []]);
  let ind = useRef(0);

  const [distance, setDistance] = useState(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;

      // @ts-ignore
      mapboxgl.accessToken = accessToken;
      // @ts-ignore
      map.current = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v11",
        center: [-122.667569, 45.523825], // starting position
        zoom: 15,
      });
      // set the bounds of the map
      const bounds = [
        [-123.069003, 45.395273],
        [-122.303707, 45.612333],
      ];

      // @ts-ignore
      map.current?.on("load", () => {
        // @ts-ignore
        map.current?.setMaxBounds(bounds);

        getRoute([-122.671453, 45.524569], [-122.663728, 45.524449]);
      });
    })();

    // @ts-ignore
    return () => map.current?.remove();
  }, []);

  function drawPoint(
    coordinates: number[],
    name = "end",
    color = "#f30",
    size = 10
  ) {
    const end = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "Point",
            coordinates,
          },
        },
      ],
    };
    // @ts-ignore
    if (map.current?.getLayer(name)) {
      // @ts-ignore
      map.current?.getSource(name).setData(end);
    } else {
      // @ts-ignore
      map.current?.addLayer({
        id: name,
        type: "circle",
        source: {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "Point",
                  coordinates,
                },
              },
            ],
          },
        },
        paint: {
          "circle-radius": size,
          "circle-color": color,
        },
      });
    }
  }

  function drawRoute(coordinates: number[][]) {
    const geojson = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates,
      },
    };
    // @ts-ignore
    if (map.current?.getSource("route")) {
      // @ts-ignore
      map.current?.getSource("route").setData(geojson);
    } else {
      // otherwise, we'll make a new request
      // @ts-ignore
      map.current?.addLayer({
        id: "route",
        type: "line",
        source: {
          type: "geojson",
          data: geojson,
        },
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#3887be",
          "line-width": 5,
          "line-opacity": 0.75,
        },
      });
    }
  }

  async function getRoute(start: number[], end: number[]) {
    // make a directions request using cycling profile
    // an arbitrary start will always be the same
    // only the end or destination will change
    const query = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${accessToken}`,
      { method: "GET" }
    );
    const json = await query.json();

    const data = json.routes[0];
    const {
      duration,
      distance,
      geometry: { coordinates: route },
    } = data;

    coordinates.current = route;

    drawRoute(route);
    drawPoint(start);

    setDistance(distance);
    setTime(duration);

    speed.current = distance / duration;
  }

  function simulateStep() {
    if (ind.current < positions.length) {
      const position = positions[ind.current];
      const route = updateCoordinates(coordinates.current, position);

      coordinates.current = route;

      drawPoint(position);
      drawRoute(route);

      const dist = calcDistance(route);

      if (dist - distance > 150) {
        getRoute(route[0], route[route.length - 1]);
      } else {
        setDistance(dist);
        setTime(dist / speed.current);
      }

      ind.current++;
    }
  }

  return (
    <article>
      <section>
        <button onClick={simulateStep}>update</button>
      </section>
      <hr />

      <section>
        <p>
          Distance: <b>{distance.toFixed()}</b> meters
        </p>
        <p>
          Time: <b>{(time / 60).toFixed()}</b> min
        </p>
      </section>

      <br />
      <section id="map" style={{ height: "80vh" }} />
    </article>
  );
};
export default Map;
