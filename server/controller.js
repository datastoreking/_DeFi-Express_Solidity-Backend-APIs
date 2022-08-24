const api_model = require("./models/api.model");

exports.recipt = (req, res) => {
    console.log("recipt")
    api_model.recipt(req.body.wallet_address, (err, data) => {
		if (err) {
      if(err.kind == 'not_found') {
        res.status(200).send({
          message:
            err.message || "Not Found."
          });
      }else {
        res.status(500).send({
        message:
          err.message || "An error occurred during get user info."
        });
      }
    }
		else res.status(200).send(data);
	});
};

exports.gameover = (req, res) => {
  console.log("game over");
  api_model.gameover(req.body, (err, data) => {
    if (err)
		  res.status(500).send({
			message:
			  err.message || "An error occurred during update score"
		  });
		else res.status(200).send(data);
  });
};

exports.getLeaderBoard = (req, res) => {
  console.log("getLeaderBoard");
  api_model.getLeaderBoard((err, data) => {
    if (err)
		  res.status(500).send({
			message:
			  err.message || "An error occurred during get LeaderBoard."
		  });
		else res.status(200).send(data);
  });
};

exports.mint = (req, res) => {
  console.log("mint");
  api_model.mint(req.body, (err, data) => {
    if (err)
		  res.status(500).send({
			message:
			  err.message || "An error occurred during minting"
		  });
		else res.status(200).send(data);
  });
};

// exports.play = (req, res) => {
//   console.log("play");
//   api_model.play(req.body, (err, data) => {
//     if (err)
// 		  res.status(500).send({
// 			message:
// 			  err.message || "An error occurred during playing"
// 		  });
// 		else res.status(200).send(data);
//   });
// };