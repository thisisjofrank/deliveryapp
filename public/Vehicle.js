export class Vehicle {

    constructor(id, follow, markerWrapper) {
        this.id = id;
        this.follow = follow || false;

        this.marker = markerWrapper;

        this.moveBuffer = [];
        this.animationRateMs = 20;
        this.animate();
    }

    get position() {
        return this.marker.getCurrentLngLat();
    }

    async move(destinationLatLong, snapToLocation = false) {

        if(snapToLocation) {
            this.moveBuffer = [ { lng: destinationLatLong.longitude, lat: destinationLatLong.latitude } ];
            return;
        }

        this.moveBuffer = [];
        const currentLngLat = this.marker.getCurrentLngLat();
        
        var path = turf.lineString([
            [currentLngLat.lng, currentLngLat.lat], 
            [destinationLatLong.longitude, destinationLatLong.latitude]
        ]);

        var pathLength = turf.length(path, { units: 'miles' });

        var numSteps = 500; //Change this to set animation resolution

        for (let step = 0; step <= numSteps; step++) {
            const curDistance = step / numSteps * pathLength;
            const targetLocation = turf.along(path, curDistance, { units: "miles" });
            const target = targetLocation.geometry.coordinates;

            const targetLngLat = { lng: target[0], lat: target[1] };
            this.moveBuffer.push(targetLngLat);
        }        
    }

    async animate() {

        var interval = setInterval(() => {

            if(this.moveBuffer.length === 0) {
                return; 
            }

            const currentLngLat = this.marker.getCurrentLngLat();
            const targetLngLat = this.moveBuffer.shift();

            const bearing = this.getDirectionOfTravel(currentLngLat, targetLngLat);
            
            this.marker.updatePosition(targetLngLat, bearing);

        }, this.animationRateMs);
    }

    getDirectionOfTravel(currentLngLat, targetLngLat) {
        var current = turf.point([ currentLngLat.lng, currentLngLat.lat ]);
        var next = turf.point([ targetLngLat.lng, targetLngLat.lat ]);
        
        const bearing = turf.bearing(current, next);
        return Math.round(bearing);
    }    
}