var express = require('express'),
    app = express.createServer(express.logger()),
    port;

app.get('/', function (request, response) {
    response.send('Hello World');
});

port = process.env.PORT || 5000;
app.listen(port, function () {
    console.log('Listening on ' + port);
});
