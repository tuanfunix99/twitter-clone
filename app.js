const express = require("express");
const dotenv = require("dotenv");
const log = require("./logger");
const {
  authRoutes,
  postApiRoutes,
  mainRoutes,
  userApiRoutes,
  userRoutes,
  postRoutes,
  noficationRoutes,
} = require("./routes/index.routes");
const path = require("path");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const http = require("http");
const socketIO = require("socket.io");
const { auth } = require('./middleware/auth');
const { getAmountNofication } = require("./utils/helper");
require("./utils/database");

dotenv.config();

const PORT = process.env.PORT || 5000;
const SECRET = process.env.SECRET || "secret";
const MONGO_URL = process.env.MONGO_URL || "";

const app = express();
const httpServer = http.createServer(app);
const io = socketIO(httpServer);
app.set("socketIo", io);

const store = new MongoDBStore({
  uri: MONGO_URL,
  expires: 1000 * 3600 * 24,
});

app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 3600 * 1000 * 24,
    },
    store: store,
  })
);
app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "uploads")));

app.use(mainRoutes);
app.use(authRoutes);
app.use(userRoutes);
app.use(postRoutes);
app.use(noficationRoutes);
app.use("/api/post", postApiRoutes);
app.use("/api/user", userApiRoutes);

app.use(auth, (req, res, next) => {
  res.render("notfound", {
    title: "Not Found",
    noficationAmount: getAmountNofication(req.user.noficationAmount),
    user: req.user,
  });
});

httpServer.listen(PORT, () => {
  log.info("listening on port " + PORT);
});
