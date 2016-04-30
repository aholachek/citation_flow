
var express = require('express');
var cors = require('cors');

var fetchNetwork= require('./fetchNetworkData');

var app = express();

app.use(cors());

//return forecast for current day, starting from the morning
app.get('/build-network', fetchNetwork);

//process.env is from heroku
app.listen( 4000 );
