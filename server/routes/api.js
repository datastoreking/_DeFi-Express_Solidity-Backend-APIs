var express = require('express');
var router = express.Router();
const controllers = require("../controller.js");

router.get("/getUserInfo/:wallet_address", controllers.getUserInfo);
// router.get("/getGameList", controllers.getGameList);
// router.get("/getGameList/:type", controllers.getGameLists);
// router.get("/getGameTypes", controllers.getGameTypes);
module.exports = router;