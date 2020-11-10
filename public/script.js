import { Vehicle } from "./Vehicle.js";

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
 
  const ably = new Ably.Realtime.Promise({ authUrl: '/api/createTokenRequest' });
  const channelId = 'iosfakelocation';  
  const channel = ably.channels.get(channelId);

  await channel.attach();

  const riders = new Map();

  function makePosObject(coordinates) {
    return { 
      Lat: coordinates[1], 
      Lng: coordinates[0] 
    };
  }


  channel.subscribe((message) => {
    console.log("Received", message);

    const parsedData = JSON.parse(message.data);
    const coords = parsedData.geometry.coordinates;
    const vehicle = makePosObject(coords);

    const riderId = vehicle.id ?? "some-id";

    if (!riders.has(riderId)) {
      const newRider = new Vehicle(riderId, { 
        latitude: vehicle.Lat,
        longitude: vehicle.Lng
      }, true, map);

      riders.set(riderId, newRider);      
      map.flyTo({center: [newRider.position.longitude, newRider.position.latitude], essential: true});
    }

    const rider = riders.get(riderId);
    
    rider.move({ 
      latitude: vehicle.Lat,
      longitude: vehicle.Lng
    });
  });

    // Start sliders setup

    const speed = document.getElementById("speed");
    const animation = document.getElementById("animation");
    let smooth = animation.checked;
  
    animation.onchange = function(el) {
      smooth = el.target.checked;
    }
  
    speed.onchange = function(el) {
      if(el.target.checked){
        channel.publish("update", "{ \"speed\": 2 }");
      }else{
        channel.publish("update", "{ \"speed\": 10 }");
      }
    }
})();
