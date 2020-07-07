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
        icons: [ { icon: car(), offset: '100%' } ]
      })
    }
  
    async move(destinationLatLong) { 

        const currentPosAtLatLong = { latitude: this.position.lat(), longitude: this.position.lng() };        
        const routeResponse = await TryGetRoute(currentPosAtLatLong, destinationLatLong);
        
        if (routeResponse == null) {
            console.log("Couldn't find a path.");
            return;
        }

        const pathAsLatLongs = routeResponse.routes[0].overview_path;

        if (pathAsLatLongs.length == 0 || pathAsLatLongs.length == 1) {
            console.log("Path didn't contain enough points to follow.")
            return;
        }

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
                    this.line.map.panTo(this.position);
                }
            }
        }, 50);
    }
}

async function TryGetRoute(start, end) {
    try{
        return await GetRoute(start, end);        
    } catch (exception) {
        console.log("There was an error routefinding.", exception);
        return null;
    }
}
  
async function GetRoute(start, end) {  
    var directionsService = new google.maps.DirectionsService();
    
    const promise = new Promise((res, rej) => {
      directionsService.route({
          origin: `${start.latitude},${start.longitude}`,
          destination: `${end.latitude},${end.longitude}`,
          travelMode: "TRANSIT",
          transitOptions: {
              modes: ["BUS"]
          }
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
      path: 'M128.51,168.65L128.51,168.65c-19.94-7.39-11.64-6.91-14.11-28.98c-0.82-29.29-1.55-58.59-2.43-87.88c0.26-18.65-10.08-38-29.17-41.86C37.54,2.21-9.24,4.08-54.81,9.16c-19.58,2.67-31.59,18.49-33.01,35.66c-2.44,36.7-2.4,73.56-3.34,110.33c-0.1,5.27-0.65,9.88-7.24,10.85c-8.18,1.75-15.42,9.22-13.43,17.99c1.33,13.19,20.2-8.23,19.92,2.71c-1.31,38.06-0.4,76.15-0.65,114.22c-0.37,51.79-0.38,103.63,1.57,155.38c4.98,45.52,55.54,43.66,90.41,44.75c23.5,0.74,46.93-0.73,70.32-2.96c52.27-3.11,46.18-60.23,46.19-98.49c-0.01-49.92,1.4-99.83-0.24-149.76c-0.99-20.57,1.17-41.3-0.28-61.95c-0.1-5.46,0.45-5.77,5.66-3.62c4.65,1.03,12.78,8.15,14.6,0.35C137.31,178.39,134.57,171.76,128.51,168.65z M93.76,162.36c-6.45,14.77-12.96,29.52-19.24,44.37c-1.61,3.8-2.61,5.26-7.69,3.87c-34.89-8.08-71.9-7.41-106.95-0.39c-3.05,0.66-4.36,0.24-5.58-2.65c-6.67-15.78-13.46-31.5-20.38-47.17c-1.23-2.78-0.66-3.65,2.17-4.33c24.87-5.84,52.64-9.4,77.73-9.19c26.58-0.15,51.46,2.82,76.07,8.26C96.32,156.56,96.3,156.54,93.76,162.36z M74.57,12.92c21.46,0.05,21.46,15.63,0,15.68C53.1,28.55,53.12,12.97,74.57,12.92z M-24.84,13.23C-0.28,11,24.29,10.2,48.85,13.26c1.47,0.18,3.03,0.16,2.64,2.54c-0.36,2.25-1.69,2.09-3.27,1.77c-24.23-2.77-48.46-2.27-72.7,0.1C-28.9,19.07-29.4,12.99-24.84,13.23z M-50.54,12.92c21.46,0.05,21.46,15.63,0,15.68C-72.01,28.55-71.99,12.97-50.54,12.92z M-72.19,202.61v-38.92c0.4-0.08,0.8-0.17,1.21-0.25c7.16,15.83,13.7,31.97,20.99,47.73c2.17,22.41-0.1,45.42,0.77,68.09c1.12,7.39-14.16,2.42-18.89,3.99c-3.36,0.17-4.15-1.07-4.14-4.27C-72.13,253.51-72.18,228.06-72.19,202.61z M-66.62,372.46L-66.62,372.46c-3.1,4.78-6.36,2.73-5.56-2.63c-0.03-10.5-0.01-21-0.01-31.49c-0.03-14.97,0.13-30.03-0.09-44.99c-0.57-8.38,12.84-2.71,18.01-4.53c4.18-0.32,5.04,1.46,5.01,5.23c-0.15,17.16-0.64,34.35,0.19,51.47C-47.39,358.74-58.95,364.14-66.62,372.46z M56.19,494.3c-5.67,1.37-97.73,5.21-91.95-3.76c0.48-3.17,1.41-4.24,5.04-3.93c28.73,2.41,57.49,3.25,86.22,0.04c3.34-0.37,3.89,0.92,4.39,3.54C60.53,493.47,59.02,493.99,56.19,494.3z M-62.72,378.27L-62.72,378.27c4.86-3.64,15.93-20.48,21.02-18.96c27,3.47,54.11,3.3,81.22,2.12c39.81,0.7,23.36-13.52,51.68,17.27C39.94,384.5-11.63,385.01-62.72,378.27z M101.2,331.22L101.2,331.22c-1.13,8.39,2.65,41.29-2.22,44.67c-1.73,0.83-2.56-1.08-3.56-2.02c-6.04-5.7-12-11.49-18.05-17.18c-1.18-1.11-1.7-2.24-1.69-3.89c0.16-19.45,0.44-38.91,0.21-58.36c-1.3-10.34,14.68-4,21.09-5.87c3.23-0.14,4.32,0.9,4.27,4.22C101.1,305.6,101.2,318.41,101.2,331.22z M100.95,280.98L100.95,280.98c0.83,4.95-18.1,1.34-21.92,2.43c-2.52,0.04-3.03-1.13-3.02-3.35c0.09-15.49,0.14-30.97,0.1-46.46c0.43-6.07,0.08-12.17-0.71-18.13c10.16-16.88,14.84-37.52,25.16-53.67C102.25,201.27,100.98,241.47,100.95,280.98z',
      scale: .07,
      fillColor: '#333',
      fillOpacity: 1,
      rotation: 0,
      anchor: new google.maps.Point(0, 100)
    }
};