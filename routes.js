const express = require('express');
const scrapperController = require('./controller');

const router = express.Router();

router.post('/most-watch', scrapperController.getMostWatchRoom);
router.post('/premium-lives', scrapperController.getPremiumLiveHistory);

module.exports = router;
