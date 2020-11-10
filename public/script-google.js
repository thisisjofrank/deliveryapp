import { GoogleMapsMarker } from "./Marker.js";
import { RiderConnection } from "./RiderConnection.js";


google.maps.event.addListenerOnce(map, "idle", (e) => {
  console.log("LOADED");
});

(async function() {

  const position = { latitude: 37.33757937, longitude: -122.04068128999999 };

  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: { lat: position.latitude, lng: position.longitude }
  });


  // End of map setup. 
  function createMapBoxMarker(latLng) {
    return new GoogleMapsMarker(map, { latitude: latLng.lat, longitude: latLng.lng });
  }

  const riderConnection = new RiderConnection(createMapBoxMarker);
  await riderConnection.connect();

  // Start sliders setup

  const animation = document.getElementById("animation");
  let smooth = animation.checked;

  animation.onchange = function(el) {
    smooth = el.target.checked;
  }
    
})();
