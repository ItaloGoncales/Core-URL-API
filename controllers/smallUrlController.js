"use strict";

const URL = require("../lib/URL");

exports.getSmallUrl = async function (req, res) {
  try {
    let url = await URL.smallUrl(req.params.code);

    if (!url) {
      return res.status(404).json({
        success: false,
        message: `Code ${req.params.code} doesn't exist`,
      });
    }

    return res.json(url);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getLiteSmallUrl = async function (req, res) {
  try {
    let url = await URL.liteSmallUrl(req.params.code);

    if (!url) {
      return res.status(404).json({
        success: false,
        message: `Code ${req.params.code} doesn't exist`,
      });
    }

    return res.json(url);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.redirectToUrl = async function (req, res) {
  try {
    let url = await URL.liteSmallUrl(req.params.code);

    if (!url) {
      return res.status(404).json({
        success: false,
        message: `Code ${req.params.code} doesn't exist`,
      });
    }

    return res.redirect(url.original_url);
  } catch (err) {
    console.log(err);
    return res.status(400).text("404");
  }
};
