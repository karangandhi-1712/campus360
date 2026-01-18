const ForumPost = require("../models/forumPost");
const Comment = require("../models/comment");

// Get all posts with pagination and sorting
exports.getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "new", category } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    if (category && category !== "all") {
      query.category = category;
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case "hot":
        sortOption = { karma: -1, createdAt: -1 };
        break;
      case "top":
        sortOption = { karma: -1 };
        break;
      case "new":
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    const posts = await ForumPost.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("author", "name email");

    const total = await ForumPost.countDocuments(query);

    res.json({
      posts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalPosts: total,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching posts", error: error.message });
  }
};

// Get single post with comments
exports.getPostById = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id).populate(
      "author",
      "name email",
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Get comments for this post
    const comments = await Comment.find({ post: req.params.id })
      .sort({ karma: -1, createdAt: 1 })
      .populate("author", "name email");

    res.json({ post, comments });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching post", error: error.message });
  }
};

// Create new post
exports.createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    const post = new ForumPost({
      title,
      content,
      category: category || "general",
      author: req.user.id,
      authorName: req.user.name,
    });

    await post.save();
    res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating post", error: error.message });
  }
};

// Update post
exports.updatePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this post" });
    }

    const { title, content, category } = req.body;

    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
    post.isEdited = true;
    post.editedAt = new Date();

    await post.save();
    res.json({ message: "Post updated successfully", post });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating post", error: error.message });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }

    // Delete all comments associated with this post
    await Comment.deleteMany({ post: req.params.id });

    await ForumPost.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting post", error: error.message });
  }
};

// Upvote post
exports.upvotePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user.id;

    // Remove from downvotes if exists
    const downvoteIndex = post.downvotes.indexOf(userId);
    if (downvoteIndex > -1) {
      post.downvotes.splice(downvoteIndex, 1);
    }

    // Toggle upvote
    const upvoteIndex = post.upvotes.indexOf(userId);
    if (upvoteIndex > -1) {
      post.upvotes.splice(upvoteIndex, 1);
    } else {
      post.upvotes.push(userId);
    }

    await post.save();
    res.json({
      message: "Vote updated",
      karma: post.karma,
      upvotes: post.upvotes.length,
      downvotes: post.downvotes.length,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error voting on post", error: error.message });
  }
};

// Downvote post
exports.downvotePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user.id;

    // Remove from upvotes if exists
    const upvoteIndex = post.upvotes.indexOf(userId);
    if (upvoteIndex > -1) {
      post.upvotes.splice(upvoteIndex, 1);
    }

    // Toggle downvote
    const downvoteIndex = post.downvotes.indexOf(userId);
    if (downvoteIndex > -1) {
      post.downvotes.splice(downvoteIndex, 1);
    } else {
      post.downvotes.push(userId);
    }

    await post.save();
    res.json({
      message: "Vote updated",
      karma: post.karma,
      upvotes: post.upvotes.length,
      downvotes: post.downvotes.length,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error voting on post", error: error.message });
  }
};

// Create comment
exports.createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.id;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = new Comment({
      content,
      author: req.user.id,
      authorName: req.user.name,
      post: postId,
    });

    await comment.save();

    // Update comment count
    post.commentCount += 1;
    await post.save();

    res.status(201).json({ message: "Comment created successfully", comment });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating comment", error: error.message });
  }
};

// Update comment
exports.updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this comment" });
    }

    const { content } = req.body;
    if (content) comment.content = content;
    comment.isEdited = true;
    comment.editedAt = new Date();

    await comment.save();
    res.json({ message: "Comment updated successfully", comment });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating comment", error: error.message });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    const postId = comment.post;

    await Comment.findByIdAndDelete(req.params.commentId);

    // Update comment count
    const post = await ForumPost.findById(postId);
    if (post) {
      post.commentCount = Math.max(0, post.commentCount - 1);
      await post.save();
    }

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting comment", error: error.message });
  }
};

// Upvote comment
exports.upvoteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const userId = req.user.id;

    // Remove from downvotes if exists
    const downvoteIndex = comment.downvotes.indexOf(userId);
    if (downvoteIndex > -1) {
      comment.downvotes.splice(downvoteIndex, 1);
    }

    // Toggle upvote
    const upvoteIndex = comment.upvotes.indexOf(userId);
    if (upvoteIndex > -1) {
      comment.upvotes.splice(upvoteIndex, 1);
    } else {
      comment.upvotes.push(userId);
    }

    await comment.save();
    res.json({ message: "Vote updated", karma: comment.karma });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error voting on comment", error: error.message });
  }
};

// Downvote comment
exports.downvoteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const userId = req.user.id;

    // Remove from upvotes if exists
    const upvoteIndex = comment.upvotes.indexOf(userId);
    if (upvoteIndex > -1) {
      comment.upvotes.splice(upvoteIndex, 1);
    }

    // Toggle downvote
    const downvoteIndex = comment.downvotes.indexOf(userId);
    if (downvoteIndex > -1) {
      comment.downvotes.splice(downvoteIndex, 1);
    } else {
      comment.downvotes.push(userId);
    }

    await comment.save();
    res.json({ message: "Vote updated", karma: comment.karma });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error voting on comment", error: error.message });
  }
};

// Get user's posts
exports.getUserPosts = async (req, res) => {
  try {
    const posts = await ForumPost.find({ author: req.user.id })
      .sort({ createdAt: -1 })
      .populate("author", "name email");

    res.json({ posts });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user posts", error: error.message });
  }
};
