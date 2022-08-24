const jsql = require("./db.js");
const dateFormat = require('date-and-time');
var fs = require('fs');
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.TEST_PROVIDER));

exports.recipt = async (wallet_address, result) => {
	console.log("wallet_address", wallet_address);
    var nft_trial_address = process.env.NFT_CONTRACT_ADDRESS_TRIAL;
    var jsonFile_trial = "./server/abis/"+nft_trial_address+".json";
    var parsed_trial= JSON.parse(fs.readFileSync(jsonFile_trial));
    var nft_trial_abi = parsed_trial.abi;
    var nft__trial_router = new web3.eth.Contract(nft_trial_abi, web3.utils.toChecksumAddress(nft_trial_address));
    var nft_trial_amount = await nft__trial_router.methods.balanceOf(wallet_address).call();

    var nft_main_address = process.env.NFT_CONTRACT_ADDRESS_MAIN;
    var jsonFile_main = "./server/abis/"+nft_main_address+".json";
    var parsed_main= JSON.parse(fs.readFileSync(jsonFile_main));
    var nft_main_abi = parsed_main.abi;
    var nft__main_router = new web3.eth.Contract(nft_main_abi, web3.utils.toChecksumAddress(nft_main_address));
    var nft_main_amount = await nft__main_router.methods._nftBalance(wallet_address).call();

    var nft_amount = Number(nft_trial_amount) + Number(nft_main_amount);

    jsql.clear();
	jsql.s().t('users').w({user_address: wallet_address}).run(async (err, res, fields) => {
        if (err)result(err, null);
        if (res.length==0){
            jsql.i({user_address: wallet_address, current_birds: nft_amount }).t('users').run((err, res1, fields) => {
                if (err)result(err, null);
                else {
                    result(null, {current_birds: nft_amount, used_birds: 0, highest_score: 0, total_birds: 0 });
                }    
            })
        } else {
            jsql.clear();
            jsql.run("update users set current_birds = "+ (Number(nft_amount) - Number(res[0].used_birds)) +" where id = "+ res[0].id,(e,res1,f)=>{
                if(e)result(e, null);
                else {
                    result(null, {current_birds: Number(nft_amount) - Number(res[0].used_birds), used_birds: res[0].used_birds, highest_score: res[0].highest_score, total_birds: nft_amount})
                }
            });
        }
    });
};

exports.gameover = (data, result) => {
	jsql.clear();
	jsql.s().t('users').w({user_address: data.wallet_address}).run((err, res, fields) => {
        if (err)result(err, null);
        if (res.length==0)result(null, {message: "User doens't exist!", value: 0});
        if (res[0].current_birds <= 0)result(null, {message: "User doesn't have enough birds currently!"});
        else {
            jsql.run("update users set highest_score = "+ data.highest_score +", current_birds = current_birds -" + 1 + ", used_birds = used_birds + " + 1 + " where id = "+ res[0].id,(e,res1,f)=>{
                if(e)result(e, null);
                else {
                    result(null, {current_birds: res[0].current_birds -1, used_birds: res[0].used_birds + 1, total_birds: Number(res[0].current_birds) + Number(res[0].used_birds), highest_score: data.highest_score})
                }
            });
        }
    });
};

exports.getLeaderBoard = (result) => {
	jsql.clear();
	jsql.run("select user_address, IFNULL(highest_score, 0) as highest_score from users order by highest_score desc",(err, res, fields) => {
		if(err) result(err, null);
		result(null, res);
	});
};

exports.mint = (data, result) => {
	jsql.clear();
    jsql.s().t('transaction').w({transaction_id: data.hash}).run((err, res, fields) => {
        if (err)result(err, null);
        if (res.length==0){
            web3.eth.getTransaction(data.hash, function(err,_receipt){
                if(err)result(err, null);
                var wallet_address = "";

                if(_receipt.from.toLowerCase() == data.wallet_address.toLowerCase()) {
                    wallet_address = data.wallet_address;
                    if (_receipt.to.toLowerCase() == process.env.NFT_CONTRACT_ADDRESS_TRIAL.toLowerCase() || _receipt.to.toLowerCase() == process.env.NFT_CONTRACT_ADDRESS_MAIN.toLowerCase()){
                        console.log("hash", data.hash);
                        jsql.clear();
                        jsql.i({user_address: data.wallet_address, type: "Mint", transaction_id: data.hash, date_time: new Date(), status: 0}).t('transaction').run((err, res1, fields) => {
                            if (err)result(err, null);
                            else {
                                jsql.s().t('users').w({user_address: data.wallet_address}).run(async (err, res2, fields) => {
                                    if (err)result(err, null);
                                    if(res2.length == 0) {
                                        var nft_trial_address = process.env.NFT_CONTRACT_ADDRESS_TRIAL;
                                        var jsonFile_trial = "./server/abis/"+nft_trial_address+".json";
                                        var parsed_trial= JSON.parse(fs.readFileSync(jsonFile_trial));
                                        var nft_trial_abi = parsed_trial.abi;
                                        var nft__trial_router = new web3.eth.Contract(nft_trial_abi, web3.utils.toChecksumAddress(nft_trial_address));
                                        var nft_trial_amount = await nft__trial_router.methods.balanceOf(wallet_address).call();
                                    
                                        var nft_main_address = process.env.NFT_CONTRACT_ADDRESS_MAIN;
                                        var jsonFile_main = "./server/abis/"+nft_main_address+".json";
                                        var parsed_main= JSON.parse(fs.readFileSync(jsonFile_main));
                                        var nft_main_abi = parsed_main.abi;
                                        var nft__main_router = new web3.eth.Contract(nft_main_abi, web3.utils.toChecksumAddress(nft_main_address));
                                        var nft_main_amount = await nft__main_router.methods._nftBalance(wallet_address).call();
                                    
                                        var nft_amount = Number(nft_trial_amount) + Number(nft_main_amount);
                                        
                                        jsql.clear();
                                        jsql.i({user_address: data.wallet_address, current_birds: nft_amount}).t('users').run((err, res3, fields) => {
                                            if (err)result(err, null);
                                            else {
                                                result(null, {message: "success"});
                                            }    
                                        });
                                    }
                                    else {
                                        result(null, {message: "success"});
                                    }
                                });
                            }
                        });
                    } else {result(null, {message:"You didn't interact with NFT contract!"})}
                } else {result(null, {message:"You didn't interact with any NFT contract!"})}
            });
        } else {
            result(null, {message: "That transaction already exists!"});
        }
    });
};

// exports.play = (data, result) => {
// 	jsql.clear();
// 	jsql.s().t('transaction').w({transaction_id: data.hash}).run((err, res, fields) => {
//         if (err)result(err, null);
//         if (res.length==0){
//             web3.eth.getTransaction(data.hash, function(err,_receipt){
//                 if(err)result(err, null);
//                 var wallet_address = "";
//                 if(_receipt.from.toLowerCase() == data.wallet_address.toLowerCase()) {
//                     wallet_address = data.wallet_address;
//                     if (_receipt.to.toLowerCase() == process.env.NFT_CONTRACT_ADDRESS_TRIAL.toLowerCase()){
//                         jsql.clear();
//                         jsql.i({user_address: data.wallet_address, type: "Playing", transaction_id: data.hash, date_time: new Date(), status: 0}).t('transaction').run((err, res1, fields) => {
//                             if (err)result(err, null);
//                             else {
//                                 jsql.s().t('users').w({user_address: data.wallet_address}).run(async (err, res2, fields) => {
//                                     if (err)result(err, null);
//                                     if(res2.length == 0) {
//                                         var nft_trial_address = process.env.NFT_CONTRACT_ADDRESS_TRIAL;
//                                         var jsonFile_trial = "./server/abis/"+nft_trial_address+".json";
//                                         var parsed_trial= JSON.parse(fs.readFileSync(jsonFile_trial));
//                                         var nft_trial_abi = parsed_trial.abi;
//                                         var nft__trial_router = new web3.eth.Contract(nft_trial_abi, web3.utils.toChecksumAddress(nft_trial_address));
//                                         var nft_trial_amount = await nft__trial_router.methods.balanceOf(data.wallet_address).call();
                                        
//                                         jsql.clear();
//                                         jsql.i({user_address: data.wallet_address, current_birds: nft_trial_amount}).t('users').run((err, res3, fields) => {
//                                             if (err)result(err, null);
//                                             else {
//                                                 result(null, {message: "success"});
//                                             }    
//                                         });
//                                     }
//                                     else {
//                                         result(null, {message: "success"});
//                                     }
//                                 });
//                             }
//                         });
//                     } else {result(null, {message:"You didn't interact with NFT contract!"})}
//                 } else {result(null, {message:"You didn't interact with NFT contract!"})}
//             });
//         } else {
//             result(null, {message: "That transaction already exists!"});
//         }
//     });
// };