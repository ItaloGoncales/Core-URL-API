const fs = require("fs"),
  path = require("path");

module.exports = function (app) {
  fs.readdirSync(__dirname).forEach(function (file) {
    if (file == "index.js") return;
    var name = path.basename(file, ".js");
    require("./" + name)(app);
  });
};
