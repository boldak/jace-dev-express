const express = require('express');
const bodyParser = require('body-parser');
const CORS = require("cors")
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload');
const mongoose = require('mongoose');
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const { extend } = require("lodash")

const config = require("./index")
const STATIC_FILE_PATTERN = /\.[^.\/]*$/g


const AppConfig = require("../models/AppConfig")
const PortalConfig = require("../models/PortalConfig")
const User = require("../models/User")


let addDefaultAppConfigs = ()  => {

  let apps = config.portal.applications.map( app => require(app))
  return Promise.all( apps.map( app => {
    if ( app.appWidgets ) app.appWidgets = app.appWidgets.map( w => JSON.stringify(w))
    if ( app.pages ) app.pages = app.pages.map( p => JSON.stringify(p))
    return AppConfig.findOrCreate({name: app.name}, app)
            .then( () => {
              console.log(`** Install app "${app.name}"`)
              return true
            })
            .catch( err => {
              console.log(`Cannot install app "${app.name}": ${err.toString()}`)
            })  
  }))

}

let addDefaultPortalConfigs = ()  => PortalConfig.findOne({})
  .then( config => {
    let data = extend(
      {},
      (config) ? config.value : {}, 
      {
        defaultApp:config.value.defaultApp || "JACE", 
        pubService:"http://localhost:8081"
      }
    )
    return data
  })
  .then( config => PortalConfig.findOrCreate({}, {value:config})
      .then( () => {
        console.log(`** Update portal config: ${JSON.stringify(config,null," ")}`)
        return true
      })
  )
  .catch( err => {
    console.log(`Cannot update portal config: ${err.toString()}`)
  })

let checkDefaultAdmins = () => Promise.all( config.portal.administrators.map( admin => new Promise((resolve, reject) => {
    
    User.findOne({email: admin})
    .then( user => {
      if(!user) {
        resolve(true)
        return
      }

      if( user.isAdmin) {
        console.log(`** Check adminstrator privilegues for ${admin}`)
        resolve(true)
      } else {
        User.update({email: admin}, {isAdmin: true})
        .then( () => {
            console.log("** Update administrator privilegues for " + admin)
            resolve(true)
        });    
      }
    })
    .catch( err => {
      console.log(`Cannot check administrator privilegues: ${err.toString()}`)
      reject(err)
    })
})))  


let configureServer = () => {
  console.log("** Starts portal configuration")
  return checkDefaultAdmins()
    .then( () => addDefaultAppConfigs())
    .then( () => addDefaultPortalConfigs())
}




module.exports = () => {
    var app = express();


    mongoose.connect(config.portal.db.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })

    // Passport config
    config.passport(passport)



    // Middleware
    app.use(express.urlencoded({ extended: true }))

    app.use(cookieParser())

    // app.set('view engine', 'ejs');

    app.use(
        session({
            secret: 'keyboard cat',
            resave: false,
            saveUninitialized: false,
            store: new MongoStore({ mongooseConnection: mongoose.connection }),
        })
    )

    // Passport middleware
    app.use(passport.initialize())
    app.use(passport.session())

    app.use(CORS())

    app.use(fileUpload({
        useTempFiles: true,
        tempFileDir: config.portal.uploadPath,
        limits: {
            fileSize: 1024 * 1024 * 1024
        }
    }));

    app.use(bodyParser.text());
    app.use(bodyParser.urlencoded({
        parameterLimit: 100000,
        limit: '50mb',
        extended: true
    }));

    app.use(bodyParser.json({
        limit: '50mb'
    }));


    // the sequence of middlware is important


    app.use(require('../routes/design').unless({
        path: [
            { method: "GET", url: STATIC_FILE_PATTERN },
            { method: "GET", url: "/auth/*" },
            { method: ["GET", "POST", "PUT"], url: "/api/*" },
            { method: ["GET", "POST", "PUT"], url: "/undefined" },

        ]
    }))

    app.use('/auth', require('../routes/auth'))
    app.use('/design', require('../routes/design'))

    app.use("/api/resource", require("../routes/resource"))
    app.use("/api/app/config", require("../routes/portal-config"))
    app.use("/api/app", require("../routes/app-config"))
    app.use("/api", require("../routes/user"))


    app.use(express.static(config.portal.staticPath))

    return configureServer()
      .then(() => app)
}