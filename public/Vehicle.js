export class Vehicle {
    constructor(id, latLong, follow, map) {
        this.id = id;
        this.follow = follow || false;

        this.map = map;

        this.el = document.createElement('div');
        this.el.className = 'marker';

        this.marker = new mapboxgl.Marker(this.el)
            .setLngLat([latLong.longitude, latLong.latitude])
            .addTo(this.map);

        this.moveBuffer = [];
        this.animationRateMs = 20;
        this.animate();
    }

    async move(destinationLatLong) {

        this.moveBuffer = [];
        const currentLngLat = this.marker.getLngLat();
        
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

            const currentLngLat = this.marker.getLngLat();
            const targetLngLat = this.moveBuffer.shift();

            const bearing = this.getDirectionOfTravel(currentLngLat, targetLngLat);
            this.el.setAttribute("data-direction", bearing);

            this.marker.setLngLat(targetLngLat);
            this.el.style.transform += `rotate(${bearing}deg)`;

        }, this.animationRateMs);
    }

    getDirectionOfTravel(currentLngLat, targetLngLat) {
        var current = turf.point([ currentLngLat.lng, currentLngLat.lat ]);
        var next = turf.point([ targetLngLat.lng, targetLngLat.lat ]);
        
        const bearing = turf.bearing(current, next);
        return Math.round(bearing);
    }    
}