const passport = require("passport"),
  JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt,
  LocalStrategy = require("passport-local");

const { User } = require("../models/user");
const instance = require("../config/instance");

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      session: false
    },
    (email, password, done) => {
      User.findOne({ email: email })
        .then(user => {
          if (!user) {
            return done(null, false, "User doesn't exists.");
          } else if (!user.validPassword(password)) {
            return done(null, false, "Incorrect password.");
          } else {
            return done(null, user);
          }
        })
        .catch(err => {
          return done(err);
        });
    }
  )
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: instance.secret
    },
    (jwt_payload, done) => {
      User.findOne({ _id: jwt_payload._id })
        .then(user => {
          if (!user) {
            done(null, false, "Please Sign in!");
          } else {
            done(null, user);
          }
        })
        .catch(err => {
          console.log(err)
          done(null, false, err);
        });
    }
  )
);
