module.exports = {
  ensureAuth: function (req, res, next) {
    // console.log("ensureAuth", req.isAuthenticated(), req.user)
    return next()
    // if (req.isAuthenticated()) {
    //   return next()
    // } else {
    //   res.redirect('/')
    // }
  },
  ensureGuest: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    } else {
      res.redirect('/log');
    }
  },
}
