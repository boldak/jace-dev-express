const config = require("../config")
let PortalConfig = require("../models/PortalConfig")



let getConfig = (req, res) => {
    PortalConfig.find({})
        .then(function(config) {
            return res.send(config[0].value)
        })
        .catch(err => {
            console.log('Portal config not available ' + err);
            res.status(503).send(err)
        })

}

let setConfig = (req, res) => {
    var config = req.body.config;
    PortalConfig.updateOne({}, { value: config })
        .then(updatedConfig => {
            return res.send(updatedConfig)
        })
        .catch(err => {
            console.log('Portal config update faillure ' + err);
            res.status(503).send(err)
        })
}




const router = require('express').Router()

router.get("/get", getConfig)
router.post("/get", getConfig)
router.post("/set", setConfig)


// 'get /api/app/config/get': 'PortalConfigController.getConfig',
//    'get /api/app/skins': 'PortalConfigController.getSkins',
//    'post /api/app/config/get': 'PortalConfigController.getConfig',
//    'post /api/app/config/set': 'PortalConfigController.setConfig',

module.exports = router;