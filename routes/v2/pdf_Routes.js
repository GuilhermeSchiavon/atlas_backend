require('dotenv').config();
const router = require('express').Router();
const path = require('path');

router.get('/', (req, res) => {
    const fileName = req.query.fileName + '.pdf';
    const pdfFilePath = path.join(__dirname, '../../uploads/pdf/', fileName);

    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'inline');

    res.sendFile(pdfFilePath);
});

module.exports = router