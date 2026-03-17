const express = require("express");
const router = express.Router();
const {
  approveComment,
  deleteComment,
  getAllComments,
  likeComment,
} = require("../controllers/commentController");
const { adminProtect } = require("../middleware/adminProtect");

// Public route
router.post("/:id/like", likeComment);

// Admin routes
router.get("/admin", adminProtect, getAllComments);
router.patch("/:id/approve", adminProtect, approveComment);
router.delete("/:id", adminProtect, deleteComment);

module.exports = router;