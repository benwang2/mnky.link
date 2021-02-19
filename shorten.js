var __AUTH_DOMAIN = "mnky-link"
var __DB_URL = "mnky-link-default-rtdb"

var axios = require('axios')
var firebase = require("firebase")
var config = {
    apiKey: "apiKey",
    authDomain: __AUTH_DOMAIN+".firebaseapp.com",
    databaseURL: "https://"+__DB_URL+".firebaseio.com",
    storageBucket: "bucket.appspot.com"
};

firebase.initializeApp(config);

var database = firebase.database();

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
let characters = "🙊,🙉,🙈,🐒,🐵,🍌​​".split(",")

async function isValidUrl(url){
    if (url.trim()=="") return false;
    if (!url.match(urlRegEx)) return false;

    let test1, test2;
    if (url.substring(0,6)!="https:" && url.substring(0,5)!="http:") {
        test1 = "https://" + url;
        test2 = "http://" + url;
    }
    
    let res1 = await axios.get(test1)
    let res2 = await axios.get(test2)

    console.log((res1 != null ? res1 : (res2 != null ? res2 : false)))
    return (res1 != null ? res1 : (res2 != null ? res2 : false));
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
    let response = await isValidUrl (url);
    if (response != null){
        let uid = await genUID();
        if (uid){
            database.ref().child("monkeys").update({[uid]:response})
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