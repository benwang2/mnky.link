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
            return snapshot.exists() ? snapshot.val() : false;
        } catch (e) {
            console.error(e);
        }
    })
}

let urlRegEx = new RegExp(/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi);
let characters = "🙊,🙉,🙈,🐒,🐵,🍌,💩​​".split(",")

async function getValidUrl(url){
    if (url.trim()=="") return false;
    if (!url.match(urlRegEx)) return false;
    try {
        if (url.substring(0,6)!="https:" && url.substring(0,5)!="http:") {
            let [test1, test2, validUrl] = ["https://" + url, "http://" + url, false];
            let [res1, res2]  = [await axios.get(test1), await axios.get(test2)]
            validUrl = (res1 != null ? test1 : (res2 != null ? test2 : false));
        } else {
            let res1 = await axios.get(url)
            validUrl = (res1 != null ? url : false)
        }
    } catch (e) {

        validUrl = e.request.finished ? e.request._redirectable._currentUrl : false
    }
    return validUrl
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
