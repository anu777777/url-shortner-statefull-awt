const express = require("express");
const { connectToMongoDB } = require("./connect");
const path = require('path');
const cookieParser = require("cookie-parser");
const URL = require("./models/url");
const {restrictToLoggedInUserOnly, checkAuth} = require("./middlewares/auth");


//Handling the routes
const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter");
const userRoute = require("./routes/user");

const app = express();
const PORT = 8001;

connectToMongoDB("mongodb://127.0.0.1:27017/short-url").then(() =>
  console.log("Mongodb connected")
);

app.set("view engine", "ejs");
app.set("vies", path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({extended:false}))
app.use(cookieParser());

app.use("/", checkAuth, staticRoute);

app.use("/url", restrictToLoggedInUserOnly, urlRoute);

app.use("/user", userRoute);


app.get("/url/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    }
  );
  res.redirect(entry.redirectURL);
});

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));
