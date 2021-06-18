const mongoose = require('mongoose')
const { extend, find, isUndefined } = require("lodash")


const schema = new mongoose.Schema({

   name: {
      type: 'string',
      required: true,
      unique: true,
      notEmpty: true
    },

    skinName: {
      type: 'string',
    },

    appWidgets: {
      type: 'array'
    },

    pages: {
      type: 'array',
      required: true
    },

    skin:{
          type: Object
    },
    
    theme:{
          type: Object
    },

    clientOptions:{
      type: Object
    },

    icon: {
      type: 'string'
    },
    i18n: {
      type: Object
    },

    title: {
      type: 'string',
      required: true
    },

    description: {
      type: 'string'
    },
    keywords: {
      type: 'array'
    },
    dps: {
      type: 'string'
    },
    dpsURL: {
      type: 'string'
    },
    collaborations: {
      type: 'array'
    },

    importedFromURL: {
      type: 'string'
    },

    importedFromAuthor: {
      type: 'string'
    },

    isPublished: {
      type: 'boolean',
      required: true
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },  
    
    createdAt: {
        type: Date,
        default: Date.now,
      },

    updatedAt: {
        type: Date,
        default: Date.now,
      }  
})

schema.plugin(require('mongoose-findorcreate'))

module.exports = extend( mongoose.model('AppConfig', schema, 'appconfig'), {
  
  destringifyConfigs: app => {
    if(!app) return
    if (app.appWidgets) {
      for (var i = 0; i < app.appWidgets.length; ++i) {
        app.appWidgets[i] = JSON.parse(app.appWidgets[i]);
      }
    }

    if (app.pages) {
      for (var i = 0; i < app.pages.length; ++i) {
        app.pages[i] = JSON.parse(app.pages[i]);
      }
    }

  },

  isCollaborator: (app, user) => {
    if (!user || !app.collaborations) {
      // user is not logged in - therefore not a collaborator
      return false;
    }
    
    return !isUndefined( find(app.collaborations, c => c.id === user.id))
    
  },

  isOwner: (app, user) => (user && user.isAdmin) || (app.owner && user && app.owner.id === user.id)
  
})

