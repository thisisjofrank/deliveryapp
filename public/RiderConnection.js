import { Vehicle } from "./Vehicle.js";

export class RiderConnection {

  constructor(markerFactory) {
    this.riders = new Map();
    this.markerFactory = markerFactory;
  }

  async connect() { 
    const ably = new Ably.Realtime.Promise({ authUrl: '/api/createTokenRequest' });
    const channelId = 'iosfakelocation';  
    const channel = ably.channels.get(channelId);
  
    await channel.attach();

    channel.subscribe((message) => {
      console.log("Received", message);
      this.processMessage(message);
    });
  }

  processMessage(message) {  
    const parsedData = JSON.parse(message.data);
    const coords = parsedData.geometry.coordinates;
    const vehicle = { lat: coords[1], lng: coords[0] };

    const riderId = vehicle.id ?? "some-id";

    if (!this.riders.has(riderId)) {

      const marker = this.markerFactory(vehicle);
      const newRider = new Vehicle(riderId, true, marker);

      this.riders.set(riderId, newRider); 
      marker.focus();
    }

    const rider = this.riders.get(riderId);
    const destination = { 
      latitude: vehicle.lat,
      longitude: vehicle.lng
    };

    rider.move(destination);
  }
}
