const { Collection, Db, MongoClient } = require("mongodb");

const mongoURL = "mongodb://localhost:27017";

export let users;

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

    db.on("timeout", () => {
      console.log("Mongo connection lost");
      dbConnected = false;
    });

    db.on("close", () => {
      console.log("Mongo connection closed");
      dbConnected = false;
    });

    users = db.db("appdb").collection("users");
    // if empty seed the database
    if ((await users.countDocuments({})) === 0) {
      await users.insertMany(require("./seed.json"));
    }
  } catch (error) {
    console.error(error);
  }
})();
