import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
      validate: {
        validator: function (v) {
          try {
            new URL(v);
            return true;
          } catch (error) {
            return false;
          }
        },
        message: 'Invalid URL format',
      },
    },
    shortCode: {
      type: String,
      unique: true,
      required: [true, 'Short code is required'],
      index: true,
      uppercase: true,
    },
    clicks: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index on userId for efficient user URL retrieval
urlSchema.index({ userId: 1, createdAt: -1 });

export const Url = mongoose.model('Url', urlSchema);
export default Url;
