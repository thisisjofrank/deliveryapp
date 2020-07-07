export class Vehicle {
    constructor(id, latLong, follow) {
      this.id = id;
      this.follow = follow || false;
      
      this.position = new google.maps.LatLng(latLong.latitude, latLong.longitude);
      this.line = new google.maps.Polyline({
        geodesic: true,
        path: [this.position, this.position],
        strokeColor: '#FF0000',
        strokeOpacity: 0,
        icons: [ 
          { icon: car(), offset: '100%' }
        ]
      })
    }
  
    async move(destinationLatLong) {    
      const currentPosAtLatLong = { latitude: this.position.lat(), longitude: this.position.lng() };
      const routeResponse = await GetRoute(currentPosAtLatLong, destinationLatLong);
      const pathAsLatLongs = routeResponse.routes[0].overview_path;
      
      this.line.get("icons")[0].offset = "0%";
      this.line.setPath(pathAsLatLongs);      
  
      let count = 0;
      const speed = 200;
      const percentDivisor = speed / 100;
  
      let timer = setInterval(()  => {       
          count = (count + 1) % speed;
      
          const icons = this.line.get("icons");
          icons[0].offset = count / percentDivisor + "%";
          this.line.set("icons", icons);
         
         
          if (count == speed - 1) { 
            clearInterval(timer);
            this.position = pathAsLatLongs[pathAsLatLongs.length - 1];

            if (this.follow) {
                this.line.map.setCenter(this.position);
            }
          }
        }, 50);
    }
}

  
async function GetRoute(start, end) {  
    var directionsService = new google.maps.DirectionsService();
    
    const promise = new Promise((res, rej) => {
      directionsService.route({
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


const car = () => {
    return {
      path: 'M 236.54427,9.8485 C 220.2445,9.8485 204.45277,15.405415 191.41289,25.550223 L 97.337229,97.995127 L -135.0706,131.12201 C -150.90459,133.65817 -161.13586,149.44963 -156.32358,165.14237 L -132.57022,244.60846 L -86.188678,244.60846 C -90.823109,289.62242 -60.00389,319.2235 -20.679452,319.2235 C 18.644986,319.2235 49.844083,285.73585 44.829779,244.60846 L 425.19586,244.60846 C 419.65783,289.49008 452.23789,319.2235 490.70508,319.2235 C 529.17227,319.2235 561.22444,285.70267 556.21433,244.60846 L 651.04018,244.60846 C 659.88863,244.60846 667.48002,236.98237 667.48,227.63005 L 667.48,137.76012 C 667.48,129.20037 661.30023,122.08284 653.22799,120.97335 L 491.76774,97.995127 L 427.82125,32.635149 C 413.84999,18.051989 394.74442,10.165524 374.56372,9.8485 L 236.54427,9.8485 z M 304.42883,37.42226 L 378.62679,37.42226 C 389.64854,37.42226 399.73373,43.261111 405.94316,52.613356 L 424.25825,80.825395 C 428.78955,88.722668 423.85522,96.409133 415.38198,97.803717 L 304.42883,97.803717 L 304.42883,37.42226 z M 224.60508,37.549916 L 283.42586,37.549916 L 283.42586,97.803717 L 132.59212,97.803717 L 200.10167,45.97523 C 207.08728,40.585799 215.91189,37.549914 224.60508,37.549916 z',
      scale: .05,
      fillColor: 'blue',
      fillOpacity: 1,
      rotation: 90,
      anchor: new google.maps.Point(0, 200)
    }
  };
  
  