const express = require('express');//Set up the express module
const path = require('path');
const app = express();
const router = express.Router();
var shorten = require("./shorten.js")

const rateLimit = require("express-rate-limit");

app.use("/shorten", rateLimit({windowMs: 5 * 1000,max: 10}));

app.use(express.json({limit:'1mb'}))
app.post("/shorten", async (request, response) => {
    try {
        let monkeys = await shorten.generate(request.body.url);
        if (monkeys != 504 && monkeys != 400){
            response.json({
                status:200,
                uid: monkeys
            })
        } else {
            response.status(monkeys).send("URL invalid.")
        }
    } catch (e) {
        response.status(500).send("Internal Server Error.")
    }
})

router.get('/', function(req, res){
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.use(express.static(__dirname));
app.use("/", router)

app.get("/:monkeys", async (request, response) => {
    try {
        let monkeys = request.params.monkeys;
        let destination = await shorten.exists(monkeys)
        if (destination){
            if (!/^https?:\/\//i.test(destination)) {
                destination = "https://" + destination;
            }
            response.redirect(destination)
        } else {response.redirect("/")}
    } catch (e) {
        console.log(e)
    }
})

let server = app.listen(3000, function(){
    console.log("App server is running on port 3000");
    console.log("to end press Ctrl + C");
});