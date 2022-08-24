const user_model = require("./models/user.model");

exports.login = (req, res) => {
    // console.log(req.headers['x-forwarded-for'] || req.socket.remoteAddress );
    console.log("login")
    user_model.login(req.body.wallet_address, (err, data) => {
      if (err)
            res.status(200).send({
              message:
                err.message || "An error occurred during login user."
            });
          else res.status(200).send(data);
    });
};

exports.getUserInfo = (req, res) => {
    console.log("get User information")
	user_model.getUserInfo(req.params.wallet_address, (err, data) => {
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
