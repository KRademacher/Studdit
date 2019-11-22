const express = require('express');
const http = require('http');
const routes = require('./api/routes');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;


app.use('*', function(req, res, next){
	res.contentType('application/json');
	next();
});

app.use(bodyParser.urlencoded({'extended': 'true'}));
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.json({type:'application/vnd.api+json'}));

mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);
mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);
mongoose.connect('mongodb://<admin>:<admin123>@ds033841.mlab.com:33841/studdit');

app.use('/api', routes);

app.use('*', function(err, req, res, next) {
	console.log('Error: ' + err);
	res.status(404).json({ error: err }).end();
});

app.listen(port, function() {
	console.log('Server listens on port ' + port);
});

module.exports = app;