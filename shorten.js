const Database = require("@replit/database")
const db = new Database()

var firebase = require("firebase")
var config = {
    apiKey: "apiKey",
    authDomain: process.env.__AUTH_DOMAIN+".firebaseapp.com",
    databaseURL: "https://"+process.env.__DB_URL+".firebaseio.com",
    storageBucket: "bucket.appspot.com"
};

firebase.initializeApp(config);

var database = firebase.database();
var axios = require('axios')

function exists(GUID){
    return database.ref().child("monkeys").child(GUID).get().then(function(snapshot){
        try {
            console.log(snapshot.exists(),snapshot.val())
            return snapshot.exists() ? snapshot.val() : false;
        } catch (e) {
            console.error(e);
        }
    })
}

/* 
  regex-weburl.js
  author: Diego Perini
  source: https://gist.github.com/dperini/729294
*/
let urlRegEx = new RegExp(/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i);
let characters = "🙊,🙉,🙈,🐒,🐵,🍌,💩,🍇,🍎,🍏,🥕,​​,🥥,🌴,🏝️,🌲".split(",")

async function getValidUrl(url){
    if (url.trim()=="") return false;
    if (!url.match(urlRegEx)) return false;
    return url
}

async function genUID(){
    let uid = "";
    for (x = 0; x < 100; x++){
        uid = ""
        for (let i = 0; i < 6; i++){
            uid += characters[Math.floor(Math.random()*characters.length)]
        }
        var result = await exists(uid);
        if (result == false) return uid;
    }
    return uid
}

async function generate(url){
    let response = await getValidUrl (url);
    console.log("url is: "+response)
    if (response != null && response != false){
        let uid = await genUID();
        if (uid){
            database.ref().child("monkeys").update({[uid]:response})
            db.get("linksGenerated").then(value => {
              db.set("linksGenerated", ++value);
              console.log("linksGenerated: "+(value))
            });
            return uid;
        } else {
            return 504
        }
    }
    return 400
}

module.exports = {
    generate: generate,
    exists: exists
}