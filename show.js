var util = require('util');
var notesdb = require('./notesdb-sqlite3');

notesdb.connect(function(error){
	if (error) throw error;
});

notesdb.forAll(
	function(error, row){
		util.log("ROW :" + util.inspect(row));	
	},
	function(error){
		if (error) throw error;
		util.log("All DONE");
		notesdb.disconnect(function(err){});
	}
);