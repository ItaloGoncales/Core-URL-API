"use strict";
module.exports = function (app) {
  const smallUrl = require("../controllers/smallUrlController");

  app.route("/:code").get(smallUrl.redirectToUrl);

  app.route("/v1/url").post(smallUrl.createSmallUrl);
  app.route("/v1/url/:code").get(smallUrl.getSmallUrl);
  app.route("/v1/url/:code/lite").get(smallUrl.getLiteSmallUrl);
};
