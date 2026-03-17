const Comment = require("../models/commentModel");
const Blog = require("../models/blogModel");

// @desc    Add comment to blog
// @route   POST /api/blogs/:blogId/comments
// @access  Public
const addComment = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { name, email, comment, parentComment } = req.body;

    console.log("=".repeat(50));
    console.log("📝 ADDING COMMENT");
    console.log("Blog ID:", blogId);
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Comment:", comment);
    console.log("Parent Comment:", parentComment);
    console.log("=".repeat(50));

    // Check if blog exists and allows comments
    const blog = await Blog.findById(blogId);
    if (!blog) {
      console.log("❌ Blog not found");
      return res.status(404).json({ message: "Blog not found" });
    }

    if (!blog.allowComments) {
      console.log("❌ Comments are disabled for this blog");
      return res.status(403).json({ message: "Comments are disabled for this blog" });
    }

    // If it's a reply, check if parent comment exists
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent) {
        console.log("❌ Parent comment not found");
        return res.status(404).json({ message: "Parent comment not found" });
      }
    }

    // TEMPORARILY SET TO TRUE FOR TESTING
    const newComment = await Comment.create({
      blog: blogId,
      name,
      email,
      comment,
      parentComment,
      isApproved: true // Set to true for testing
    });

    console.log("✅ Comment created with ID:", newComment._id);
    console.log("Comment data:", newComment);

    // If it's a reply, add to parent's replies array
    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, {
        $push: { replies: newComment._id },
      });
      console.log("✅ Added reply to parent comment");
    }

    res.status(201).json({
      success: true,
      data: newComment,
    });
  } catch (error) {
    console.error("❌ Error adding comment:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get comments for a blog
// @route   GET /api/blogs/:blogId/comments
// @access  Public
const getBlogComments = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const query = { 
      blog: blogId, 
      isApproved: true,
      parentComment: null // Only get top-level comments
    };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const comments = await Comment.find(query)
      .populate({
        path: "replies",
        match: { isApproved: true },
        options: { sort: { createdAt: -1 } },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Comment.countDocuments(query);

    res.json({
      success: true,
      data: comments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve comment
// @route   PATCH /api/comments/:id/approve
// @access  Private/Admin
const approveComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    comment.isApproved = true;
    await comment.save();

    res.json({
      success: true,
      message: "Comment approved successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private/Admin
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // If it's a parent comment, delete all replies
    if (comment.replies && comment.replies.length > 0) {
      await Comment.deleteMany({ _id: { $in: comment.replies } });
    }

    // If it's a reply, remove from parent's replies array
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: comment._id },
      });
    }

    await comment.deleteOne();

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all comments (admin) with search
// @route   GET /api/comments/admin
// @access  Private/Admin
const getAllComments = async (req, res) => {
  try {
    const { page = 1, limit = 20, isApproved, blogId, search } = req.query;

    const query = {};
    
    if (isApproved !== undefined) {
      query.isApproved = isApproved === "true";
    }
    
    if (blogId) {
      query.blog = blogId;
    }

    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { comment: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const comments = await Comment.find(query)
      .populate("blog", "title slug")
      .populate({
        path: "replies",
        populate: {
          path: "blog",
          select: "title slug"
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Comment.countDocuments(query);

    res.json({
      success: true,
      data: comments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error in getAllComments:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like a comment
// @route   POST /api/comments/:id/like
// @access  Public
const likeComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    comment.likes += 1;
    await comment.save();

    res.json({
      success: true,
      likes: comment.likes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addComment,
  getBlogComments,
  approveComment,
  deleteComment,
  getAllComments,
  likeComment,
};