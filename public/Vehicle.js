export class Vehicle {
    constructor(id, latLong, follow, map) {
        this.id = id;
        this.follow = follow || false;

        this.position = latLong;
        this.map = map;

        this.el = document.createElement('div');
        this.el.className = 'marker';

        this.marker = new mapboxgl.Marker(this.el)
            .setLngLat([latLong.longitude, latLong.latitude])
            .addTo(this.map);
    }

    async move(destinationLatLong) {

        const routeResponse = await TryGetRoute(this.position, destinationLatLong);

        if (routeResponse == null) {
            console.log("Couldn't find a path.");
            return;
        }

        const pathAsLatLongs = routeResponse.geometry.coordinates;

        if (pathAsLatLongs.length <= 1) {
            console.log("Path didn't contain enough points to follow.")
            return;
        }

        var path = turf.linestring([...pathAsLatLongs]);        
        var pathLength = turf.lineDistance(path, 'miles');

        var step = 0;
        var numSteps = 500; //Change this to set animation resolution
        var timePerStep = 20; //Change this to alter animation speed
        
        var interval = setInterval(() => {
            step += 1;
            
            if (step > numSteps) {
                clearInterval(interval);
                return;
            } 
            
            const curDistance = step / numSteps * pathLength;
            const targetLocation = turf.along(path, curDistance, 'miles');
            const target = targetLocation.geometry.coordinates;

            const currentLngLat = this.marker.getLngLat();
            const targetLngLat = { lng: target[0], lat: target[1] };

            const direction = this.getDirectionOfTravel(currentLngLat, targetLngLat);
            this.el.setAttribute("data-direction", direction);

            this.marker.setLngLat(target);
            this.marker.addTo(this.map);

        }, timePerStep);

        this.position = destinationLatLong;
    }

    getDirectionOfTravel(currentLngLat, targetLngLat) {    
        const directionLng = targetLngLat.lng <= currentLngLat.lng ? "left" : "right";
        const directionLat = targetLngLat.lat <= currentLngLat.lat ? "down" : "up";    
        const diffLng = Math.abs(targetLngLat.lng - currentLngLat.lng);
        const diffLat = Math.abs(targetLngLat.lat - currentLngLat.lat);
        return diffLng >= diffLat ? directionLng : directionLat;
    }    
}

async function TryGetRoute(start, end) {
    try {
        return await GetRoute(start, end);
    } catch (exception) {
        console.log("There was an error routefinding.", exception);
        return null;
    }
}

async function GetRoute(start, end) {
    const directionsApi = `https://api.mapbox.com/directions/v5/mapbox/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?geometries=geojson&access_token=pk.eyJ1IjoidGhpc2lzam9mcmFuayIsImEiOiJjazl0dTkzZGIwMGY0M2ZwYXlidzBqc2VqIn0._NdPXGNS5xrGsepZgesYWQ`;

    const response = await fetch(directionsApi);
    const responseJson = await response.json();

    return responseJson.routes[0];
}