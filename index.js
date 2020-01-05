const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");

const { MongoClient } = require("mongodb");

const mongoURL = process.env.MONGO_URL || "mongodb://localhost:27017";
let users;

(async () => {
  try {
    const db = await MongoClient.connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("Mongo connected!");

    db.on("error", () => {
      console.log("Mongo connection error");
    });

    users = db.db("appdb").collection("users");
    // if empty seed the database
    if ((await users.countDocuments({})) === 0) {
      console.log("Seeding database");
      await users.insertMany(require("./seed.json"));
    }
  } catch (error) {
    console.error(error);
  }
})();

const port = process.env.EXPRESS_PORT || 3000;
const ip = process.env.EXPRESS_IP || "localhost";
const domain = process.env.EXPRESS_DOMAIN || "localhost";
const app = express();
const hbs = exphbs.create();

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function(req, res) {
  res.render("index", {
    url: `http://${domain}:${port}`
  });
});

app.post("/data", async function(req, res) {
  try {
    const { body } = req;
    await users.insertOne(body);
    res.redirect("/data");
  } catch (error) {
    console.error(error);
    res.sendStatus(400);
  }
});

app.get("/data", async function(req, res) {
  try {
    const data = await users.find({}).toArray();
    res.render("data", {
      data: JSON.stringify(data, null, 2)
    });
  } catch (error) {
    console.error(error);
    res.sendStatus(400);
  }
});

app.listen(port, ip, () =>
  console.log(`App listening on http://${ip}:${port}`)
);
