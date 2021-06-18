const config = require("./config")

console.log("** Initialize service")

require("./config/bootstrap")()
.then( app => {
	app.listen(config.portal.port,console.log(`** JACE Portal starts at port ${config.portal.port}`))
})	