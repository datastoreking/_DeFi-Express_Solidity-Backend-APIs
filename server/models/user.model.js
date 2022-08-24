const jsql = require("./db.js");
const dateFormat = require('date-and-time');
var fs = require('fs');
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.TEST_PROVIDER));

exports.login = (wallet_address, result) => {
	jsql.clear();
	console.log("wallet_address", wallet_address);
	jsql.s().t('users').w({user_address: wallet_address}).run((err, res, fields) => {
        if (err)result(err, null);
        if (res.length==0){
            jsql.i({user_address: wallet_address, created: new Date()}).t('users').run((err, res, fields) => {
                if (err)result(err, null);
                else {
                    result(null, {id: res.insertId, user_address: wallet_address, current_bird: 0, used_bird: 0, score: 0, created: new Date(), total_birds: 0 });
                }    
            })
        }else {
            result(null, {...res[0], total_birds: res[0].current_bird + res[0].used_bird});
        }
    });
};

exports.getUserInfo = (wallet_address, result) => {
	console.log("wallet_address", wallet_address);
    jsql.clear();
	jsql.s().t('users').w({user_address: wallet_address}).run(async (err, res, fields) => {
        if (err)result(err, null);
        if (res.length==0)result(null, {message: "User doens't exist!", value: 0});
        else {
            var nft_address = process.env.NFT_CONTRACT_ADDRESS;
            var jsonFile = "./server/abis/"+nft_address+".json";
            var parsed= JSON.parse(fs.readFileSync(jsonFile));
            var nft_abi = parsed.abi;
            var nft_router = new web3.eth.Contract(nft_abi, web3.utils.toChecksumAddress(nft_address));
            var nft_amount = await nft_router.methods.balanceOf(wallet_address).call();
            jsql.clear();
            var id = res[0].id;
            var query = "update users set current_bird = " + nft_amount + " where id = "+ id;
            jsql.run(query,(e,res1,f)=>{
                if(e)result(e, null);
                else {
                    result(null, {id: res[0].id, current_bird: nft_amount, used_bird: res[0].used_bird, total_birds: res[0].current_bird + res[0].used_bird, score: res[0].score})
                }
            });
        }
    });
};