import { GoogleMapsMarker } from "./Marker.js";
import { RiderConnection } from "./RiderConnection.js";

(async function() {

  const position = { latitude: 0, longitude: 0 };
  const mapElement = document.getElementById("map");
  const map = new google.maps.Map(mapElement, { zoom: 3, center: { lat: position.latitude, lng: position.longitude }});

  function createMapBoxMarker(latLng) {
    return new GoogleMapsMarker(map, { latitude: latLng.lat, longitude: latLng.lng });
  }

  const riderConnection = new RiderConnection(createMapBoxMarker);
  await riderConnection.connect(); 
   
})();
