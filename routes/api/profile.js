const auth = require("../../middleware/auth");
const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();

const Profile = require("../../models/Profile");
const User = require("../../models/User");

// @route  GET api/profile/me
//@desc    get current User's profile
//@access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({ msg: "Oops! No such profile was found!" });
    }

    res.json(profile);
  } catch (e) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route  POST api/profile
//@desc    Create or Update a user profile
//@access  Private
router.post(
  "/",
  [
    auth,
    [
      check("status", "You need to provide a status").not().isEmpty(),
      check("skills", "You need to populate your skill-set").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // destructure the request
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    // build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    //Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        // If profile is found then user would like to update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }

      // Create profile if no profile found
      profile = new Profile(profileFields);

      await profile.save();
      res.json(profile);
    } catch (e) {
      console.error(err.message);
      return res.status(500).send("Server Error");
    }
  }
);

// @route  GET api/profile
//@desc    Get all profiles
//@access  Public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (e) {
    console.error(e.message);
    res.status(500).send("Server Error");
  }
});

// @route  GET api/profile/user/:user_id
//@desc    Get profile by user ID
//@access  Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({ msg: "No profile found!" });
    }

    res.json(profile);
  } catch (e) {
    console.error(e.message);
    if (e.kind == "ObjectId") {
      return res.status(400).json({ msg: "No profile found!" });
    }
    res.status(500).send("Server Error");
  }
});

// @route  DELETE api/profile
//@desc    Delete profile, user and posts
//@access  Private
router.delete("/", auth, async (req, res) => {
  try {
    //Remove Profile
    await Profile.findOneAndRemove({ user: req.user.id });
    //Remove User
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: "User successfully deleted" });
  } catch (e) {
    console.error(e.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
