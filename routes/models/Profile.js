const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const ProfileSchema = new Schema({

  /*
    Map for ProfileSchema:
    1. user (associate User model) - id, email, name, gravatar
    2. handle - user handle
    3. company - where user currently works
    4. website - user's website
    5. location - current user residence
    6. status - user's job level
    7. skills - user's skill set; an array of strings
    8. bio - user bio
    9. githubuser - link to user's github
    10. experience [can have multiple instances] - an array to hold different fields (objects)
      a. title - job title
      b. company - company where user worked
      c. location - location of company
      d. from - start date
      e. to - end date
      f. current - is user currently working here? bool default false
    12. education [can have multiple instances] - an array to hold different fields (objects)
      a. school - what schools did user attend
      b. degree - what degree user has
      c. fieldOfStudy - what area of study user focused on
      d. from - start date
      e. to - end date
      f. current - is user currently attending here? bool, default false
    13. social(only one instance of each) - holds user youtube, linkedin, twitter, facebook, instagram link
    14. date - current timestamp
  */
  // Associate user object to profile object
  user: {
    type: Schema.Types.ObjectId, // Associate user by its id
    ref: "users", // Reference the collection this object refers to
  },
  handle: {
    type: String,
    require: true,
    max: 40
  },
  company: {
    type: String
  },
  website: {
    type: String
  },
  location: {
    type: String
  },
  status: {
    type: String,
    required: true
  },
  skills: {
    type: [String], // Array of strings
  },
  bio: {
    type: String
  },
  githubuser: {
    type: String
  },
  experience: [{  // Array of objects to hold user's job experience
    title: {
      type: String,
      required: true
    },
    company: {
      type: String,
      required: true
    },
    location: {
      type: String,
    },
    from: {
      type: Date,
      required: true,
    },
    to: {
      type: Date,
    },
    current: {  // Is user still working here?
      type: Boolean,
      default: false
    },
  }],
  education: [{  // Array of objects to hold user's education info
    school: {
      type: String,
      required: true
    },
    degree: {
      type: String,
      required: true
    },
    fieldOfStudy: {
      type: String,
      required: true
    },
    from: {
      type: Date,
      required: true,
    },
    to: {
      type: Date,
    },
    current: {  // Is user still working here?
      type: Boolean,
      default: false
    },
  }],
  social: {
    youtube: {
      type: String
    },
    twitter: {
      type: String
    },
    linkedin: {
      type: String
    },
    facebook: {
      type: String
    },
    instagram: {
      type: String
    },
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Profile = mongoose.model("profile", ProfileSchema);
