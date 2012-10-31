var util = require('util');
var async = require('async');

var notesdb = require('./notesdb-sqlite3');

notesdb.connect(function(error){
	if (error) throw error;
});

notesdb.setup(function(error){
	if (error){
		util.log(" ERROR " + error);
		throw error;
	}

	async.series(
		[
			function(cb){
				notesdb.add(
					"Lorem ipsum", "Cras ornare lobortis ante, vel dapibus magna consequat a. Donec eget nisi sapien. Curabitur tincidunt euismod risus. Quisque non quam aliquam neque",
					function(error){
						if (error) util.log(" ERROR " + error);
						cb(error);
					}
				);	
			},
			function(cb){
				notesdb.add(
					"Aliquam", " Fusce orci turpis, consequat non vulputate vitae, molestie quis odio. Suspendisse placerat mattis ullamcorper.",
					function(error){
						if (error) util.log(" ERROR " + error);
						cb(error);
					}
				);	
			},
			function(cb){
				notesdb.add(
					"lobortis ante", "Ut vehicula tempus tortor ut ullamcorper. Aliquam orci libero, faucibu",
					function(error){
						if (error) util.log(" ERROR " + error);
						cb(error);
					}
				);	
			},
			
		],
		function(error, results){
			if (error) util.log(" ERROR " + error);
			notesdb.disconnect(function(err){});
		}
	);
});