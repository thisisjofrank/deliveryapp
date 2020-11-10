import { MapBoxMarker } from "./Marker.js";
import { RiderConnection } from "./RiderConnection.js";

(async function() {

  const position = { latitude: 37.33757937, longitude: -122.04068128999999 };

  mapboxgl.accessToken = 'pk.eyJ1IjoidGhpc2lzam9mcmFuayIsImEiOiJjazl0dTkzZGIwMGY0M2ZwYXlidzBqc2VqIn0._NdPXGNS5xrGsepZgesYWQ';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [position.longitude, position.latitude],
    zoom: 15
  });

  // End of map setup. 
  function createMapBoxMarker(latLng) {
    return new MapBoxMarker(map, { latitude: latLng.lat, longitude: latLng.lng });
  }

  const riderConnection = new RiderConnection(createMapBoxMarker);
  await riderConnection.connect();
    
})();
