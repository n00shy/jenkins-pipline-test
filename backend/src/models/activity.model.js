const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: { type: String, required: true },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT'],
    required: true
  },
  resource: { type: String, required: true }, // e.g. 'record', 'user'
  resourceId: { type: String },
  details: { type: String },
  ip: { type: String }
}, {
  timestamps: true
});

activitySchema.index({ createdAt: -1 });
activitySchema.index({ user: 1 });

module.exports = mongoose.model('Activity', activitySchema);
