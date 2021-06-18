const express = require('express')
const passport = require('passport')
const router = express.Router()


router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))


router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        if (req.cookies && req.cookies.redirectToUrl) {

            var redirectUrl = req.cookies.redirectToUrl;
            res.clearCookie('redirectToUrl');
            res.redirect(redirectUrl);
        } else {
            res.redirect('/');
        }

    }
)

router.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
})

module.exports = router