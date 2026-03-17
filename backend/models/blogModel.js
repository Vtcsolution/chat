const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, "Please add content"],
    },
    excerpt: {
      type: String,
      required: [true, "Please add an excerpt"],
      maxlength: [500, "Excerpt cannot exceed 500 characters"],
    },
    category: {
      type: String,
      required: [true, "Please select a category"],
      enum: {
        values: [
          "tarto",
          "love",
          "reading",
          "family",
          "career",
          "health",
          "spirituality",
          "dreams",
          "numerology",
          "astrology"
        ],
        message: "Please select a valid category",
      },
    },
    featuredImage: {
      type: String,
      default: "",
    },
    images: [
      {
        type: String,
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    metaTitle: {
      type: String,
      maxlength: [60, "Meta title cannot exceed 60 characters"],
    },
    metaDescription: {
      type: String,
      maxlength: [160, "Meta description cannot exceed 160 characters"],
    },
    metaKeywords: {
      type: String,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    readingTime: {
      type: Number, // in minutes
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    allowComments: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for comments
blogSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "blog",
  options: { sort: { createdAt: -1 } },
});

// Calculate reading time before saving
blogSchema.pre("save", function (next) {
  if (this.content) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / wordsPerMinute);
  }
  
  // Set publishedAt when blog is published
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = Date.now();
  }
  
  // Generate slug from title if not provided
  if (this.isModified("title") && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
  
  next();
});

// Index for search
blogSchema.index({ title: "text", content: "text", excerpt: "text", tags: "text" });

module.exports = mongoose.model("Blog", blogSchema);