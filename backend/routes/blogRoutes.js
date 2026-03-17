const express = require("express");
const router = express.Router();
const {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  likeBlog,
  toggleFeatured,
  getBlogStats,
} = require("../controllers/blogController");
const {
  addComment,
  getBlogComments,
  likeComment,
} = require("../controllers/commentController");
const { adminProtect } = require("../middleware/adminProtect");

// Public routes
router.get("/", getBlogs);
router.get("/stats", adminProtect, getBlogStats); // Protected route
router.get("/:id", getBlogById);
router.post("/:id/like", likeBlog);

// Blog comment routes (public for adding, protected for viewing? Actually viewing comments is handled in getBlogById)
router.post("/:blogId/comments", addComment);
router.get("/:blogId/comments", getBlogComments);

// Protected routes (admin only)
router.post("/", adminProtect, createBlog);
router.put("/:id", adminProtect, updateBlog);
router.delete("/:id", adminProtect, deleteBlog);
router.patch("/:id/feature", adminProtect, toggleFeatured);

module.exports = router;