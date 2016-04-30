var express = require('express');
var path = require('path');

var fetchNetwork= require('./fetchNetworkData');

var app = express();

//tell express to serve static files, including index.html
app.use('/', express.static(path.join(__dirname, 'dist')));

//return forecast for current day, starting from the morning
app.get('/build-network', fetchNetwork);

//pushstate
// send all requests to index.html so browserHistory in React Router works
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

//process.env is from heroku
var port = process.env.PORT || 4000;

app.listen( port , function(){
  console.log("listening on port " + port +  " and serving " + __dirname + "/dist")
});
