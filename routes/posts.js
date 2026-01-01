const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const auth = require("../middleware/auth");

// ===============================
// CREATE POST (ADMIN ONLY)
// ===============================
router.post("/", auth, async (req, res) => {
  try {
    // 🔐 Admin check
    if (req.user.email !== "kabandaivan7@gmail.com") {
      return res.status(403).json({ message: "Admins only" });
    }

    const { title, content } = req.body;

    const post = new Post({
      title,
      content,
      author: req.user.email,
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===============================
// GET ALL POSTS (PUBLIC)
// ===============================
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===============================
// COMMENT ON POST (LOGGED-IN USERS)
// ===============================
router.post("/:id/comments", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({
      text: req.body.text,
      user: req.user.email,
    });

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
