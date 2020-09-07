// This is a fake example of your server side component that would 

(async function() {

    const ably = new Ably.Realtime.Promise({ authUrl: '/api/createTokenRequest' });
    const channelId = `rider002.delivery223.locations`;  
    const channel = await ably.channels.get(channelId);

    await channel.attach();

    // do/while loop here
    
    channel.publish({
        Lon: -122.02325364, 
        id: "rider55", 
        Acc: 10, 
        Lat: 37.33628116
    });

})();