let app = require('./server');
const axios = require('axios');
const config = require('./.config');
const db = app.get('db');

module.exports = {
    getDesc : (req, res, next)=>{
        axios.get('https://www.googleapis.com/youtube/v3/videos', {
            params: {
                key: config.pw,
                id: req.params.id,
                part: 'snippet,statistics',
                fields: 'items/snippet/description,items/snippet/tags,items/statistics/viewCount'
            }
        }).then(result => {
            res.json({snippet:result.data.items[0].snippet,views:result.data.items[0].statistics.viewCount});
        });
    },

    getVideos: (req, res, next)=> {
        let vidIds = [];
        let current = {};
        axios.get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                    key: config.pw,
                    type: 'video',
                    order: 'viewCount',
                    maxResults: '10',
                    pageToken: req.query.nextPage ? req.query.nextPage : '',
                    part: 'snippet,id',
                    fields: 'items/id,nextPageToken,items/snippet/channelTitle,items/snippet/title, items/snippet/publishedAt',
                    q: req.params.search
                }
            }).then(response => {
                db.run('SELECT DISTINCT video_id, rating, dis from videos', (err, result) =>{
                    let data = response.data.items;
                        for(let i = 0; i < data.length; i++) {
                            if(result.length > 0) {
                                for (let j = 0; j < result.length; j++) {
                                    if (data[i].id.videoId === result[j]['video_id']) {
                                        current.rate = result[j]['rating'];
                                        current.dis = result[j]['dis'];
                                        break;
                                    }else {
                                        current.rate = 0;
                                        current.dis = 0;
                                    }
                                }
                            }else {
                                current.rate = 0;
                                current.dis = 0;
                            }
                            vidIds.push({
                                video_id: data[i].id.videoId,
                                rating: current.rate,
                                dis: current.dis,
                                snippet: {
                                    title: data[i].snippet.title,
                                    channel: data[i].snippet.channelTitle,
                                    date: data[i].snippet.publishedAt,
                                    // dateFixed:data[i].snippet.publishedAt.replace(/-+/g, '').slice(0,8)
                                }
                            });
                        }
                    res.json({
                        nextPage: response.data.nextPageToken,
                        videoIds: vidIds
                    })
                });
            })
    },

    changeRating: (req, res, next)=> {
            let str = req.body.str,
                user_id = req.body.user_id,
                vid = req.body.vid;
            //check to see if user has added a like or dislike
            db.run('select rating from rated where video_id = $1 and user_id = $2', [vid.video_id, user_id], (err, result)=> {
                //if user hasn't added a like or dislike then add the videoid and user to the table along with the correct like/dislike choice
                if (!result.length > 0 ) {
                    //if user hasn't rated video yet then check to see if video is in videos table
                    if (str === 'plus') {
                        db.run(`select * from videos where video_id = $1`, [vid.video_id], (err, result) => {
                            //if video isn't in videos table we need to insert it
                            if (!result.length > 0) {
                                db.run(`insert into videos (video_id, channel, date, 
                                    description, dis, rating, title, type, views, tags) values
                                    ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [vid.video_id, vid.snippet.channel, vid.snippet.date, vid.snippet.desc, 0,
                                    1, vid.snippet.title, vid.type, vid.snippet.views, vid.snippet.tags], (err, result) => {
                                    if (err) {
                                        console.log(err)
                                    }
                                    //after inserting it we need to update the rated table
                                    db.run(`insert into rated (user_id, video_id, rating)
                                            values ($1, $2, true)`, [user_id, vid.video_id], (err, result) => {
                                        res.json('added_l')
                                    })
                                })
                                //if video is in videos table already then we just update the rating then insert the rating into rated
                            } else {
                                db.run(`update videos
                                            set rating = rating +1
                                            where video_id = $1`, [vid.video_id], (err, result) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                                db.run(`insert into rated (user_id, video_id, rating)
                                        values($1, $2, true)`, [user_id, vid.video_id], (err, result) => {
                                    if(err){
                                        console.log(err)
                                    }
                                    res.json('added_l')
                                });

                            }

                        })
                    }else {
                        db.run(`select * from videos where video_id = $1`, [vid.video_id], (err, result) => {
                            //if video isn't in videos table we need to insert it
                            if (!result.length > 0) {
                                db.run(`insert into videos (video_id, channel, date, 
                                        description, dis, rating, title, type, views, tags) values
                                        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [vid.video_id, vid.snippet.channel, vid.snippet.date, vid.snippet.desc, 1,
                                    0, vid.snippet.title, vid.type, vid.snippet.views, vid.snippet.tags], (err, result) => {
                                    if (err) {
                                        console.log(err)
                                    }
                                    //after inserting it we need to update the rated table
                                    db.run(`insert into rated (user_id, video_id, rating)
                                                values ($1, $2, $3)`, [user_id, vid.video_id, false], (err, result) => {
                                        res.send('added_d')
                                    })
                                })
                                //if video is in videos table already then we just update the rating then insert the rating into rated
                            } else {
                                db.run(`update videos
                                                set dis = dis +1
                                                where video_id = $1`, [vid.video_id], (err, result) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                    res.send('added_d')
                                });
                                db.run(`insert into rated (user_id, video_id, rating)
                                                values($1, $2, $3)`, [user_id, vid.video_id, false], (err, result) => {
                                    res.end();
                                });

                            }

                        })
                    }
                }else {
                    //if user already liked video and pressed button again, they should receive already rated message
                    if(result[0].rating === true && str === 'plus'){
                       // console.log('already liked')
                        res.json('alreadyLiked')
                    }
                    //if user had already liked video and then pressed the dislike button, we need to update the tables
                    if(result[0].rating === true && str === 'dis'){
                        db.run(`UPDATE rated set rating = false where video_id = $1 and user_id = $2`,[vid.video_id, user_id], (err, result)=>{
                            //after updating rated table we update video table as well
                            db.run(`UPDATE videos
                                    set dis = dis +1,
                                    rating = rating - 1
                                    where video_id = $1`,[vid.video_id], (err, result)=>{
                                res.json('likeToDis')
                            })
                        })
                    }
                    //if the user had already disliked the video and then changed their mind, we need to update the tables
                    if(result[0].rating === false && str === 'plus'){
                        db.run(`UPDATE rated set rating = true where video_id = $1 and user_id = $2`,[vid.video_id, user_id], (err, result)=>{
                            //after updating rated table we update video table as well
                            db.run(`UPDATE videos
                                    set dis = dis - 1,
                                    rating = rating + 1
                                    where video_id = $1`,[vid.video_id], (err, result)=>{
                                res.json('disToLiked')
                            })
                        })
                    }
                    //if the user had already disliked the video and pressed the dislike button again, we send dislike message
                    if(result[0].rating === false && str === 'dis'){
                        //console.log('already disliked')
                        res.json('alreadyDisliked')
                    }
                }
            });
    },

    addToFavs: (req, res, next)=>{
        let vid = req.body.vid;
        //see if video is in the videos table
        db.run('select * from videos where video_id = $1',[vid.video_id],(err, result)=> {
            // if not then insert it into the videos table
            if(!result.length > 0){
                db.run(`insert into videos (video_id, channel, date, 
                        description, dis, rating, title, type, views, tags) values
                        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [vid.video_id, vid.snippet.channel, vid.snippet.date, vid.snippet.desc, vid.dis,
                        vid.rating, vid.snippet.title, vid.type, vid.snippet.views, vid.snippet.tags], (err, result)=>{
                    if(err){
                        console.log(err)
                    }
                    //after the video gets inserted we add it to the favorites table
                    db.run(`insert into favorites(user_id, video_id)
                            values ($1, $2)`, [req.body.user_id, req.body.vid.video_id], (err, result) => {
                        if (err) {
                            console.log(err)
                        }
                        console.log('added to favorites');
                        res.json('added to favs')
                    })
                })
            }else {
                db.run(`insert into favorites(user_id, video_id)
                        SELECT $1 , $2
                        where not exists
                        (SELECT user_id, video_id
                        from favorites
                        where user_id = $1 and video_id = $2)`, [req.body.user_id, req.body.vid.video_id], (err, result) => {
                    if (err) {
                        console.log(err)
                    }
                    res.json('was in videos so added to favs')
                })
            }
        })
    },

    removeFromFavs: (req, res, next)=>{
        db.run(`delete from favorites
                where user_id = $1 and video_id = $2`, [req.params.user_id, req.params.video_id], (err, result)=>{
            if(err){
                console.log(err)
            }
            console.log('deleted');
            res.json('deleted')
        })
    },

    getUserVideos: (req, res, next)=>{
        db.run(`select * from favorites f 
                join videos v on f.video_id = v.video_id
                where f.user_id = $1`, [req.params.user_id], (err, result)=>{
           if(err){
               console.log(err)
           }
           res.json(result);
        });
    },
    getRated: (req, res, next)=>{
        db.run(`select distinct v.video_id, v,channel, v.type, v.title, 
                v.description, v.rating, v.dis, v.date, v.views, v.tags from rated r
                join videos v on r.video_id = v.video_id`, (err, result)=>{
            res.json(result)
        })
    }
};
