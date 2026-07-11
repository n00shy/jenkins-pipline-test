const Activity = require('../models/activity.model');

const getActivities = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const query = req.user.role !== 'admin' ? { user: req.user._id } : {};

    const [activities, total] = await Promise.all([
      Activity.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit)),
      Activity.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: { activities, pagination: { total, page: parseInt(page), limit: parseInt(limit) } }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getActivities };
