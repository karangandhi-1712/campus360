const express = require("express");
const router = express.Router();
const forumController = require("../controllers/forumController");
const { protect } = require("../middleware/auth");

// Post routes
router.get("/posts", forumController.getAllPosts);
router.get("/posts/my-posts", protect, forumController.getUserPosts);
router.get("/posts/:id", forumController.getPostById);
router.post("/posts", protect, forumController.createPost);
router.put("/posts/:id", protect, forumController.updatePost);
router.delete("/posts/:id", protect, forumController.deletePost);

// Voting routes for posts
router.post("/posts/:id/upvote", protect, forumController.upvotePost);
router.post("/posts/:id/downvote", protect, forumController.downvotePost);

// Comment routes
router.post("/posts/:id/comments", protect, forumController.createComment);
router.put("/comments/:commentId", protect, forumController.updateComment);
router.delete("/comments/:commentId", protect, forumController.deleteComment);

// Voting routes for comments
router.post(
  "/comments/:commentId/upvote",
  protect,
  forumController.upvoteComment,
);
router.post(
  "/comments/:commentId/downvote",
  protect,
  forumController.downvoteComment,
);

module.exports = router;
