const auth = require("../../middleware/auth");
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const express = require("express");
const { check, validationResult } = require("express-validator");

const router = express.Router();

// @route  POST api/posts
//@desc    Create a post
//@access  Private
router.post(
  "/",
  [auth, [check("text", "You must input text.").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();

      res.json(post);
    } catch (e) {
      console.error(e.message);
      res
        .status(500)
        .send(
          "Something went wrong with our server. We apologise for the inconvenience."
        );
    }
  }
);

module.exports = router;
