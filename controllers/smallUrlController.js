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

exports.createSmallUrl = async function (req, res) {
  try {
    let data = req.body;

    if (!data.url)
      return res.status(400).json({
        success: false,
        message: "url parameter is missing",
      });

    if (!URL.isValid(data.url))
      return res.status(400).json({
        success: false,
        message: "Passed url parameter is not a valid url",
      });

    if (
      data.expirationDays &&
      (parseInt(data.expirationDays) < 1 || parseInt(data.expirationDays) > 10)
    )
      return res.status(400).json({
        success: false,
        message: "expirationDays parameter must be between 1-10 days",
      });

    let createdUrl = await URL.createSmallUrl(
      data.url,
      data.expirationDays ? parseInt(data.expirationDays) : null
    );

    res.json(createdUrl);
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
