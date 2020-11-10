const express = require('express');
const Ably = require('ably/promises');
require('dotenv').config()

const client = new Ably.Realtime(process.env.ABLY_API_KEY);
const port = process.env.PORT || 5000;

const app = express();
app.get("/mapbox", async (request, response) => {
    response.sendFile(__dirname + '/views/index.html');
});

app.get("/google", async (request, response) => {
    response.sendFile(__dirname + '/views/google.html');
});

app.get("/api/createTokenRequest", async (request, response) => {
    const tokenRequestData = await client.auth.createTokenRequest({ 
        clientId: 'ably-client-side-api-calls-demo' 
    });
    response.send(tokenRequestData);
});
  
app.use(express.static('public'))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))