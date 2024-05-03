let API = require("./src/controller");
let Appender = require("./src/appender-controller");

module.exports = {...API, ...Appender};