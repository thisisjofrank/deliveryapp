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
  
  async move(destinationLatLong, smooth) { 

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
    const speed = 100;
    const percentDivisor = speed / 100;
    
    if(smooth){
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
      }, 10);
    }else{
      this.position = new google.maps.LatLng( destinationLatLong.latitude, destinationLatLong.longitude);
    }
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
      //path: 'M128.51,168.65L128.51,168.65c-19.94-7.39-11.64-6.91-14.11-28.98c-0.82-29.29-1.55-58.59-2.43-87.88c0.26-18.65-10.08-38-29.17-41.86C37.54,2.21-9.24,4.08-54.81,9.16c-19.58,2.67-31.59,18.49-33.01,35.66c-2.44,36.7-2.4,73.56-3.34,110.33c-0.1,5.27-0.65,9.88-7.24,10.85c-8.18,1.75-15.42,9.22-13.43,17.99c1.33,13.19,20.2-8.23,19.92,2.71c-1.31,38.06-0.4,76.15-0.65,114.22c-0.37,51.79-0.38,103.63,1.57,155.38c4.98,45.52,55.54,43.66,90.41,44.75c23.5,0.74,46.93-0.73,70.32-2.96c52.27-3.11,46.18-60.23,46.19-98.49c-0.01-49.92,1.4-99.83-0.24-149.76c-0.99-20.57,1.17-41.3-0.28-61.95c-0.1-5.46,0.45-5.77,5.66-3.62c4.65,1.03,12.78,8.15,14.6,0.35C137.31,178.39,134.57,171.76,128.51,168.65z M93.76,162.36c-6.45,14.77-12.96,29.52-19.24,44.37c-1.61,3.8-2.61,5.26-7.69,3.87c-34.89-8.08-71.9-7.41-106.95-0.39c-3.05,0.66-4.36,0.24-5.58-2.65c-6.67-15.78-13.46-31.5-20.38-47.17c-1.23-2.78-0.66-3.65,2.17-4.33c24.87-5.84,52.64-9.4,77.73-9.19c26.58-0.15,51.46,2.82,76.07,8.26C96.32,156.56,96.3,156.54,93.76,162.36z M74.57,12.92c21.46,0.05,21.46,15.63,0,15.68C53.1,28.55,53.12,12.97,74.57,12.92z M-24.84,13.23C-0.28,11,24.29,10.2,48.85,13.26c1.47,0.18,3.03,0.16,2.64,2.54c-0.36,2.25-1.69,2.09-3.27,1.77c-24.23-2.77-48.46-2.27-72.7,0.1C-28.9,19.07-29.4,12.99-24.84,13.23z M-50.54,12.92c21.46,0.05,21.46,15.63,0,15.68C-72.01,28.55-71.99,12.97-50.54,12.92z M-72.19,202.61v-38.92c0.4-0.08,0.8-0.17,1.21-0.25c7.16,15.83,13.7,31.97,20.99,47.73c2.17,22.41-0.1,45.42,0.77,68.09c1.12,7.39-14.16,2.42-18.89,3.99c-3.36,0.17-4.15-1.07-4.14-4.27C-72.13,253.51-72.18,228.06-72.19,202.61z M-66.62,372.46L-66.62,372.46c-3.1,4.78-6.36,2.73-5.56-2.63c-0.03-10.5-0.01-21-0.01-31.49c-0.03-14.97,0.13-30.03-0.09-44.99c-0.57-8.38,12.84-2.71,18.01-4.53c4.18-0.32,5.04,1.46,5.01,5.23c-0.15,17.16-0.64,34.35,0.19,51.47C-47.39,358.74-58.95,364.14-66.62,372.46z M56.19,494.3c-5.67,1.37-97.73,5.21-91.95-3.76c0.48-3.17,1.41-4.24,5.04-3.93c28.73,2.41,57.49,3.25,86.22,0.04c3.34-0.37,3.89,0.92,4.39,3.54C60.53,493.47,59.02,493.99,56.19,494.3z M-62.72,378.27L-62.72,378.27c4.86-3.64,15.93-20.48,21.02-18.96c27,3.47,54.11,3.3,81.22,2.12c39.81,0.7,23.36-13.52,51.68,17.27C39.94,384.5-11.63,385.01-62.72,378.27z M101.2,331.22L101.2,331.22c-1.13,8.39,2.65,41.29-2.22,44.67c-1.73,0.83-2.56-1.08-3.56-2.02c-6.04-5.7-12-11.49-18.05-17.18c-1.18-1.11-1.7-2.24-1.69-3.89c0.16-19.45,0.44-38.91,0.21-58.36c-1.3-10.34,14.68-4,21.09-5.87c3.23-0.14,4.32,0.9,4.27,4.22C101.1,305.6,101.2,318.41,101.2,331.22z M100.95,280.98L100.95,280.98c0.83,4.95-18.1,1.34-21.92,2.43c-2.52,0.04-3.03-1.13-3.02-3.35c0.09-15.49,0.14-30.97,0.1-46.46c0.43-6.07,0.08-12.17-0.71-18.13c10.16-16.88,14.84-37.52,25.16-53.67C102.25,201.27,100.98,241.47,100.95,280.98z',
      path: 'M5341.4,2959.3c-131-63.2-178.4-230.4-106.2-368.1c63.2-124.2,119.7-135.5,618.8-135.5H6308l257.5-512.7L6823,1428L6244.8,283L5666.6-864.3h-616.6c-573.6,0-616.6,2.3-616.6,40.7c0,151.3,97.1,1183.5,117.4,1246.7c42.9,137.8,126.5,284.6,241.7,429.1c63.3,79,119.7,176.2,128.7,219.1c33.9,182.9-58.7,377.2-219.1,460.7c-92.6,47.4-112.9,47.4-1646.4,47.4c-1535.8,0-1553.8,0-1646.4-47.4c-192-99.4-277.8-345.6-187.5-548.8c49.7-115.2,164.9-214.6,273.3-234.9c85.8-18.1,70-38.4-54.2-76.8c-164.9-51.9-474.3-223.6-627.9-350.1C521.8,79.7,370.5-164.2,201.1-663.3c-142.3-420.1-135.5-589.5,27.1-770.1c126.5-140,223.6-176.2,490.1-176.2h228.1l27.1-162.6c83.6-487.8,463-876.3,953.1-980.2c616.6-131,1248.9,259.7,1411.5,874c18.1,67.8,33.9,155.8,33.9,196.5v72.3H4621c788.2,0,1278.3,9,1330.2,22.6c47.4,13.5,117.4,51.9,155.8,83.6c38.4,33.9,334.2,453.9,654.9,937.3c323,481.1,589.5,876.3,596.2,876.3c13.5,0,203.3-374.9,223.6-444.9c13.5-40.6-2.3-67.8-76.8-133.2c-323-291.3-546.6-783.7-551.1-1212.8l-2.2-198.7l83.6-79c115.2-103.9,250.7-108.4,363.6-9l76.8,67.8l27.1-126.5c79.1-402,420.1-770.2,826.6-894.4c196.5-61,505.9-65.5,684.3-11.3c424.6,131,743,463,851.4,885.3c101.6,399.7-22.6,837.9-325.2,1140.5c-115.2,115.2-137.8,144.6-90.3,128.7c90.3-36.2,232.6,13.5,293.6,101.6c67.8,92.6,67.8,237.1,2.3,329.7c-65.5,88.1-368.1,239.4-614.3,300.4c-162.6,40.6-232.6,47.4-485.6,36.1c-160.3-6.8-316.2-20.3-343.3-27.1c-47.4-15.8-74.5,31.6-433.6,765.6c-374.9,763.4-383.9,781.4-449.4,781.4c-182.9,0-379.4,126.5-467.5,300.4c-90.3,185.2-70,454,47.4,582.7c31.6,33.9,31.6,47.4-4.5,115.2c-72.3,140-128.7,203.3-221.3,246.2c-83.5,38.4-155.8,42.9-725,42.9C5510.8,2997.7,5404.6,2990.9,5341.4,2959.3z M8934.6-1142.1c187.5-110.7,286.8-368.1,219.1-569.1c-45.2-140-189.7-277.8-332-318.4c-512.7-149.1-853.7,505.9-442.7,846.9c47.4,40.7,117.4,81.3,153.6,92.6C8650.1-1054,8821.7-1076.6,8934.6-1142.1z M2640.3-1681.9c-22.6-124.2-126.5-248.4-262-318.4c-103.9-54.2-142.3-63.2-243.9-51.9c-216.8,20.3-395.2,173.9-444.9,381.7l-15.8,61h490.1h492.3L2640.3-1681.9z',
      scale: .004,
     // transform:"scale(-2,2)",
     fillColor: '#FF69B4',
     fillOpacity: 1,
     rotation: -90,
     anchor: new google.maps.Point(50, 100)
   }
 };