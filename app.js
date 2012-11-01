var util = require('util');
var url = require('url');
var express = require('express');
var nmDbEngine = 'mongoose';
//'sqlite3';
var engine =	require('ejs-locals');

var notesdb = require('./notesdb-' + nmDbEngine);
var app = express();
app.use(express.logger());
app.use(express.bodyParser());

app.set('view engine', 'ejs');
app.engine('.html', engine);
app.locals({
  _layoutFile: true
});


app.set('views', __dirname + '/views-' + nmDbEngine);

var parseUrlParams = function(req, res, next){
	req.urlP = url.parse(req.url, true);
	next();
}

notesdb.connect(function(error){
	if (error) throw error;
});

app.on('close', function(error){
	notesdb.disconnect(function(err){ });
});

app.get('/', function(req, res){
	res.redirect('/view');
});

app.get('/view', function(req, res){
	notesdb.allNotes(function(err, notes){
		if (err){
			util.log(' ERROR ' + err);
			throw err;
		} else {
			res.render('viewnotes.html', {
				title : "Notes ( " + nmDbEngine + " )",
				notes : notes
			});
		}
	});
})

app.get('/add', function(req, res){
	res.render('addedit.html', {
		title : "Notes ( " + nmDbEngine + " )",
		postpath : '/add',
		note: notesdb.emptyNote
	});
});

app.post('/add', function(req, res){
	notesdb.add(
		req.body.author, 
		req.body.note,
		function(error){
			if (error) throw error;
			res.redirect('/view');
		}
	);
});

app.get('/del', parseUrlParams, function(req, res){
	notesdb.delete(
		req.urlP.query.id,
		function(error){
			if (error) throw error;
			res.redirect('/view');
		}
	);
});

app.get('/edit', parseUrlParams, function(req, res){
	notesdb.findNoteById(
		req.urlP.query.id,
		function(error, note){
			if (error) throw error;
			res.render('addedit.html', {
				title : "Notes ( " + nmDbEngine + " )",
				postpath : '/edit',
				note : note
			});
		}
	);
});

app.post('/edit', function(req, res){
	notesdb.edit(
		req.body.id, 
		req.body.author,
		req.body.note,
		function(error){
			if (error) throw error;
			res.redirect('/view');
		}
	);
});

app.listen(3000);
