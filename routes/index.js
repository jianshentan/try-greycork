var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.mobile);
  if (req.mobile == true) {
    res.render('m-index', { mobile: "true" });
  } else {
    res.render('m-index', { mobile: "false" });
  }
});

module.exports = router;
