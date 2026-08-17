var fs = require("fs");
require("dotenv").config({ path: `.env.${process.env.NODE_ENV || "development"}` });

const { NODE_ENV } = process.env
var credentials = {};

try {
    if (NODE_ENV === "customdev") {
        let key = fs.readFileSync("/etc/apache2/ssl/onlinetestingserver.key", "utf8");
        let cert = fs.readFileSync("/etc/apache2/ssl/onlinetestingserver.crt", "utf8");
        let ca = fs.readFileSync("/etc/apache2/ssl/onlinetestingserver.ca");
        credentials = { key, cert, ca };
    } else if (NODE_ENV.includes("live_test")) {
        // let combinedFile = fs.readFileSync("/var/cpanel/ssl/apache_tls/realmoneydragon.io/combined", "utf8")
        // let [key, cert, ca] = combinedFile.split(/\n(?=-----BEGIN)/);
        // credentials = { key, cert, ca };
    }
} catch (error) {
    console.log("Error reading SSL files: ", error);
}

module.exports = credentials;

//ssl.js is to make website safer. it adds s to http making it https and does encryption-  meaning all data that passes from server to browser and vice versa is encrypted. 
//This is however conditional on environments. We want this encyrption when we've made it live for the user but not during development. 