// This file handles routes for user.
//  /register - creates User, hash password, and adds to DB
//  /login - checks if user exists, compares hashed pw, returns token
//  /current -
const express = require("express");
const router = express.Router();
const gravatar = require("gravatar"); // Use gravatar package to fetch user gravatar
const bcrypt = require("bcryptjs"); // Use bcrypt package to hash passwords
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");

// Load Input Validation
const validateRegisterInput = require("../../validation/register")
const validateLoginInput = require("../../validation/login")

// Load User model
const User = require('../models/User');

/* @route   GET api/users/test
   @desc    Tests users route
   @access  Public
*/
router.get(`/test`, (req, res) => res.json({msg: "Users Works"}));


/* @route   GET api/users/register
   @desc    Register user
   @access  Public
*/
router.post(`/register`, (req, res) => {
  ////// Validate for empty req.body
  const {errors, isValid} = validateRegisterInput(req.body);
  // Check Validation
  if(!isValid) {
    return res.status(400).json(errors)
  }
  ////// END validation

  // Find matching user. IF found, throw validation error. ELSE create user.
  User.findOne({ email: req.body.email })
  .then(user => {
    if(user) {
      return res.status(400).json({email: "Email already exists"});
    } else {

      // Fetch user's gravatar thru email
      const avatar = gravatar.url(req.body.email, {
        s: "200", //Size
        r: "pg", // Rating
        d: "mm", // Default
      });

      // Mongoose - create newUser object from User model
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar: avatar,
        password: req.body.password,
      });

      // Hash password - cost-factor of 10 (strong)
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if(err) throw err;
          // Replace text password with hash that was created
          newUser.password = hash;
          // Save to database - mongoose
          newUser.save()
          .then(user => res.json(user))
          .catch(err => console.log(err));
        });
      });
    };
  });
}); //END Post


/* @route   GET api/users/login
   @desc    Login User / Returning JWT Token
   @access  Public
*/
router.post("/login", (req,res) => {
  // Take email from UI
  const email = req.body.email;
  // Take password from UI
  const password = req.body.password;
  ////// Validate for empty req.body
  const {errors, isValid} = validateLoginInput(req.body);
  // Check Validation
  if(!isValid) {
    return res.status(400).json(errors)
  }
  ////// END validation

  // Find user by email - returns user or error message
  User.findOne({ email: email})
  .then(user => {
    // Check for user
    if(!user) {
      errors.email = "User not found.";
      return res.status(404).json(errors);
    }
    // Check password
    bcrypt.compare(password, user.password)
    .then(isMatch => {
      // Using bcrypt.compare function, match password put by user
      // and hashed password from database
      if(isMatch) {
        // res.json({msg: "Success"}); //**TEST LINE***
        const payload = { id: user.id, name: user.name, avatar: user.avatar }
        // Sign token -- pass payload, key, and key expiration [1 hour]
        jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
          res.json({
            success: true,
            token: "Bearer " + token
          })
        });
      } else {
        errors.password = "Password incorrect.";
        return res.status(400).json(errors);
      }
    });
  });
});


/* @route   GET api/users/current
   @desc    Return current user
   @access  Private
*/
router.get("/current", passport.authenticate("jwt", {session:false}),
(req, res) => {
  // res.json(req.user); //A. This way returns all user info including password

  // B. Return a json of only selected user info
  res.json({
    id:req.user.id,
    name:req.user.name,
    email:req.user.email
  })
});

module.exports = router;
