export class MapBoxMarker {
    constructor(map, latLong) {
        this.el = document.createElement('div');
        this.el.className = 'marker';

        this.map = map;
        this.marker = new mapboxgl.Marker(this.el)
            .setLngLat([latLong.longitude, latLong.latitude])
            .addTo(this.map);
    }

    getCurrentLngLat() {
        return this.marker.getLngLat();
    }

    updatePosition(targetLngLat, bearing) {
        this.marker.setLngLat(targetLngLat);
        this.el.style.transform += `rotate(${bearing}deg)`;
    }

    focus() {
        const position = this.getCurrentLngLat();
        this.map.flyTo({center: [position.lng, position.lat], essential: true});
    }
}

export class GoogleMapsMarker {
    constructor(map, latLong) {
        this.map = map;
        this.current = { lng: latLong.longitude, lat: latLong.latitude };
        this.marker = new google.maps.Marker({ icon: "driverN.png", map: map });
    }

    getCurrentLngLat() {
        return this.current;
    }

    updatePosition(targetLngLat, bearing) {
        this.marker.setPosition(targetLngLat);
        this.current = targetLngLat;

        const compass = this.bearingToCompass(bearing);

        if(bearing != 0 && compass != "") {
            this.marker.setIcon(`driver${compass}.png`);        
        }
    }
    
    focus() {
        this.map.panTo(this.current);
    }

    bearingToCompass(bearing) {
        if (bearing > -45 && bearing < 45) {
            return "N";
        }
        if (bearing > 45 && bearing < 135) {
            return "E";
        }
        if ((bearing > 135 && bearing < 180) || (bearing < -135 && bearing > -180)) {
            return "S";
        }
        if (bearing > -135 && bearing < -45) {
            return "W";
        }

        return "";
    }
}
