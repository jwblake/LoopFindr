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
    var url = req.body.url.toString();
    var hostString = url.match(/(\.).*(\.)/)[0];
    var host = hostString.substring(1, hostString.length - 1);
    var timesQueried = 1;
    var lastQuery = new Date();

    // Set our collection
    var collection = db.get('videocollection');
    collection.findOne({"url" : url}, function(err, videoTableItem) {
    	if (err) {
    		console.log("MongoDB Error: " + err);
    	}
    	if (!videoTableItem) {
    		// Submit to the DB
    		console.log("inserting");
    		collection.insert({
        		"url" : url,
        		"host" : host,
        		"timesQueried" : timesQueried,
        		"lastQuery" : lastQuery
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

    	} else {
    		console.log("Video " + url + " already loaded");
    		timesQueried = videoTableItem.timesQueried + 1;
    		collection.update(
    			{"url" : url},
    			{
    				"url" : url,
    				"host" : host,
    				"timesQueried" : timesQueried, 
    				"lastQuery" : lastQuery}
    		);
    		res.location("videolist");
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
