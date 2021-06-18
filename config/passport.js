// import all the things we need  
const GoogleStrategy = require('passport-google-oauth20').Strategy
const mongoose = require('mongoose')
const config = require("./portal")
const User = require('../models/User')

module.exports = {
    passport: passport => {
        passport.use(
            new GoogleStrategy({
                    clientID: config.portal.auth.clientId,
                    clientSecret: config.portal.auth.clientSecret,
                    callbackURL: config.portal.auth.callback,
                },
                async (accessToken, refreshToken, profile, done) => {
                    //get the user data from google 
                    const newUser = {
                        name: profile.displayName,
                        photo: profile.photos[0].value,
                        email: profile.emails[0].value
                    }

                    try {
                        //find the user in our database 
                        let user = await User.findOne({ email: newUser.email })

                        if (user) {
                            //If user present in our database.
                            done(null, user)
                        } else {
                            // if user is not preset in our database save user data to database.
                            newUser.isAdmin = config.portal.administrators.includes(newUser.email)
                            user = await User.create(newUser)
                            done(null, user)
                        }
                    } catch (err) {
                        console.error(err)
                    }
                }
            )
        )

        // used to serialize the user for the session
        passport.serializeUser((user, done) => {
            done(null, user.id)
        })

        // used to deserialize the user
        passport.deserializeUser((id, done) => {
            User.findById(id, (err, user) => done(err, user))
        })
    }
}