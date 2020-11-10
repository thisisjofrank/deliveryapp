import { GoogleMapsMarker } from "./Marker.js";
import { RiderConnection } from "./RiderConnection.js";

(async function() {

  const position = { latitude: 0, longitude: 0 };

  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 3,
    center: { lat: position.latitude, lng: position.longitude }
  });

  // End of map setup. 
  function createMapBoxMarker(latLng) {
    return new GoogleMapsMarker(map, { latitude: latLng.lat, longitude: latLng.lng });
  }

  const riderConnection = new RiderConnection(createMapBoxMarker);
  await riderConnection.connect();
    
})();
