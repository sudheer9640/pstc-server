const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000;
const app =express();
const bodyParser = require("body-parser");
const cors = require('cors');
const morgan = require('morgan');
const passport = require("passport");
const instance = require("./config/instance");
const util = require("./config/util");

/************* mongoose setup ***************/
require("./db/mongoose");

/************* passport setup ***************/
require("./config/passport");

//***Module Variables*==============================================================================
const auth = require("./routes/authroute"),
  question = require("./routes/questionroute"),
  subject = require("./routes/subjectroute"),
  session = require("./routes/sessionroute");
//***Middleware*==============================================================================
// const accessLogStream = fs.createWriteStream(
//   path.join(__dirname, 'access.log'), {flags: 'a'}
// );
app.use(cors());

app.use(morgan("dev"));
// app.use(morgan('common', {stream: accessLogStream}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "dist")));
app.use(passport.initialize());


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-type,Accept, Authorization"
  );
  if (req.method == "OPTIONS") {
    res.status(200).end();
  } else {
    next();
  }
});

// passport.authenticate('jwt', { session: false }), util.isAdmin,
app.use("/auth", auth);
app.use("/question", question);
app.use('/subject',  subject);
app.use('/session',   session);

// app.use('/app',(req, res, next)=>{
//   req.checkBody('user', 'user is required').notEmpty();
//   req.checkBody('token', 'token is required').notEmpty();

//   req.asyncValidationErrors().then(()=>{
//       var decode = jwt.decode(req.body.token, 'secret');
//       if(decode.user === req.body.user){
//           next();
//       } else {
//           res.json({succes: false, msg: 'token not valid'});
//       }
//   }).catch((err)=>{
//       res.json({succes: false, msg: err});
//   })
// });

app.use((err, req, res, next) => {
    if (err.name === "UnauthorizedError") {
      res.status(401).json({ message: err.name + ": " + err.message });
    } else {
        next();
    }
  });
  
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/index.html"));
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
