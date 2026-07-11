const express = require('express');
const router = express.Router();
const { getRecords, createRecord, updateRecord, deleteRecord, exportRecords } = require('../controllers/record.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', getRecords);
router.get('/export', exportRecords);
router.post('/', createRecord);
router.put('/:id', updateRecord);
router.delete('/:id', deleteRecord);

module.exports = router;
