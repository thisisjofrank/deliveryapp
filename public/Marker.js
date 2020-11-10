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
        console.log(this.marker);
        this.current = targetLngLat;
    }
    
    focus() {
        this.map.panTo(this.current);
    }
}
