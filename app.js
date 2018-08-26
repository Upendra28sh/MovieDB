var Request = require("request");
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/moviesite", { useNewUrlParser: true });


var routes = require('./routes/index');
var users = require('./routes/users')



var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(__dirname + "/public"));
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));
app.use(passport.initialize());
app.use(passport.session());


app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));
app.use(flash());
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});
app.use('/', routes);
app.use('/users', users);


app.post('/get', function (req, res) {

    var query = req.body.name;
    console.log(query);




    var arr = query.split(" ");
    var result = "";
    for (var i = 0; i < arr.length; i++) {
        if (i < arr.length - 1) {
            result += arr[i] + "+"
        }
        else {

            result += arr[i];
        }
    }




    Request.get("https://api.themoviedb.org/3/search/movie?api_key=2b6f6b0f9f52bbfa3376c020de4832e3&query=" + result, (error, response, body) => {
        if (error) {
            return console.dir(error);
        }

        var found = JSON.parse(body);
        //  console.log(tvshows.results[0].title);
        res.render('index.ejs', { movies: found })


    })


})

app.post('/getmov', function (req, res) {
    var e = req.body.movnm;
    Request.get("https://api.themoviedb.org/3/movie/" + e + "?api_key=2b6f6b0f9f52bbfa3376c020de4832e3", (error, response, body) => {
        if (error) {
            return console.dir(error);
        }
        var selected = JSON.parse(body);
        //console.dir(body);
        Request.get("https://api.themoviedb.org/3/movie/" + e + "?api_key=2b6f6b0f9f52bbfa3376c020de4832e3&append_to_response=videos", (error, response, body) => {
            if (error) {
                return console.dir(error);
            }
            var trailer = JSON.parse(body);
            //console.dir(body);
            res.render('show.ejs', { item: selected, trailer: trailer })
        })
    })
})


app.get('/tvshows', function (req, res) {

    Request.get("https://api.themoviedb.org/3/tv/popular?api_key=2b6f6b0f9f52bbfa3376c020de4832e3" + "&page=" + req.params.id, (error, response, body) => {
        if (error) {
            return console.dir(error);
        }

        var tvshows = JSON.parse(body);
        console.log(tvshows.results[0].title);
        res.render('index.ejs', { movies: tvshows })


    })




});






app.get('/:id', function (req, res) {
    Request.get("https://api.themoviedb.org/4/list/1?api_key=2b6f6b0f9f52bbfa3376c020de4832e3" + "&page=" + req.params.id, (error, response, body) => {
        if (error) {
            return console.dir(error);
        }

        var e = JSON.parse(body);
        // console.log(e.results[0].title);
        res.render('index.ejs', { movies: e })

    });
}
)

///auth now on

app.listen(3030);