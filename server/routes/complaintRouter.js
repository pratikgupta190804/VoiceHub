const express = require('express');
const { submitComplaint, getUserComplaints, getComplaintById } = require('../controllers/complaintController');
const { checkUser } = require('../middlewares/checkUser');
const uploadMemory = require('../middlewares/multerUpload');

const complaintRouter = express.Router();

// Submit a new complaint with multiple media files
complaintRouter.post('/submit', checkUser, uploadMemory.array('media', 10), submitComplaint);

// Get all complaints for the current user
complaintRouter.get('/user', checkUser, getUserComplaints);

// Get a specific complaint by ID
complaintRouter.get('/:id', checkUser, getComplaintById);

module.exports = complaintRouter;