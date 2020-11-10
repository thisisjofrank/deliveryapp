import { Vehicle } from "./Vehicle.js";

export class RiderConnection {

  constructor(markerFactory) {
    this.riders = new Map();
    this.markerFactory = markerFactory;
    this.ably = new Ably.Realtime.Promise({ authUrl: '/api/createTokenRequest' });

    const updateChannelButton = document.getElementById("updateChannelButton");
    
    if (updateChannelButton) {
        updateChannelButton.addEventListener("click", () => {
            this.connect(document.getElementById("channelID").value);
        });
    }
  }

  async connect(channelId) {
    if (this.channelId) {
        this.channel.unsubscribe();
        await this.channel.detach();
    }

    this.channelId = channelId ||'iosfakelocation';
    this.channel = this.ably.channels.get(this.channelId);

    await this.channel.attach();

    this.channel.subscribe((message) => {
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

    const animation = document.getElementById("animation");
    const shouldSnap = !animation.checked;

    rider.move(destination, shouldSnap);
  }
}