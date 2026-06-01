import { nanoid } from 'nanoid';
import Url from '../models/Url.js';

/**
 * Create a short URL
 * POST /api/urls
 */
export const createShortUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!originalUrl) {
      return res.status(400).json({
        success: false,
        message: 'Original URL is required',
      });
    }

    // Validate URL format
    try {
      new URL(originalUrl);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid URL format',
      });
    }

    // Generate unique short code
    const shortCode = nanoid(8);

    // Create URL document
    const url = new Url({
      userId,
      originalUrl,
      shortCode,
    });

    await url.save();

    res.status(201).json({
      success: true,
      message: 'Short URL created successfully',
      data: {
        id: url._id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: `${process.env.BASE_URL || 'http://localhost:5000'}/${url.shortCode}`,
        clicks: url.clicks,
        createdAt: url.createdAt,
      },
    });
  } catch (error) {
    console.error('CREATE_URL_ERROR:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create short URL',
    });
  }
};

/**
 * Get user's URLs
 * GET /api/urls
 */
export const getUserUrls = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user's URLs sorted by most recent
    const urls = await Url.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'URLs retrieved successfully',
      data: urls.map((url) => ({
        id: url._id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: `${process.env.BASE_URL || 'http://localhost:5000'}/${url.shortCode}`,
        clicks: url.clicks,
        createdAt: url.createdAt,
      })),
      total: urls.length,
    });
  } catch (error) {
    console.error('GET_URLS_ERROR:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve URLs',
    });
  }
};

/**
 * Delete a URL
 * DELETE /api/urls/:id
 */
export const deleteUrl = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find URL
    const url = await Url.findById(id);

    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found',
      });
    }

    // Check ownership
    if (url.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this URL',
      });
    }

    // Delete URL
    await Url.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'URL deleted successfully',
      data: {
        id: url._id,
        shortCode: url.shortCode,
      },
    });
  } catch (error) {
    console.error('DELETE_URL_ERROR:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete URL',
    });
  }
};

/**
 * Redirect to original URL
 * GET /:shortCode
 */
export const redirectUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Find URL by short code
    const url = await Url.findOneAndUpdate(
      { shortCode: shortCode.toUpperCase() },
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'Short URL not found',
      });
    }

    // Redirect to original URL
    res.redirect(301, url.originalUrl);
  } catch (error) {
    console.error('REDIRECT_URL_ERROR:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to redirect',
    });
  }
};
