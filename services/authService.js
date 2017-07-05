var storage = require('node-persist');
var randomstring = require("randomstring");

module.exports = {
    getSeed : getSeed
}

function getSeed(){
    var seed = storage.getItemSync("authSeed");
    if (seed !== undefined){
        return seed;
    } else {
        var genSeed = randomstring.generate();
        storage.setItemSync("authSeed", genSeed);
        return genSeed;
    }
}
