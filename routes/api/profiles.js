// User profiles info
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Load validation
const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");

// Load Profile Model
const Profile = require("./../models/Profile");
// Load User Model
const User = require("./../models/User");


/* @route   GET api/profiles/test
   @desc    Tests profiles route
   @access  Public
*/
router.get(`/test`, (req, res) => res.json({msg: `Profile Works`}));


/* @route   GET api/profile
   @desc    Get current users profile
   @access  Private
*/
router.get("/", passport.authenticate("jwt", { session:false }),
(req, res) => {
  const errors = {};  // Create errors object to hold error messages

  Profile.findOne({ user: req.user.id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if(!profile) {  // IF profile is not found
        errors.noprofile = "There is no profile for this user";
        return res.status(404).json(errors);
      }
      res.json(profile);  // Display user profile
    })
    .catch(err => res.status(404).json(err));
});


/* @route   GET api/profile/all
   @desc    Get all profiles
   @access  Public
*/
router.get("/all", (req, res) => {
  const errors = {};

  Profile.find()
  .populate("user", ["name", "avatar"])
  .then(profiles => {
    if(!profiles) {
      errors.noprofile = "There are no profiles."
      return res.status(404).json(errors);
    }

    res.json(profiles)
  })
  .catch(err => {
    res.status(404).json({ profile: "There are no profiles."})
  })
})


/* @route   GET api/profile/handle/:handle
   @desc    Get profile by handle
   @access  Public
*/
router.get("/handle/:handle", (req, res) => {
  const errors = {};

  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if(!profile) {
        errors.noprofile = "There is no profile for this user.";
        res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err => res.status(404).json(err))
})

/* @route   GET api/profile/user/:user_id
   @desc    Get profile by user ID
   @access  Public
*/
router.get("/user/:user_id", (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if(!profile) {
        errors.noprofile = "There is no profile for this user.";
        res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err => res.status(404).json({ profile: "There is no profile for this user."} ))
});

/* @route   POST api/profile
   @desc    Create or edit user profile
   @access  Private

   1. Collect req.body in profileFields object
   2. Search for profile using logged in user id
     - IF user has profile, update fields
     - ELSE create new profile and validate user handle
*/
router.post("/", passport.authenticate("jwt", { session:false }),
(req, res) => {
  const { errors, isValid } = validateProfileInput(req.body);

  // Check validation
  if(!isValid) {
    // Return any errors with 400 status
    return res.status(400).json(errors);
  }
  // Get fields from UI (except user.id) w/ validation
  const profileFields = {};
  profileFields.user = req.user.id;
  if(req.body.handle) profileFields.handle = req.body.handle;
  if(req.body.company) profileFields.company = req.body.company;
  if(req.body.website) profileFields.website = req.body.website;
  if(req.body.location) profileFields.location = req.body.location;
  if(req.body.bio) profileFields.bio = req.body.bio;
  if(req.body.status) profileFields.status = req.body.status;
  if(req.body.githubuser) profileFields.githubuser = req.body.githubuser;
  // Skills - split string into array
  if(typeof req.body.skills !== "undefined") {
    profileFields.skills = req.body.skills.split(",");
  }
  // Social -
  profileFields.social = {}; // initialize .social b/c its going to be an object
  if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
  if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
  if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
  if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
  if(req.body.instagram) profileFields.social.instagram = req.body.instagram;

  // Find user Profile of user using mongoose model
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      if(profile) {
        // Update one profile using profileFields object
        Profile.findOneAndUpdate(
          { user: req.user.id},
          { $set: profileFields },
          { new: true }  // This option returns modified doc rather than orig.
        ).then(profile => res.json(profile))  // Respond with the profile
      } else {
        // Create user profile

        // Check if handle exists in db
        Profile.findOne({ handle: profileFields.handle}).then(profile => {
          if(profile) {
            errors.handle = "That handle already exists.";
            res.status(400).json(errors);
          }

          //  Save new Profile
          new Profile(profileFields).save().then(profile => res.json(profile));
        })
      }
    }).catch()
});


/* @route   POST api/profile/experience/
   @desc    Add experience to profile
   @access  Private
*/
router.post("/experience", passport.authenticate("jwt", { session: false }),
(req, res) => {

  const { errors, isValid } = validateExperienceInput(req.body);

  // Check validation
  if(!isValid) {
    // Return any errors with 400 status
    return res.status(400).json(errors);
  }

  // Find by current user. Req.user.id comes from the token
  Profile.findOne({ user: req.user.id })
  .then(profile => {
    const newExp = {
      title: req.body.title,
      company: req.body.company,
      location: req.body.location,
      from: req.body.from,
      to: req.body.to,
      current: req.body.current,
      description: req.body.description
    }

    // Add to exp array. unshift puts new object in beggining of array. push last
    profile.experience.unshift(newExp);

    // Save to mongoose db
    profile.save().then( profile => res.json(profile));
  });
});


/* @route   POST api/profile/education/
   @desc    Add education to profile
   @access  Private
*/
router.post("/education", passport.authenticate("jwt", { session: false }),
(req, res) => {

  const { errors, isValid } = validateEducationInput(req.body);

  // Check validation
  if(!isValid) {
    // Return any errors with 400 status
    return res.status(400).json(errors);
  }

  // Find by current user. Req.user.id comes from the token
  Profile.findOne({ user: req.user.id })
  .then(profile => {
    const newEdu = {
      school: req.body.school,
      degree: req.body.degree,
      fieldOfStudy: req.body.fieldOfStudy,
      from: req.body.from,
      to: req.body.to,
      current: req.body.current,
      description: req.body.description
    }

    // Add to exp array. unshift puts new object in beggining of array. push last
    profile.education.unshift(newEdu);

    // Save to mongoose db
    profile.save().then( profile => res.json(profile));
  });
});


/* @route   DELETE api/profile/experience/:exp_id
   @desc    Delete experience from profile
   @access  Private
*/
router.delete("/experience/:exp_id", passport.authenticate("jwt", { session: false }),
(req, res) => {

  // Find by current user. Req.user.id comes from the token
  Profile.findOne({ user: req.user.id })
  .then(profile => {
    // Get remove index
    const removeIndex = profile.experience
    .map(item => item.id)  // Get the item.id's from item
    .indexOf(req.params.exp_id)  // Find index of exp_id from the array of items.id's

    // Splice out of array
    profile.experience.splice(removeIndex, 1);

    // Save
    profile.save().then(profile => res.json(profile));
  })
  .catch(err => res.status(404).json(err))
});


/* @route   DELETE api/profile/education/:edu_id
   @desc    Delete education from profile
   @access  Private
*/
router.delete("/education/:edu_id", passport.authenticate("jwt", { session: false }),
(req, res) => {

  // Find by current user. Req.user.id comes from the token
  Profile.findOne({ user: req.user.id })
  .then(profile => {
    // Get remove index
    const removeIndex = profile.education
    .map(item => item.id)  // Get the item.id's from item
    .indexOf(req.params.edu_id)  // Find index of exp_id from the array of items.id's

    // Splice out of array
    profile.education.splice(removeIndex, 1);

    // Save document
    profile.save().then(profile => res.json(profile));
  })
  .catch(err => res.status(404).json(err))
});


/* @route   DELETE api/profile
   @desc    Delete user and profile
   @access  Private
*/
router.delete("/", passport.authenticate("jwt", { session: false }),
(req, res) => {
  Profile.findOneAndRemove({ user: req.user.id })
  .then(() => {
    User.findOneAndRemove({ _id: req.user.id })
    .then(() => res.json(({ success: true})
  ))
});

});

module.exports = router;
