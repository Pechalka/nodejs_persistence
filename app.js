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
app.use(express.cookieParser());

app.set('view engine', 'ejs');
app.engine('.html', engine);
app.locals({
  _layoutFile: true
});

var checkAccess = function(req, res, next){
	if (!req.cookies || !req.cookies.notesaccess || req.cookies.notesaccess !== 'AOK'){
		res.redirect('/login');
	} else {
		next();
	}
}



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

app.get('/login', function(req, res){

	res.render('login.html',{
		title : 'Notes login (' + nmDbEngine  + ' ) '
	});
});

app.post('/login', function(req, res){
	res.cookie('notesaccess', 'AOK', { maxAge: 900000, httpOnly: false});
	res.redirect('/view');
});

app.get('/', checkAccess, function(req, res){
	util.log('test1');

	res.redirect('/view');
});

app.get('/view', checkAccess, function(req, res){
	util.log('test2');
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

app.get('/add', checkAccess, function(req, res){
	res.render('addedit.html', {
		title : "Notes ( " + nmDbEngine + " )",
		postpath : '/add',
		note: notesdb.emptyNote
	});
});

app.post('/add', checkAccess, function(req, res){
	notesdb.add(
		req.body.author, 
		req.body.note,
		function(error){
			if (error) throw error;
			res.redirect('/view');
		}
	);
});

app.get('/del', checkAccess,  parseUrlParams, function(req, res){
	notesdb.delete(
		req.urlP.query.id,
		function(error){
			if (error) throw error;
			res.redirect('/view');
		}
	);
});

app.get('/edit', checkAccess, parseUrlParams, function(req, res){
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

app.post('/edit', checkAccess, function(req, res){
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
