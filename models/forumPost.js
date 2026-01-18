const mongoose = require("mongoose");

const forumPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["general", "academics", "internships", "events", "help", "other"],
      default: "general",
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    karma: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Calculate karma before saving
forumPostSchema.pre("save", function (next) {
  this.karma = this.upvotes.length - this.downvotes.length;
  next();
});

// Index for better performance
forumPostSchema.index({ createdAt: -1 });
forumPostSchema.index({ karma: -1 });
forumPostSchema.index({ author: 1 });

const ForumPost = mongoose.model("ForumPost", forumPostSchema);

module.exports = ForumPost;
