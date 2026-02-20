const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

// Upload images — returns URL list
router.post('/', protect, upload.array('images', 5), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    const urls = req.files.map(
        (file) => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
    );
    res.status(200).json({ success: true, urls });
});

module.exports = router;
