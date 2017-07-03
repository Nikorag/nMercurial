var fs = require("fs");

module.exports = {
    createPatch : createPatch
}

function createPatch(filename, promise){
    var patch = [
        {
            chunks : [
                {
                    oldStart : 1,
                    newStart : 1,
                    changes : []
                }
            ]
        }
    ];
    var input = fs.createReadStream(filename);
    var lineNo = 1;
    readLines(input, function(line){
        var change = {
            type : "add",
            add : true,
            ln1 : lineNo,
            content: '+'+line
        }
        patch[0].chunks[0].changes.push(change);
        lineNo++;
    }, function(){
        patch[0].chunks[0].oldLines = lineNo;
        patch[0].chunks[0].newLines = lineNo;
        promise(patch);
    });
}

function readLines(input, func, ended) {
    var remaining = '';

    input.on('data', function(data) {
        remaining += data;
        var index = remaining.indexOf('\n');
        var last  = 0;
        while (index > -1) {
            var line = remaining.substring(last, index);
            last = index + 1;
            func(line);
            index = remaining.indexOf('\n', last);
        }

        remaining = remaining.substring(last);
    });

    input.on('end', function() {
        if (remaining.length > 0) {
            func(remaining);
        } else {
            ended();
        }
    });
}
