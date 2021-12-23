const express = require("express");
const dotenv = require("dotenv");
const log = require("./logger");
const { authRoutes, postApiRoutes, mainRoutes, userApiRoutes } = require("./routes/index.routes");
const path = require("path");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const http = require("http");
const socketIO = require('socket.io');
require("./utils/database");

dotenv.config();

const PORT = process.env.PORT || 5000;
const SECRET = process.env.SECRET || "secret";
const MONGO_URL = process.env.MONGO_URL || "";

const app = express();
const httpServer = http.createServer(app);
const io = socketIO(httpServer);
app.set('socketIo', io);


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

app.use(mainRoutes);
app.use(authRoutes);
app.use('/api', postApiRoutes);
app.use('/api', userApiRoutes);

httpServer.listen(PORT, () => {
  log.info("listening on port " + PORT);
});
