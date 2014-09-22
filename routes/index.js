var express = require('express');
var router = express.Router();


/* GET New Video page. */
router.get('/', function(req, res) {
    res.render('newvideo', { title: 'Add New Video' });
});


/* POST to Add Video Service */
router.post('/addvideo', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var url = req.body.url;
    // VAR HOST = 
    // VAR TIMES QUERIED = 
    // VAR LAST QUERY = 

    // Set our collection
    var collection = db.get('videocollection');

    // Submit to the DB
    collection.insert({
        "url" : url
        // host, times queried, last query
    }, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // If it worked, set the header so the address bar doesn't still say /adduser
            res.location("videolist");
            // And forward to success page
            res.redirect("videolist");
        }
    });
});

/* GET Video list page. */
router.get('/videolist', function(req, res) {
	var db = req.db;
	var collection = db.get('videocollection');
	collection.find({},{},function(e,docs){
		res.render('videolist', {
			"videolist" : docs
		});
	});
});

module.exports = router;
