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

// @route  PUT api/profile/experience
//@desc    Add profile experience
//@access  Private
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "A title is necessary").not().isEmpty(),
      check("company", "A company name is necessary").not().isEmpty(),
      check("from", "A start date is necessary").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExperience = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExperience);

      await profile.save();

      res.json(profile);
    } catch (e) {
      console.error(e.message);
      res
        .status(500)
        .send(
          "An error has occurred on our end. We apologise for the inconvcenience"
        );
    }
  }
);

// @route  DELETE api/profile/experience/:exp_id
//@desc    Delete experience from profile
//@access  Private
router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (e) {
    console.error(e.message);
    res
      .status(500)
      .send(
        "An error has occurred on our end. We apologise for the inconvcenience"
      );
  }
});

// @route  PUT api/profile/education
//@desc    Add profile education
//@access  Private
router.put(
  "/education",
  [
    auth,
    [
      check("school", "A School Name is necessary").not().isEmpty(),
      check("degree", "A Degree Title is necessary").not().isEmpty(),
      check("fieldofstudy", "A Field of Study is necessary").not().isEmpty(),
      check("from", "A start date is necessary").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEducation = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEducation);

      await profile.save();

      res.json(profile);
    } catch (e) {
      console.error(e.message);
      res
        .status(500)
        .send(
          "An error has occurred on our end. We apologise for the inconvcenience"
        );
    }
  }
);

// @route  DELETE api/profile/education/:edu_id
//@desc    Delete education from profile
//@access  Private
router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (e) {
    console.error(e.message);
    res
      .status(500)
      .send(
        "An error has occurred on our end. We apologise for the inconvcenience"
      );
  }
});

module.exports = router;
