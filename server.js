let express = require('express'),
    app = module.exports = express();

let session = require('express-session'),
    bodyParser = require('body-parser'),
    axios = require('axios'),
    massive = require('massive'),
    passport = require('passport'),
    AuthOStrategy = require('passport-auth0'),
    config = require('./.config'),
    cors = require('cors');
let massiveInstance = massive.connectSync({connectionString: 'postgres://awsuser:'+ config.dbpw +'@yoda235.c3zc3a3q4pvi.us-west-2.rds.amazonaws.com:5432/Bobfett'});

app.set('db', massiveInstance);
let db = app.get('db');
const mainCtrl = require('./mainCtrl');
app.use(bodyParser.json());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: config.secret
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

app.get('/api/rated', mainCtrl.getRated);

app.post('/api/addToFavs', mainCtrl.addToFavs);

app.get('/api/getDesc/:id', mainCtrl.getDesc);

app.get('/api/getUserVids/:user_id', mainCtrl.getUserVideos);

app.delete('/api/removeFromFavs/:user_id/:video_id', mainCtrl.removeFromFavs);

app.get('/api/getVideos/:search', mainCtrl.getVideos);

app.post('/api/changeRating', mainCtrl.changeRating);

passport.use(new AuthOStrategy({
        domain: config.auth0.domain,
        clientID: config.auth0.clientID,
        clientSecret: config.auth0.clientSecret,
        callbackURL: '/auth/callback'
    },
    (accessToken, refreshToken, extraParams, profile, done) =>{
        db.run(`select * from users
            where auth_id = $1`,[profile.id], (err, user)=>{
            user = user[0];
            if(!user){
                db.run(`insert into users (user_name, auth_id) 
                values ($1, $2) returning user_id, user_name, auth_id`,[profile.displayName, profile.id], (err, user)=>{
                console.log('user created', user);
                return done(err, user[0])
            })
            }else {
                return done(err, user);
            }
        })
    }
));

passport.serializeUser((userA, done) =>{
    let userB = userA;
    done(null, userB);
});

passport.deserializeUser((userB, done) =>{
    let userC = userB;
    done(null, userC);
});

app.get('/auth', passport.authenticate('auth0'));

app.get('/auth/callback',
    passport.authenticate('auth0', {successRedirect: '/#!/acct'}), (req, res)=>{
    res.status(200).send(req.user);
    });

app.get('/auth/me', (req, res)=>{
    if(!req.user){
        return res.sendStatus(404);
    }
    res.status(200).send(req.user);
});

app.get('/auth/logout', (req, res)=>{
   req.logout();
   res.redirect('/')
});

app.listen(3000);