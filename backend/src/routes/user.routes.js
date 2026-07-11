const express = require('express');
const router = express.Router();
const { getUsers, toggleUserStatus, updateUserRole } = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect, authorize('admin'));

router.get('/', getUsers);
router.patch('/:id/toggle-status', toggleUserStatus);
router.patch('/:id/role', updateUserRole);

module.exports = router;
