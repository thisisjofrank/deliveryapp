import { Vehicle } from "./Vehicle.js";

(async function() {

let position = { latitude: 41.772621154785156, longitude: -72.69306182861328 };
let dest = { latitude: 41.672621154785156, longitude: -72.69306182861328 };

const mapElement = document.getElementById("map");
const origin = new google.maps.LatLng(position.latitude, position.longitude);
const map = new google.maps.Map(mapElement, { center: origin, zoom: 16 });

// End of map setup.

const busses = new Map();


const ably = new Ably.Realtime.Promise({ authUrl: '/api/createTokenRequest' });
const channelId = `[product:cttransit/gtfsr]vehicle:1438`;
const channel = await ably.channels.get(channelId, {params: {rewind: '2m'}});
await channel.attach();

channel.subscribe(function(message) {

  const vehicle = message.data.vehicle;

    console.log(message.data.vehicle);

    if (!busses.has(vehicle.id)) {

      console.log("First time, adding bus to screen");

      const newBus = new Vehicle(vehicle.id, { 
        latitude: vehicle.position.latitude,
        longitude: vehicle.position.longitude
      }, true);

      busses.set(vehicle.id, newBus);      
      newBus.line.setMap(map);

    }

    const bus = busses.get(vehicle.id);
    
    bus.move({ 
      latitude: vehicle.position.latitude,
      longitude: vehicle.position.longitude
    });

    map.setCenter(bus.line.getPath().getAt(1));

});

})();
