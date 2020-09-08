import { Vehicle } from "./Vehicle.js";

(async function() {

  let position = { latitude: 37.33757937, longitude: -122.04068128999999 };
  // let position = { latitude: 41.772621154785156, longitude: -72.69306182861328 };

  const mapElement = document.getElementById("map");
  const origin = new google.maps.LatLng(position.latitude, position.longitude);
  const map = new google.maps.Map(mapElement, { center: origin, zoom: 16 });

  const speed = document.getElementById("speed");
  const animation = document.getElementById("animation");
  var smooth = animation.checked;


  animation.onchange = function(el) {
    smooth = el.target.checked;


    console.log(el.target.checked);
  }

  speed.onchange = function(el) {
    console.log(el.target.checked);
    if(el.target.checked){
      channel.publish("update", "{ \"speed\": 2 }");
    }else{
      channel.publish("update", "{ \"speed\": 10 }");
    }

  }

  // End of map setup.

  const ably = new Ably.Realtime.Promise({ authUrl: '/api/createTokenRequest' });


  const channelId = `rider002.delivery223.locations`;
  
  const channel = await ably.channels.get(channelId, {params: {rewind: '1'}});

  await channel.attach();

  const busses = new Map();

  const riders = new Map();

  channel.subscribe(function(message) {
    console.log("Received", message);

    const vehicle = JSON.parse(message.data);
    const riderID = vehicle.id;

    if (!riders.has(riderID)) {
      const newBus = new Vehicle(riderID, { 
        latitude: vehicle.Lat,
        longitude: vehicle.Lon
      }, true);

      riders.set(riderID, newBus);      
      newBus.line.setMap(map);
      map.panTo(newBus.line.getPath().getAt(1));
    }

    const bus = riders.get(riderID);
    
    bus.move({ 
      latitude: vehicle.Lat,
      longitude: vehicle.Lon
    },  document.getElementById("animation").checked);
  });

})();