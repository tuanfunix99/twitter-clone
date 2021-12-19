const mongoose = require("mongoose");
const dotenv = require("dotenv");
const log = require("../logger");
dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then((res) => log.info("Connected to mongodb"))
  .catch((err) =>
    log.error({ message: err.message }, "Error connecting to mongodb")
  );
