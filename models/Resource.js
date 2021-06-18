const mongoose = require('mongoose')

const schema = new mongoose.Schema({

    path: {
        type: 'string',
        required: true
    },
    
    owner: {
        type: 'string',
        required: true
    },

    data: {
        type: Buffer,
        required: false
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

module.exports = mongoose.model('Resource', schema, 'resource')