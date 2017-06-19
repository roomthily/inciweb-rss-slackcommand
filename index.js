"use strict";

const ts = require('./tinyspeck.js'),
      feed = require("feed-read"),
      moment = require('moment');

var slack = ts.instance({ });
var connected=false;

//
// For each Slash Command that you want to handle, you need to add a new `slack.on()` handler function for it.
// This handler captures when that particular Slash Command has been used and the resulting HTTP request fired
// to your endpoint. You can then run whatever code you need to for your use-case. 
//
// The `slack` functions like `on()` and `send()` are provided by `tinyspeck.js`. 
//
// Watch for /count slash command
slack.on('/inciweb', payload => {
  console.log("Received /count slash command from user " + payload.user_id);
  let user_id = payload.user_id;
  let response_url = payload.response_url;
  
  let text = payload.text;
  
  // get the rss url
  // TODO: GET STATE
  var url = _get_rss_url();
  
  
  let message = "Current fire information from Inciweb";
  
  let attachments = [];
  _get_feed(url, (err, data) => {
    console.log('num items: ', data.length);
    
    // grab only things published in last week
    var last_week = moment().subtract(7, 'days');
    var recent_items = data.map((d) => {
      if (moment(d.published).isSameOrAfter(last_week)) {
        return d;
      }
      return;
    }).filter((d) => {
      return d != undefined;
    });
    
    console.log('recents: ', recent_items.length);
    
    var limit = Math.min(5, recent_items.length);
    
    // for a concise slackiness
    // we want the title, the date, the link to the 
    // incident and to pull the acreage/containment 
    // info from the text.
    // if not acreage/containment, then idk???
    
    recent_items.slice(0, limit).map((d) => {
      attachments.push({
        "fallback": d.title,
        "title_link": d.link,
        "title": d.title,
        "ts": moment(d.published).unix(), // to epoch timestamp for slack
        "fields": _parse_description(d.content)
      });
    });
    console.log('do i have stuffs?', attachments.length);
    
    // send the stuff
    let response = Object.assign({ channel: user_id, text: message, attachments: attachments });
    slack.send(response_url, response).then(res => { // on success
      console.log("Response sent to /count slash command");
    }, reason => { // on failure
      console.log("An error occurred when responding to /inciweb slash command: " + reason);
    });
  });
      
});

function _get_rss_url(state=undefined) {
  // for a state:
  //   https://inciweb.nwcg.gov/feeds/rss/incidents/state/{ state index }/
  // for national:
  //   https://inciweb.nwcg.gov/feeds/rss/incidents/
  
  if (state == undefined) {
    return "https://inciweb.nwcg.gov/feeds/rss/incidents/";
  } else {
    return `https://inciweb.nwcg.gov/feeds/rss/incidents/state/${state}/`;
  }
}

function _get_feed(url, callback) {
  feed(url, function(err, articles) {
    if (err) throw err;
    if (articles.length < 1) {
      // TODO: update for the card processing
      return callback(null, "No 🔥s in inciweb.");
    }

    // pass the bits back for the cards & bot response
    // fxn(err, data)
    console.log('stuff to callback');
    return callback(null, articles);
  });
}

function _parse_description(desc) {
  // get the acres and containment
  // returning as slack-structured fields
  var acreage_rx = /Acres: ([\s\S]*) acres/g;
  var contain_rx = /Containment: ([\s\S]*)%/g;
  
  var acreage = desc.match(acreage_rx);
  var containment = desc.match(contain_rx);
  
  return [
    {
      "title": "Acreage", 
      "value": acreage != null ? acreage[0] : '❓', 
      "short": true
    },
    {
      "title": "Containment", 
      "value": containment != null ? containment[0] : '⚠️', 
      "short": true
    }
  ];
}

function _get_state(state) {
  var the_key = '';
  if (states.keys().contains(state.lower())) {
    the_key = state.lower();
  }
  if (states.values().contains(state.upper())) {
    for (key in states.keys()) {
      if (states[key] == state.upper()) {
        the_key = key;
        break;
      }
    }
  }
  
  return states.keys().sort().indexOf(the_key) + 1;
}

// if sorted by keys then index+1 == the counter for inciweb
var states = {
  "alabama": "AL",
  "alaska": "AK",
  "arizona": "AZ",
  "arkansas": "AR",
  "california": "CA",
  "colorado": "CO",
  "connecticut": "CT",
  "delaware": "DE",
  "district of columbia": "DC",
  "florida": "FL",
  "gGeorgia": "GA",
  "hawaii": "HI",
  "idaho": "ID",
  "illinois": "IL",
  "indiana": "IN",
  "iowa": "IA",
  "kansas": "KS",
  "kentucky": "KY",
  "louisiana": "LA",
  "maine": "ME",
  "maryland": "MD",
  "massachusetts": "MA",
  "michigan": "MI",
  "minnesota": "MN",
  "mississippi": "MS",
  "missouri": "MO",
  "montana": "MT",
  "nebraska": "NE",
  "nevada": "NV",
  "new hampshire": "NH",
  "new jersey": "NJ",
  "new mexico": "NM",
  "new york": "NY",
  "north carolina": "NC",
  "north dakota": "ND",
  "ohio": "OH",
  "oklahoma": "OK",
  "oregon": "OR",
  "pennsylvania": "PA",
  "puerto rico": "PR",
  "rhode island": "RI",
  "south carolina": "SC",
  "south dakota": "SD",
  "tennessee": "TN",
  "texas": "TX",
  "utah": "UT",
  "vermont": "VT",
  "virginia": "VA",
  "washington": "WA",
  "west virginia": "WV",
  "wisconsin": "WI",
  "wyoming": "WY"
}

// <select name="state_id" id="state_id" class="select_width" tabindex="2"><option value="" selected="selected">state</option><option value="1">ALABAMA</option><option value="2">ALASKA</option><option value="3">ARIZONA</option><option value="4">ARKANSAS</option><option value="5">CALIFORNIA</option><option value="6">COLORADO</option><option value="7">CONNECTICUT</option><option value="8">DELAWARE</option><option value="9">DISTRICT OF COLUMBIA</option><option value="10">FLORIDA</option><option value="11">GEORGIA</option><option value="12">HAWAII</option><option value="13">IDAHO</option><option value="14">ILLINOIS</option><option value="15">INDIANA</option><option value="16">IOWA</option><option value="17">KANSAS</option><option value="18">KENTUCKY</option><option value="19">LOUISIANA</option><option value="20">MAINE</option><option value="21">MARYLAND</option><option value="22">MASSACHUSETTS</option><option value="23">MICHIGAN</option><option value="24">MINNESOTA</option><option value="25">MISSISSIPPI</option><option value="26">MISSOURI</option><option value="27">MONTANA</option><option value="28">NEBRASKA</option><option value="29">NEVADA</option><option value="30">NEW HAMPSHIRE</option><option value="31">NEW JERSEY</option><option value="32">NEW MEXICO</option><option value="33">NEW YORK</option><option value="34">NORTH CAROLINA</option><option value="35">NORTH DAKOTA</option><option value="36">OHIO</option><option value="37">OKLAHOMA</option><option value="38">OREGON</option><option value="39">PENNSYLVANIA</option><option value="40">PUERTO RICO</option><option value="41">RHODE ISLAND</option><option value="42">SOUTH CAROLINA</option><option value="43">SOUTH DAKOTA</option><option value="44">TENNESSEE</option><option value="45">TEXAS</option><option value="46">UTAH</option><option value="47">VERMONT</option><option value="48">VIRGINIA</option><option value="49">WASHINGTON</option><option value="50">WEST VIRGINIA</option><option value="51">WISCONSIN</option><option value="52">WYOMING</option></select>

    
// function getMessage(userRef, count) {
//   if(!count){ // no value stored for this user
//     count=1;
//     datastore.set(userRef, count).then(function() { // store initial count value for user
//       console.log("Saved initial count ("+count+") for: " + userRef);
//     });
//   } else { // there was a value stored
//     count++;
//     datastore.set(userRef, count).then(function() { // store updated count value for user
//       console.log("Saved updated count ("+count+") for: " + userRef);
//     });
//   }
//   return Object.assign({ channel: userRef, text: "Current count is: " + count });
// }



    
// incoming http requests
slack.listen('3000');