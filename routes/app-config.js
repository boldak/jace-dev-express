const path = require("path")
const fs = require('fs').promises

const router = require('express').Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const { cloneDeep, extend } = require("lodash")

const config = require("../config")
let AppConfig = require("../models/AppConfig")

let getList = (req, res) => {
    AppConfig
        .find()
        .sort('name')
        .populate('owner')
        .then(apps => {
            res.send(apps.map(function(app) {
                return {
                    id: app.id,
                    name: app.name,
                    description: app.description,
                    title: app.title,
                    dps: app.dps,
                    keywords: app.keywords,
                    collaborations: app.collaborations,
                    i18n: app.i18n,
                    icon: app.icon,
                    createdAt: app.createdAt,
                    updatedAt: app.updatedAt,
                    owner: app.owner && {
                        id: app.owner.id,
                        name: app.owner.name,
                        email: app.owner.email,
                        photo: app.owner.photo
                    },
                    importedFromURL: app.importedFromURL,
                    importedFromAuthor: app.importedFromAuthor
                }
            }));
        }).catch( err => {
            res.status(503).send(err)
        });
}

let createWithConfig = (req, res) => {
	if (!req.body.config) {
        console.log('App config not specified for new app in AppController.createWithConfig');
        res.status(503);
    }

    var newApp = extend({},config.portal.appTemplate)
    newApp.owner = req.user.id
    newApp.isPublished = true
    delete newApp.id;

   
    var newAppConfig = cloneDeep(req.body.config);

    newApp = extend({}, newApp, newAppConfig)

    if ( newApp.appWidgets ) newApp.appWidgets = newApp.appWidgets.map( w => JSON.stringify(w))
	if ( newApp.pages ) newApp.pages = newApp.pages.map( p => JSON.stringify(p))


	

    AppConfig.create(newApp)
        .then(created => {
            res.send({
                id: created.id
            });
        }).catch(err => {
            console.log('Error while creating app: ' + err)
            res.status(503).send(err)
        })
}

// let createCloneDefault = (req, res) => {

//     var newApp = cloneDeep(config.portal.appTemplate)

//     delete newApp.id
//     newApp.isPublished = true;
//     newApp.name = req.params.appName
//     newApp.owner = req.user.id
//     newApp.icon = "/img/default/" + Math.round(20 * Math.random()) + ".png";

//     if (req.param('skinName')) {
//         newApp.skinName = req.param('skinName')
//     }

//     console.log(newApp)

//     AppConfig.create(newApp)
//         .then(created => {
//             res.send({
//                 id: created.id
//             });
//         }).catch(err => {
//             console.log('Error while creating app: ' + err)
//             res.status(503).send(err)
//         });
// }

let getDefaultConfig = (req, res) => {
    res.send(config.portal.appTemplate)
}

let update = (req, res) => {
	
	// console.log(req.body)
	
	let updatedApp = req.body

	if ( updatedApp.appWidgets ) updatedApp.appWidgets = updatedApp.appWidgets.map( w => JSON.stringify(w))
	if ( updatedApp.pages ) updatedApp.pages = updatedApp.pages.map( p => JSON.stringify(p))

    updatedApp.updatedAt = new Date()    
        
	// console.log(updatedApp)	
    
    AppConfig.updateOne({ _id: updatedApp.id}, updatedApp)
        .then(updatedArr => {
            if (updatedArr.length === 0) {
                res.sendStatus(403);
            } else {
                res.status(200).send(updatedArr);
            }
        })
        .catch(err => {
            console.log('AppController.update error: ' + err)
            res.status(503).send(err)
        })
}

let exportApp = (req, res) => {
    AppConfig.findOne({_id:req.params.appId})
        // .populate('owner')
        .then(app => {
            res.setHeader('Content-disposition', 'attachment; filename=' + app.name + '.json')
            AppConfig.destringifyConfigs(app)

            // app.importedFromURL = sails.getBaseurl() + '/app/' + app.name
            // app.importedFromAuthor = app.owner && app.owner.name

            delete app.id // New id will be re-assigned when the app is exported
            delete app.owner // The owner will change if another person exports this app
            delete app.collaborations // We can't re-use this field because collaborator IDs aren't same in other DBs
            delete app.createdAt
            delete app.updatedAt

            console.log(app)

            res.send(app)
        }).catch(err => {
            console.log(err)
            res.status(404).send(err)
        });
}

let importApp = (req, res) => {

    var appName = req.body.name


    let $file = null
    if (req.files && req.files.file) {

        let fileContent = require("fs").readFileSync(req.files.file.tempFilePath)

        $file = {
            name: req.files.file.name,
            binary: fileContent,
            text: fileContent.toString()
        }

        
        try {
            var app = JSON.parse($file.text)
            app.name = appName
            app.owner = req.user.id
            delete app._id
        
            if ( app.appWidgets ) app.appWidgets = app.appWidgets.map( w => JSON.stringify(w))
            if ( app.pages ) app.pages = app.pages.map( p => JSON.stringify(p))


            AppConfig.create(app)
                .then(created => {
                    res.send({
                        name: app.name,
                        id: created.id
                    });
                }).catch(err => {
                    console.log('AppController.import error: ' + err)
                    res.status(503).send(err);
                });
        } catch (e) {
            res.send(415, e.message)
        }
    } else {
        res.send(415, e.message)
    }
}


let destroy = (req, res) => {
    AppConfig.deleteOne({
            _id: req.params.appId
        })
        .then(updatedArr => {
            if (updatedArr.length === 0) {
                res.sendStatus(403);
            } else {
                res.status(200).send(updatedArr)
            }
        }).catch(err => {
            console.log('Error while deleting app: ' + err)
            res.status(503).send(err);
        })
}


router.get("/get-list", getList)
router.get("/get-default-config", getDefaultConfig)
router.post("/create", createWithConfig)
router.put("/config/:appId", update)
router.get("/export/:appId", exportApp)
router.post("/import", importApp)
// router.get("/rename/:appId/:newAppName", rename)
router.get("/destroy/:appId", destroy)



// 'get /api/app/get-list': 'AppController.getList',
//   'get /api/app/get-default-config': 'AppController.getDefaultConfig',
//   'post /api/app/create/': 'AppController.createWithConfig',
//   'put /api/app/config/:appId': 'AppController.update',
//   'get /api/app/export/:appId': 'AppController.export',
//   'post /api/app/import': 'AppController.import',
//   'get /api/app/rename/:appId/:newAppName': 'AppController.rename',
//   'get /api/app/destroy/:appId': 'AppController.destroy',

module.exports = router;