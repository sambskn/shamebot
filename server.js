/* Setting things up. */
var path = require('path'),
    express = require('express'),
    app = express(),   
    Twit = require('twit'),
    fs = require('fs'),
    readline = require('readline'),
    google = require('googleapis'),
    googleAuth = require('google-auth-library'),
    SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly',
    config = {
    /* Be sure to update the .env file with your API keys. See how to get them: https://botwiki.org/tutorials/how-to-create-a-twitter-app */      
      twitter: {
        consumer_key: process.env.CONSUMER_KEY,
        consumer_secret: process.env.CONSUMER_SECRET,
        access_token: process.env.ACCESS_TOKEN,
        access_token_secret: process.env.ACCESS_TOKEN_SECRET
      }
    },
    T = new Twit(config.twitter);

app.use(express.static('public'));

/* You can use uptimerobot.com or a similar site to hit your /BOT_ENDPOINT to wake up your app and make your Twitter bot tweet. */

app.all("/" + process.env.BOT_ENDPOINT, function (request, response) {
  var resp = response;
  var tweet  = "";
  var date =  new Date().getTime();
  tweet = "hey this is the time now: " + date;
  T.post('statuses/update', { status: tweet }, function(err, data, response) {
    if (err){
      resp.sendStatus(500);
      console.log('Error!');
      console.log(err);
    }
    else{
      resp.sendStatus(200);
      authenticate(listTeams);
    }
  });
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your bot is running on port ' + listener.address().port);
});

function authenticate(callback){
  var keysEnvVar = process.env.GOOGLE_CREDS;
  if (!keysEnvVar) {
    throw new Error("Didn't find Google Credentials ENV var");
  }
  var auth = new googleAuth();
  var keys = JSON.parse(keysEnvVar);
  var client = new auth.fromJSON(keys);
  client.scopes = SCOPE;
  client.authorize( function() {
    callback(client);
  });

}

/**
 * Print the info for all the teams that suck
 * https://docs.google.com/spreadsheets/d/1jN26YeuCpdd82TZzKgtGchqte6da_XTnSeC0DdV8YTA/edit#gid=0
 */
function listTeams(authClient) {
  var sheets = google.sheets('v4');
  
  
  console.log(sheetsAPI);
  sheets.spreadsheets.values.get({
    spreadsheetId: '1jN26YeuCpdd82TZzKgtGchqte6da_XTnSeC0DdV8YTA', //change this to another *public* spreadsheet if you want
    range: 'Sheet1!A3:C',
    auth: authClient
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      console.log(response);
      return;
    }
    var rows = response.values;
    if (rows.length == 0) {
      console.log('No data found.');
    } else {
      console.log('Team, Tourney, Days b4 Tourney Start');
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        // Print columns A and E, which correspond to indices 0 and 4.
        console.log('%s, %s, %s', row[0], row[1], row[2]);
      }
    }
  });
}
