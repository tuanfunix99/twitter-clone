const express = require("express");
const dotenv = require("dotenv");
const log = require("./logger");
const { authRoutes } = require("./routes/index.routes");
const auth = require("./middleware/auth");
const path = require("path");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
require("./utils/database");

dotenv.config();

const PORT = process.env.PORT || 5000;
const SECRET = process.env.SECRET || "secret";
const MONGO_URL = process.env.MONGO_URL || "";

const app = express();

const store = new MongoDBStore({
  uri: MONGO_URL,
  expires: 1000 * 3600,
});

app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 3600 * 1000,
    },
    store: store,
  })
);
app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", auth, (req, res) => {
  const title = "Home";
  res.status(200).render("home/", { title });
});

app.use(authRoutes);

app.listen(PORT, () => {
  log.info("listening on port " + PORT);
});
