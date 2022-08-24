var express = require('express');
var router = express.Router();
const controllers = require("../controller.js");

router.post("/recipt", controllers.recipt);
router.post("/gameover", controllers.gameover);
router.get("/getLeaderBoard", controllers.getLeaderBoard);
router.post("/mint", controllers.mint);
// router.post("/play", controllers.play);
module.exports = router;