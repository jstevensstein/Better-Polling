require('dotenv').config()
var express = require('express');
var bodyParser = require('body-parser')
var path = require('path');

var PollsService = require('./pollsService.js');

var app = express();
var urlencodedParser = bodyParser.urlencoded({ extended: true })

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use("/vendor", express.static(path.join(__dirname, "vendor")));


app.get('/', function(req, res) {
  res.render("index");
});

app.post('/createpoll', urlencodedParser, function(req, res){
  PollsService.createPoll('name', req.body.choices)
  .then(function(pollId){
    res.status(200).json(null);
  }, function(reason){
    res.status(500).send(null);
  });
  PollsService.sendEmailsForPoll(1, req.body.emails);
});

app.listen(3000);