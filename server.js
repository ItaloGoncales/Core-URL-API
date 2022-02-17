const express = require("express"),
  DB = require("./lib/DB"),
  SQLLoader = require("./lib/SQLLoader");

const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = process.env.PORT || 3100;

// Connect with database
DB.connect(
  process.env.PG_HOST,
  process.env.PG_USER,
  process.env.PG_PWD,
  process.env.PG_DATABASE,
  process.env.PG_PORT
);

SQLLoader.loadQueries().catch((err) => {
  throw err;
});

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
  res.json({ message: "Core URL API" });
});

app.use(function (req, res) {
  res.status(404);

  res.json({ error: `${req.method} ${req.path} is not found` });
  return;
});

app.listen(port);
console.log("Core URL API server started on: " + port);
