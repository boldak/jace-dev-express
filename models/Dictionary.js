const mongoose = require('mongoose')

const schema = new mongoose.Schema({

   key: {
      type: 'string',
      required: true,
      unique: true
    },
    
    value: {
      type: Object,
      required: false
    },

    createdAt: {
        type: Date,
        default: Date.now,
      }

})

module.exports = mongoose.model('Dictionary', schema, 'dictionary')
