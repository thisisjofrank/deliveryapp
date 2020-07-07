import { Vehicle } from "./Vehicle.js";

(async function() {

  let position = { latitude: 41.772621154785156, longitude: -72.69306182861328 };

  const mapElement = document.getElementById("map");
  const origin = new google.maps.LatLng(position.latitude, position.longitude);
  const map = new google.maps.Map(mapElement, { center: origin, zoom: 16 });

  // End of map setup.

  const ably = new Ably.Realtime.Promise({ authUrl: '/api/createTokenRequest' });
  const channelId = `[product:cttransit/gtfsr]vehicle:1450`;
  const channel = await ably.channels.get(channelId, {params: {rewind: '1'}});
  await channel.attach();

  const busses = new Map();

  channel.subscribe(function(message) {
    console.log("Received", message);

    const vehicle = message.data.vehicle;
    const busId = vehicle.vehicle.id;

    if (!busses.has(busId)) {
      const newBus = new Vehicle(busId, { 
        latitude: vehicle.position.latitude,
        longitude: vehicle.position.longitude
      }, true);

      busses.set(busId, newBus);      
      newBus.line.setMap(map);
      map.panTo(newBus.line.getPath().getAt(1));
    }

    const bus = busses.get(busId);
    
    bus.move({ 
      latitude: vehicle.position.latitude,
      longitude: vehicle.position.longitude
    });
  });

})();