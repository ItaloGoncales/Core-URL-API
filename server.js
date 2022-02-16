var express = require("express");

const dotenv = require("dotenv");
dotenv.config();

var app = express();
var port = process.env.PORT || 3100;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.set("json spaces", 2);

app.use(function (err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error(err);
    return res
      .status(400)
      .send({ success: false, error: `${err.message}. Content: ${err.body}` }); // Bad request
  }

  next();
});

require("./routes")(app);

app.route("/").get(function (req, res) {
  res.json({ message: "Atom URL API" });
});

app.use(function (req, res) {
  res.status(404);

  res.json({ error: `${req.method} ${req.path} is not found` });
  return;
});

app.listen(port);
console.log("Atom URL API server started on: " + port);
