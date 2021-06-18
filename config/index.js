// import all the things we need  
const { extend } = require("lodash")

module.exports = extend(
  {},
  require("./passport"),
  require("./portal"),

)
