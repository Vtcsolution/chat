const Blog = require("../models/blogModel");
const Comment = require("../models/commentModel");
const mongoose = require("mongoose");

// @desc    Create a new blog
// @route   POST /api/blogs
// @access  Private/Admin
const createBlog = async (req, res) => {
  try {
    console.log("=".repeat(50));
    console.log("📝 CREATE BLOG REQUEST RECEIVED");
    console.log("=".repeat(50));
    
    // Log the entire request body
    console.log("📦 Request Body:", JSON.stringify(req.body, null, 2));
    
    // Log admin info
    console.log("👤 Admin User:", req.admin ? {
      id: req.admin._id,
      email: req.admin.email,
      name: req.admin.name
    } : "No admin found");
    
    // Check if admin exists
    if (!req.admin) {
      console.log("❌ No admin found in request");
      return res.status(401).json({ message: "Not authorized - admin not found" });
    }

    const { 
      title, 
      content, 
      excerpt, 
      category, 
      tags, 
      featuredImage, 
      images, 
      metaTitle, 
      metaDescription, 
      metaKeywords, 
      isPublished, 
      isFeatured, 
      allowComments 
    } = req.body;

    // Validate required fields
    const requiredFields = { title, content, excerpt, category, featuredImage };
    const missingFields = [];
    
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value || (typeof value === 'string' && !value.trim())) {
        missingFields.push(field);
        console.log(`❌ Missing required field: ${field}`);
      }
    }

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    console.log("🔗 Generated slug:", slug);

    // Check if blog with same slug exists
    const blogExists = await Blog.findOne({ slug });
    if (blogExists) {
      console.log("❌ Blog with this slug already exists:", slug);
      return res.status(400).json({ message: "Blog with this title already exists" });
    }

    // Process tags
    let processedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        processedTags = tags;
      } else if (typeof tags === 'string') {
        processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
    }
    console.log("🏷️ Processed tags:", processedTags);

    // Prepare blog data
    const blogData = {
      title: title.trim(),
      slug,
      content,
      excerpt: excerpt.trim(),
      category,
      featuredImage,
      images: images || [],
      author: req.admin._id,
      authorName: req.admin.name || req.admin.email,
      tags: processedTags,
      metaTitle: metaTitle?.trim() || title.substring(0, 60),
      metaDescription: metaDescription?.trim() || excerpt.substring(0, 160),
      metaKeywords: metaKeywords?.trim() || "",
      isPublished: isPublished || false,
      isFeatured: isFeatured || false,
      allowComments: allowComments !== undefined ? allowComments : true,
    };

    console.log("📊 Blog data to save:", JSON.stringify(blogData, null, 2));

    // Try to create the blog
    console.log("💾 Attempting to save blog to database...");
    const blog = await Blog.create(blogData);
    console.log("✅ Blog saved successfully with ID:", blog._id);

    res.status(201).json({
      success: true,
      data: blog,
    });

  } catch (error) {
    console.error("❌ ERROR IN CREATE BLOG:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    
    // Log mongoose validation errors
    if (error.name === 'ValidationError') {
      console.error("Validation errors:");
      const errors = {};
      for (let field in error.errors) {
        console.error(`- ${field}: ${error.errors[field].message}`);
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ 
        message: "Validation failed", 
        errors 
      });
    }
    
    // Log duplicate key error
    if (error.code === 11000) {
      console.error("Duplicate key error:", error.keyValue);
      return res.status(400).json({ 
        message: "Blog with this title already exists",
        field: Object.keys(error.keyValue)[0]
      });
    }

    // Log other errors
    console.error("Stack trace:", error.stack);
    
    res.status(500).json({ 
      message: error.message || "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


// @desc    Get all blogs with pagination and filters
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res) => {
  try {
    console.log("📥 GET /api/blogs - Fetching blogs");
    
    const { 
      page = 1, 
      limit = 10, 
      category, 
      search, 
      featured,
      sortBy = "createdAt",
      sortOrder = "desc",
      isPublished 
    } = req.query;

    // Build query
    const query = {};
    
    // Only filter by isPublished if explicitly provided
    if (isPublished !== undefined) {
      query.isPublished = isPublished === 'true';
    }

    // Filter by category
    if (category && category !== 'all' && category !== 'undefined') {
      query.category = category;
    }

    // Filter featured blogs
    if (featured === "true") {
      query.isFeatured = true;
    }

    // Search functionality
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    console.log("🔍 Query:", JSON.stringify(query));

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Fetch blogs
    const blogs = await Blog.find(query)
      .populate("author", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count
    const total = await Blog.countDocuments(query);

    console.log(`✅ Found ${blogs.length} blogs (total: ${total})`);

    // Return in the format your frontend expects
    res.json({
      success: true,
      data: blogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      }
    });

  } catch (error) {
    console.error("❌ Error in getBlogs:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
// In your blogController.js
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🔍 Looking for blog with ID:", id);
    
    let blog;
    
    // Try to find by _id first
    if (mongoose.Types.ObjectId.isValid(id)) {
      blog = await Blog.findById(id)
        .populate("author", "name email")
        .lean(); // Use .lean() to get plain JavaScript object
    }
    
    // If not found, try by slug
    if (!blog) {
      blog = await Blog.findOne({ slug: id })
        .populate("author", "name email")
        .lean();
    }

    if (!blog) {
      console.log("❌ Blog not found with ID:", id);
      return res.status(404).json({ 
        success: false, 
        message: "Blog not found" 
      });
    }

    console.log("✅ Blog found:", blog.title);
    
    // Convert _id to string if it's not already
    if (blog._id && typeof blog._id !== 'string') {
      blog._id = blog._id.toString();
    }

    // Increment views
    blog.views = (blog.views || 0) + 1;
    await Blog.findByIdAndUpdate(blog._id, { views: blog.views });

    res.json({
      success: true,
      data: blog
    });

  } catch (error) {
    console.error("❌ Error in getBlogById:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private/Admin
const updateBlog = async (req, res) => {
  try {
    console.log("=".repeat(50));
    console.log("📝 UPDATE BLOG REQUEST");
    console.log("=".repeat(50));
    
    const { id } = req.params;
    console.log("📌 Blog ID:", id);
    
    console.log("👤 Admin:", req.admin ? {
      id: req.admin._id,
      email: req.admin.email,
      name: req.admin.name
    } : "No admin found");

    console.log("📦 Request body:", JSON.stringify(req.body, null, 2));

    // Check if blog exists
    let blog = await Blog.findById(id);
    
    if (!blog) {
      console.log("❌ Blog not found with ID:", id);
      return res.status(404).json({ 
        success: false, 
        message: "Blog not found" 
      });
    }

    console.log("✅ Found blog:", blog.title);

    const { 
      title, 
      content, 
      excerpt, 
      category, 
      tags, 
      featuredImage, 
      images, 
      metaTitle, 
      metaDescription, 
      metaKeywords, 
      isPublished, 
      isFeatured, 
      allowComments 
    } = req.body;

    // Prepare update data
    let updateData = { ...req.body };

    // Update slug if title changes
    if (title && title !== blog.title) {
      updateData.slug = title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      console.log("🔄 Slug updated:", updateData.slug);
    }

    // Process tags if they're a string (from form input)
    if (tags && typeof tags === 'string') {
      updateData.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      console.log("🏷️ Processed tags:", updateData.tags);
    } else if (Array.isArray(tags)) {
      updateData.tags = tags;
    }

    // Set publishedAt when publishing for first time
    if (isPublished && !blog.isPublished && !blog.publishedAt) {
      updateData.publishedAt = new Date();
      console.log("📅 Setting publishedAt:", updateData.publishedAt);
    }

    console.log("🔄 Updating blog with data:", JSON.stringify(updateData, null, 2));

    // Update the blog
    const updatedBlog = await Blog.findByIdAndUpdate(
      id, 
      updateData, 
      { 
        new: true,  // Return the updated document
        runValidators: true  // Run schema validators
      }
    ).populate("author", "name email");

    if (!updatedBlog) {
      console.log("❌ Update failed - blog not found after update");
      return res.status(404).json({ 
        success: false, 
        message: "Blog not found after update" 
      });
    }

    console.log("✅ Blog updated successfully:");
    console.log("   Title:", updatedBlog.title);
    console.log("   Published:", updatedBlog.isPublished);
    console.log("   Featured:", updatedBlog.isFeatured);
    console.log("   Updated at:", updatedBlog.updatedAt);

    res.json({
      success: true,
      data: updatedBlog,
      message: "Blog updated successfully"
    });

  } catch (error) {
    console.error("❌ ERROR IN UPDATE BLOG:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    
    // Log mongoose validation errors
    if (error.name === 'ValidationError') {
      console.error("Validation errors:");
      const errors = {};
      for (let field in error.errors) {
        console.error(`- ${field}: ${error.errors[field].message}`);
        errors[field] = error.errors[field].message;
      }
      return res.status(400).json({ 
        success: false,
        message: "Validation failed", 
        errors 
      });
    }
    
    // Log duplicate key error
    if (error.code === 11000) {
      console.error("Duplicate key error:", error.keyValue);
      return res.status(400).json({ 
        success: false,
        message: "Blog with this title already exists",
        field: Object.keys(error.keyValue)[0]
      });
    }

    // Log other errors
    console.error("Stack trace:", error.stack);
    
    res.status(500).json({ 
      success: false,
      message: error.message || "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Delete all comments associated with this blog
    await Comment.deleteMany({ blog: id });

    await blog.deleteOne();

    res.json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like a blog
// @route   POST /api/blogs/:id/like
// @access  Public
const likeBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    blog.likes += 1;
    await blog.save();

    res.json({
      success: true,
      likes: blog.likes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle featured status
// @route   PATCH /api/blogs/:id/feature
// @access  Private/Admin
const toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    blog.isFeatured = !blog.isFeatured;
    await blog.save();

    res.json({
      success: true,
      isFeatured: blog.isFeatured,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get blog statistics
// @route   GET /api/blogs/stats
// @access  Private/Admin
const getBlogStats = async (req, res) => {
  try {
    const stats = await Blog.aggregate([
      {
        $group: {
          _id: null,
          totalBlogs: { $sum: 1 },
          totalPublished: {
            $sum: { $cond: ["$isPublished", 1, 0] },
          },
          totalViews: { $sum: "$views" },
          totalLikes: { $sum: "$likes" },
          avgViews: { $avg: "$views" },
        },
      },
    ]);

    const categoryStats = await Blog.aggregate([
      { $match: { isPublished: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalViews: { $sum: "$views" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const recentBlogs = await Blog.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title views likes createdAt");

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalBlogs: 0,
          totalPublished: 0,
          totalViews: 0,
          totalLikes: 0,
          avgViews: 0,
        },
        categories: categoryStats,
        recentBlogs,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  likeBlog,
  toggleFeatured,
  getBlogStats,
};