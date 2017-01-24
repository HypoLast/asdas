var fs = require("fs");

String.prototype.endsWith = function(tail) {
    return this.indexOf(tail) >= 0 && this.indexOf(tail) == this.length - tail.length;
}

function wander(dir, depth, root) {
    var contents = fs.readdirSync(dir).map(function(e) { return [e, dir + "/" + e]; });
    for (var i = 0; i < contents.length; i ++) {
        if (fs.lstatSync(contents[i][1]).isDirectory()) {
            wander(contents[i][1], depth + 1, root);
        } else if (depth > 0 && contents[i][0].endsWith(".js.map")) {
            var mapping = JSON.parse(fs.readFileSync(contents[i][1]));
            fs.unlinkSync(contents[i][1]);
            mapping.file = contents[i][1].substr(root.length + 1, contents[i][1].length - ".map".length - root.length - 1);
            mapping.sources[0] = mapping.sources[0].substr("../".length * depth);
            fs.writeFileSync(root + "/" + contents[i][0], JSON.stringify(mapping));
        }
    }
}

wander("stage", 0, "stage");