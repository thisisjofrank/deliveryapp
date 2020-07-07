(async function() {
// This example adds an animated symbol to a polyline.

async function initMap() {
    var map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 20.291, lng: 153.027 },
      zoom: 16,
      mapTypeId: "terrain"
    });
  
    // Define the symbol, using one of the predefined paths ('CIRCLE')
    // supplied by the Google Maps JavaScript API.
    var lineSymbol = {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      strokeColor: "#393"
    };
    
    const routeResponse = await GetRoute({ latitude:  41.772621154785156, longitude: -72.69306182861328 }, { latitude: 41.7709007, longitude: -72.6948721 });
    const pathAsLatLongs = routeResponse.routes[0].overview_path;
    
// { latitude: 41.772621154785156, longitude: -72.69306182861328 }
//, { latitude: 41.771721154785156, longitude: -72.69406182861328 })
// { latitude: 41.7709007, longitude: -72.6948721 }

    // Create the polyline and add the symbol to it via the 'icons' property.
    var line = new google.maps.Polyline({
      /*path: [
        { lat:  41.772621154785156, lng: -72.69306182861328 },
        { lat:  41.771721154785156, lng: -72.69406182861328 },
        { lat: 41.7709007, lng: -72.6948721 }
      ],*/
      path: pathAsLatLongs,
      icons: [
        {
          icon: lineSymbol,
          offset: "100%"
        }
      ],
      map: map
    });

    map.setCenter(line.getPath().getAt(1));
  
    animateCircle(line);
  }
  
  // Use the DOM setInterval() function to change the offset of the symbol
  // at fixed intervals.
  function animateCircle(line) {
    var count = 0;
    window.setInterval(function() {
      count = (count + 1) % 200;
  
      var icons = line.get("icons");
      icons[0].offset = count / 2 + "%";
      line.set("icons", icons);
    }, 20);
  }

  initMap();



    
async function GetRoute(start, end) {  
    var directionsService = new google.maps.DirectionsService();
    
    const promise = new Promise((res, rej) => {
      directionsService.route(
        {
          origin: `${start.latitude},${start.longitude}`,
          destination: `${end.latitude},${end.longitude}`,
          travelMode: "DRIVING"
        },
        function(response, status) {
          if (status == "OK") { res(response); } else { rej(response); }
        }
      );
    });
  
    return promise;
  }
  
})();
