import mongoose from 'mongoose';

const styleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Style name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Style category is required'],
      trim: true,
      enum: ['Traditional', 'Wedding', 'Casual', 'Corporate', 'Evening Wear', 'Other'], // Example categories
    },
    imageUrl: {
      type: String,
      required: [true, 'Style image URL is required'],
    },
    cloudinaryPublicId: { // To store the public_id from Cloudinary for deletion
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // Reference to clients who have this style linked (many-to-many relationship)
    // This might be more useful if styles are generic and can be linked to multiple clients.
    // If a style is unique per client order, this might not be needed or designed differently.
    // For now, assuming styles can be inspirations used across multiple clients.
    clients: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    }],
    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Indexes for frequently queried fields
styleSchema.index({ category: 1 }); // For filtering by category
styleSchema.index({ name: 1 }); // For regex search on name
// styleSchema.index({ name: 'text' }); // If using $text search for name
// Middleware to update `updatedAt` field before each save
styleSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Style = mongoose.model('Style', styleSchema);

export default Style;