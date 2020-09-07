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
  const channelId = `rider002.delivery223.locations`;  
  const channel = ably.channels.get(channelId);

  await channel.attach();

  const riders = new Map();

  channel.subscribe((message) => {
    console.log("Received", message);

    const vehicle = JSON.parse(message.data);
    const riderId = vehicle.id;

    if (!riders.has(riderId)) {
      const newRider = new Vehicle(riderId, { 
        latitude: vehicle.Lat,
        longitude: vehicle.Lon
      }, true, map);

      riders.set(riderId, newRider);      
      map.flyTo({center: [newRider.position.longitude, newRider.position.latitude], essential: true});
    }

    const rider = riders.get(riderId);
    
    rider.move({ 
      latitude: vehicle.Lat,
      longitude: vehicle.Lon
    });
  });

})();