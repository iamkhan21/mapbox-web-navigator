import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const positions = [
  [-122.671179, 45.524483],
  [-122.672561, 45.524526],
  [-122.673481, 45.52419],
  [-122.673333, 45.52353],
  [-122.673515, 45.523122],
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

const Map = () => {
  let map = useRef();
  let coordinates = useRef();
  let ind = useRef(0);

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAP_KEY;

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

    map.current?.setMaxBounds(bounds);

    getRoute([-122.671453, 45.524569], [-122.663728, 45.524449]);

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
    if (map.current?.getLayer(name)) {
      map.current?.getSource(name).setData(end);
    } else {
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

    if (map.current?.getSource("route")) {
      map.current?.getSource("route").setData(geojson);
    } else {
      // otherwise, we'll make a new request
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
      `https://api.mapbox.com/directions/v5/mapbox/cycling/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
      { method: "GET" }
    );
    const json = await query.json();
    const data = json.routes[0];
    const route = data.geometry.coordinates;

    coordinates.current = route;

    let x = 0;
    for (const point of route) {
      drawPoint(point, `point${x}`, "#e16b0b", 5);
      x++;
    }

    drawRoute(route);
    drawPoint(start);
    ind.current = 0;
  }

  function simulateStep() {
    if (ind.current < positions.length) {
      drawPoint(positions[ind.current]);

      ind.current++;
    }
  }

  return (
    <section>
      <div>
        <button onClick={simulateStep}>update</button>
      </div>

      <div id="map" style={{ height: "90vh" }} />
    </section>
  );
};
export default Map;
