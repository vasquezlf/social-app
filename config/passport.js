// This file contains jwt strategy

const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const User = mongoose.model("users");
const keys = require("../config/keys");

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports = passport => {
  passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    // console.log(jwt_payload)  // *TEST* Log out payload

    // Mongoose - Find user
    User.findById(jwt_payload.id)
    .then(user => {
      // IF user is found, return 'done' function (error, user)
      if(user){
        return done(null, user);
      }
      // ELSE return false
      return done(null, false)
    })
    .catch(err => console.log(err));
  })
);
};
