var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (req.mobile == true) {
    res.render('m-index', { mobile: "true" });
  } else {
    res.render('index', { mobile: "false" });
  }
});

router.get('/privacy', function(req, res, next) {
  if (req.mobile == true) {
    res.render('privacy', { mobile: 'true' });
  } else {
    res.render('privacy', { mobile: 'false' });
  }
});

module.exports = router;
