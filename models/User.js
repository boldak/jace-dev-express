const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({

    email: { type: 'string',  unique: true, required: true },
    name: {type: 'string', required: true},
    photo: {type: 'string', url: true, required: true},
    isAdmin: {type: 'boolean', defautt:false},
    createdAt: {
        type: Date,
        default: Date.now,
      }
})

module.exports = mongoose.model('User', UserSchema, 'user')
