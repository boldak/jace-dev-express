const path = require("path")
const fs = require('fs').promises

const router = require('express').Router()
const unless = require('express-unless')
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const { zipObject, extend, isUndefined, clone } = require("lodash")

const config = require("../config")
let AppConfig = require("../models/AppConfig")
let PortalConfig = require("../models/PortalConfig")



// const handler = async (req, res, next) => {
//     let portal
    
//     let data = await fs.readFile(path.resolve(config.portal.indexPath)) 

//     let page = data.toString()
//     let defaultApp

//     let cookie = (req.headers.cookie) 
//         ? zipObject(
//             req.headers.cookie.split(";").map(d => {
//                 let r = d.split("=")
//                 return [r[0].trim(), r[1]]
//             })
//         ) 
//         : {}

//     let config = await PortalConfig.find({})
//     portal = {
//         config: config[0].value
//     }
//     defaultApp = config[0].value.defaultApp
    
//     let app = await AppConfig
//         .findOne({name: req.params.appName || defaultApp})
//         .populate('owner') 


//     if(!app){
//         res.sendStatus(404)
//         return
//     }

//     AppConfig.destringifyConfigs(app)

//     let userInfo = extend(
//         (req.user) 
//             ?   {
//                   _id: req.user._id,                                                                                                         
//                   email: req.user.email,                                                                                                      
//                   name: req.user.name,                                                                                                                 
//                   photo: req.user.photo,                                     
//                   createdAt: req.user.createdAt,                                                                                                   
//                   updatedAt: req.user.updatedAt,                                                                                                   
//                   isAdmin: req.user.isAdmin  
//                 }
//             :   {},
//             {
//                 isLoggedIn: !isUndefined(req.user),
//                 isOwner: AppConfig.isOwner(app, req.user),
//                 isCollaborator: AppConfig.isCollaborator(app, req.user)
//             }
//     )

//     app.defaultApp = defaultApp;
    
//     let config = {
//         app: app,
//         appMode: cookie[`${app.id}-mode`],
//         userInfo: userInfo,
//         ownerInfo: !app.owner ? {
//             exists: false
//         } : {
//             id: app.owner.id,
//             name: app.owner.name,
//             email: app.owner.email,
//             photo: app.owner.photo,
//             exists: true
//         },
//         publicAppConfig: {
//             id: app.id,

//             instance: `${app.name}_${Math.random().toString(36).substring(2)}`,
//             name: app.name,
//             devService: portal,

//             user: userInfo,

//             author: !app.owner ? {
//                 exists: false
//             } : {
//                 id: app.owner.id,
//                 name: app.owner.name,
//                 email: app.owner.email,
//                 photo: app.owner.photo,
//                 exists: true
//             },
//             collaborations: app.collaborations || [],

//             skin: app.skin || {
//                 holders: {
//                     AppHeader: { widgets: [] },
//                     AppFooter: { widgets: [] }
//                 }
//             },

//             pages: app.pages || [],
//             clientOptions: app.clientOptions || null,
//             theme: app.theme,
//             icon: app.icon,
//             i18n: app.i18n,
//             title: app.title,
//             description: app.description,
//             keywords: app.keywords,
//             dpsURL: app.dpsURL || "",
//             isPublished: app.isPublished
//         }
//     }


//     let script = `
//           var devService =  ${JSON.stringify(config.publicAppConfig.devService)}
//           var user = ${JSON.stringify(config.userInfo)};
//           var author = ${JSON.stringify(config.ownerInfo)};
//           var appName = "${config.app.name}";
//           var initialConfig = JSON.parse(decodeURIComponent("${encodeURIComponent(JSON.stringify(config.publicAppConfig))}"));
//           var dpsURL = initialConfig.dpsURL;
//           var __application_Config_Key =  "${config.publicAppConfig.id}-application-config";
//           var __application_Mode_Key =  "${config.publicAppConfig.id}-mode";
//           sessionStorage.setItem(__application_Config_Key, JSON.stringify(initialConfig))

//     `


//     res.send(
//         page
//         .replace("//author", config.ownerInfo.name)
//         .replace("//description", config.app.description)
//         .replace("//__appconfig", script)
//         .replace("//appTitle", config.app.title)
//     )

// }  


let requestHandler = (req, res, next) => {
	
    let indexFile = path.resolve(config.portal.indexPath)
    let portal

    fs.readFile(indexFile)
        .then(data => {
            let page = data.toString()
            let defaultApp

            let cookie = (req.headers.cookie) ?
                zipObject(
                    req.headers.cookie.split(";").map(d => {
                        let r = d.split("=")
                        return [r[0].trim(), r[1]]
                    })
                ) : {}
            PortalConfig
                .find({})
                .then(config => {
                    portal = {
                        config: config[0].value
                    }
                    defaultApp = config[0].value.defaultApp
                    return defaultApp
                })
                .then(defaultApp => {
                    return AppConfig
                        .findOne({name: req.params.appName || defaultApp})
                        .populate('owner') //
                })
                .then(app => {

                    if(!app){
                        res.sendStatus(404)
                        return
                    }

                    AppConfig.destringifyConfigs(app)


                    let userInfo = 
                    extend(
                        (req.user) 
                            ?   {
                                  _id: req.user._id,                                                                                                         
                                  email: req.user.email,                                                                                                      
                                  name: req.user.name,                                                                                                                 
                                  photo: req.user.photo,                                     
                                  createdAt: req.user.createdAt,                                                                                                   
                                  updatedAt: req.user.updatedAt,                                                                                                   
                                  isAdmin: req.user.isAdmin  
                                }
                            :   {},
                        {
                            isLoggedIn: !isUndefined(req.user),
                            isOwner: AppConfig.isOwner(app, req.user),
                            isCollaborator: AppConfig.isCollaborator(app, req.user)
                        }
                    )

                    app.defaultApp = defaultApp;

                    // let requireWidgets = [];

                    // if (app.pages) {
                    //     app.pages.forEach(p => {
                    //         let ht = []
                    //         _.values(p.holders).forEach(h => {
                    //             ht = ht.concat(h.widgets.map(w => w.type))
                    //         })
                    //         requireWidgets = requireWidgets.concat(ht)
                    //     })
                    // }




                    // if (app.skin) {
                    //     values(app.skin.holders).forEach(h => {
                    //         requireWidgets = requireWidgets.concat(h.widgets.map(w => w.type))
                    //     })
                    // }

                    // destringifyConfigs = unique(requireWidgets)

                    let config = {
                        app: app,


                        appMode: cookie[`${app.id}-mode`],
                        // require_Mermaid: _.findIndex(requireWidgets, w => w.startsWith("flowchart-")) > -1,
                        // require_Echarts: _.findIndex(requireWidgets,
                        //     w =>
                        //     /\-chart\-/gi.test(w) ||
                        //     w.startsWith("ds-") ||
                        //     w.startsWith("tree-") ||
                        //     w.startsWith("form-") ||
                        //     w.startsWith("question-")
                        // ) > -1,
                        // require_Ace: _.findIndex(requireWidgets, w => w == "ds-explorer-widget") > -1,
                        userInfo: userInfo,
                        ownerInfo: !app.owner ? {
                            exists: false
                        } : {
                            id: app.owner.id,
                            name: app.owner.name,
                            email: app.owner.email,
                            photo: app.owner.photo,
                            exists: true
                        },
                        publicAppConfig: {
                            id: app.id,

                            instance: `${app.name}_${Math.random().toString(36).substring(2)}`,
                            name: app.name,
                            devService: portal,

                            user: userInfo,

                            author: !app.owner ? {
                                exists: false
                            } : {
                                id: app.owner.id,
                                name: app.owner.name,
                                email: app.owner.email,
                                photo: app.owner.photo,
                                exists: true
                            },
                            collaborations: app.collaborations || [],

                            skin: app.skin || {
                                holders: {
                                    AppHeader: { widgets: [] },
                                    AppFooter: { widgets: [] }
                                }
                            },

                            pages: app.pages || [],
                            clientOptions: app.clientOptions || null,
                            theme: app.theme,
                            icon: app.icon,
                            i18n: app.i18n,
                            title: app.title,
                            description: app.description,
                            keywords: app.keywords,
                            dpsURL: app.dpsURL || "",
                            isPublished: app.isPublished
                        }
                    }


                    let script = `
		       			  var devService = 	${JSON.stringify(config.publicAppConfig.devService)}
		       		   	  var user = ${JSON.stringify(config.userInfo)};
					      var author = ${JSON.stringify(config.ownerInfo)};
					      var appName = "${config.app.name}";
					      var initialConfig = JSON.parse(decodeURIComponent("${encodeURIComponent(JSON.stringify(config.publicAppConfig))}"));
					      var dpsURL = initialConfig.dpsURL;
					      var __application_Config_Key =  "${config.publicAppConfig.id}-application-config";
						  var __application_Mode_Key =  "${config.publicAppConfig.id}-mode";
						  sessionStorage.setItem(__application_Config_Key, JSON.stringify(initialConfig))

		       `


                    res.send(
                        page
                        .replace("//author", config.ownerInfo.name)
                        .replace("//description", config.app.description)
                        .replace("//__appconfig", script)
                        .replace("//appTitle", config.app.title)
                    )

                })
                .catch(function(err) {
                    console.log("ERROR", err)
                    res.sendStatus(404)
                })
        })

}


router.get("/:appName", requestHandler)
router.get("/", requestHandler)
router.unless = unless 


module.exports = router;