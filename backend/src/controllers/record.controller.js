const Record = require('../models/record.model');
const Activity = require('../models/activity.model');

// ─── Get all records with search, filter, pagination ─────────────────────────
const getRecords = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Full-text search
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status && ['active', 'inactive', 'pending'].includes(status)) {
      query.status = status;
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Role-based: users see only their records, admins see all
    if (req.user.role !== 'admin') {
      query.createdBy = req.user._id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [records, total] = await Promise.all([
      Record.find(query)
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Record.countDocuments(query)
    ]);

    // Stats
    const stats = await Record.aggregate([
      { $match: req.user.role !== 'admin' ? { createdBy: req.user._id } : {} },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        records,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        },
        stats
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── Create record ────────────────────────────────────────────────────────────
const createRecord = async (req, res, next) => {
  try {
    const record = await Record.create({ ...req.body, createdBy: req.user._id });

    await Activity.create({
      user: req.user._id,
      userName: req.user.name,
      action: 'CREATE',
      resource: 'record',
      resourceId: record._id.toString(),
      details: `Created record: ${record.fullName}`
    });

    res.status(201).json({ success: true, message: 'Record created successfully.', data: record });
  } catch (error) {
    next(error);
  }
};

// ─── Update record ────────────────────────────────────────────────────────────
const updateRecord = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin') query.createdBy = req.user._id;

    const record = await Record.findOneAndUpdate(query, req.body, {
      new: true,
      runValidators: true
    });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found or access denied.' });
    }

    await Activity.create({
      user: req.user._id,
      userName: req.user.name,
      action: 'UPDATE',
      resource: 'record',
      resourceId: record._id.toString(),
      details: `Updated record: ${record.fullName}`
    });

    res.json({ success: true, message: 'Record updated successfully.', data: record });
  } catch (error) {
    next(error);
  }
};

// ─── Delete record ────────────────────────────────────────────────────────────
const deleteRecord = async (req, res, next) => {
  try {
    const query = { _id: req.params.id };
    if (req.user.role !== 'admin') query.createdBy = req.user._id;

    const record = await Record.findOneAndDelete(query);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found or access denied.' });
    }

    await Activity.create({
      user: req.user._id,
      userName: req.user.name,
      action: 'DELETE',
      resource: 'record',
      resourceId: record._id.toString(),
      details: `Deleted record: ${record.fullName}`
    });

    res.json({ success: true, message: 'Record deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// ─── Export records as CSV data ───────────────────────────────────────────────
const exportRecords = async (req, res, next) => {
  try {
    const query = req.user.role !== 'admin' ? { createdBy: req.user._id } : {};
    const records = await Record.find(query).sort({ createdAt: -1 });

    await Activity.create({
      user: req.user._id,
      userName: req.user.name,
      action: 'EXPORT',
      resource: 'record',
      details: `Exported ${records.length} records`
    });

    res.json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRecords, createRecord, updateRecord, deleteRecord, exportRecords };
