const config = require("../config")
let User = require("../models/User")



let getList = (req, res) => {
    User.find()
        .then(result => {
            // todo: add support for filtering users
            res.send(result)
        })
        .catch(err => {
            console.log("Error while getting list of users", err)
            res.status(503).send(err)
        })
}

let setAdminGrant = (req, res) => {
    params = req.body;
    User.update({ email: params.email }, { isAdmin: params.value })
        .then(user => res.send(user))
}




const router = require('express').Router()

router.get("/users/list", getList)
router.post("/admin/set", setAdminGrant)

// 'get /api/users/list': 'UserController.getList',
// 'post /api/admin/set': 'UserController.setAdminGrant',

module.exports = router;