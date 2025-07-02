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

// Middleware to update `updatedAt` field before each save
clientSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Client = mongoose.model('Client', clientSchema);

export default Client;
