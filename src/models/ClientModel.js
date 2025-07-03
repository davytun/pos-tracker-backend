import mongoose from 'mongoose';

const measurementSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., 'Bust', 'Waist', 'Hip', 'Sleeve Length'
  value: { type: String, required: true }, // e.g., '34 inches', '86 cm'
}, { _id: false });

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Client phone number is required'],
      trim: true,
      // Basic phone validation, can be enhanced
      match: [/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, 'Please fill a valid phone number'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'Please fill a valid email address'],
    },
    eventType: {
      type: String,
      trim: true,
    },
    measurements: [measurementSchema],
    // Reference to styles associated with this client
    styles: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Style',
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
// clientSchema.index({ name: 'text', eventType: 'text' }); // Text index is for $text operator, not regex
clientSchema.index({ name: 1 }); // For queries on name. Regex can use this.
clientSchema.index({ eventType: 1 }); // For queries on eventType. Regex can use this.
clientSchema.index({ phone: 1 }); // If phone lookups become common (e.g., for uniqueness or search)
clientSchema.index({ styles: 1 }); // Index for the styles array for $pull operations

// Middleware to update `updatedAt` field before each save
clientSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Client = mongoose.model('Client', clientSchema);

export default Client;