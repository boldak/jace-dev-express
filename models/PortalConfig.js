const mongoose = require('mongoose')

const schema = new mongoose.Schema({

   value:{
      type: Object
   },

    createdAt: {
        type: Date,
        default: Date.now,
      }

})

schema.plugin(require('mongoose-findorcreate'))


module.exports = mongoose.model('PortalConfig', schema, 'portalconfig')
