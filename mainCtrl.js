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
            res.json({desc:{snippet:result.data.items[0].snippet,views:result.data.items[0].statistics.viewCount}});
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
                db.run('SELECT DISTINCT videoid, rating, dis from videos', (err, result) =>{
                    let data = response.data.items;
                        for(let i = 0; i < data.length; i++) {
                            if(result.length > 0) {
                                for (let j = 0; j < result.length; j++) {
                                    if (data[i].id.videoId === result[j]['videoid']) {
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
                                videoid: data[i].id.videoId,
                                rating: current.rate,
                                dis: current.dis,
                                snippet: {
                                    title:data[i].snippet.title,
                                    channel: data[i].snippet.channelTitle,
                                    date: data[i].snippet.publishedAt,
                                    dateFixed:data[i].snippet.publishedAt.replace(/-+/g, '').slice(0,8)
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
                userid = req.body.userid,
                video = req.body.vid.videoid,
                type = req.body.type,
                snip = req.body.snippet,
                cT = req.body.snippet.channel;
            //check to see if user has added a like or dislike
            db.run('select rated from rated where video_id = $1 and user_id = $2', [video, userid], (err, result)=> {
                //if user hasn't added a like or dislike then add the videoid and user to the table along with the correct like/dislike choice
                if (!result.length > 0 ) {
                    if (str === 'plus') {
                        db.run(`insert into rated (video_id, user_id, rated)
                            values ($1, $2, true)`, [video, userid], (err, result) => {
                            //after inserting into the rated table check to see if other users have rated this video
                            db.run('select distinct rating, dis from videos where videoid = $1', [video], (err, result) => {
                                //if other users haven't rated this video yet, then insert it into videos and set the rating to 1
                                if (!result.length > 0) {
                                    db.run(`insert into videos (videoid, rating, dis, type, info, channel) 
                                 values($1, $2, $3, $4, $5, $6)`, [video, 1, 0, type, snip, cT], (err, result) => {
                                        res.json('added_l');
                                    })
                                    //otherwise increment the rating
                                } else {
                                        db.run(`UPDATE videos
                                        SET rating = rating + 1,
                                        channel = $2
                                        WHERE videoid = $1`, [video, cT], (err, result) => {
                                            //console.log('updated videos, set rating +1');
                                            res.json('added_l')
                                        })
                                }
                            });
                        })
                    } else {
                        //else if str does not equal plus, then it must be a dislike
                        //so we'll do all some insert operations
                        db.run(`insert into rated (video_id, user_id, rated)
                            values ($1, $2, false)`, [video, userid], (err, result) => {
                            //after inserting into the rated table check to see if other users have rated this video
                            db.run('select distinct rating, dis from videos where videoid = $1', [video], (err, result) => {
                                //if other users haven't rated this video yet, then insert it into videos and set the rating to 0 and the dislike to 1
                                if (!result.length > 0) {
                                    db.run(`insert into videos (videoid, rating, dis, type, info, channel) 
                                 values($1, $2, $3, $4, $5, $6)`, [video, 0, 1, type, snip, cT], (err, result) => {
                                        res.json('added_d');
                                    })
                                    //otherwise check to see if it has a dislike or not
                                } else {
                                    //then increment just the dislike
                                        db.run(`UPDATE videos
                                        SET dis = dis + 1,
                                        channel = $2
                                        WHERE videoid = $1`, [video, cT], (err, result) => {
                                            res.json('added_d')
                                        })
                                }
                            });
                        })
                    }
                    //if the user has added a like or dislike already we need to check the value in the rated table
                } else {
                    //if user already liked video and pressed button again, they should receive already rated message
                    if(result[0].rated === true && str === 'plus'){
                       // console.log('already liked')
                        res.json('alreadyLiked')
                    }
                    //if user had already liked video and then pressed the dislike button, we need to update the tables
                    if(result[0].rated === true && str === 'dis'){
                        db.run(`UPDATE rated set rated = false where video_id = $1 and user_id = $2`,[video, userid], (err, result)=>{
                            //after updating rated table we update video table as well
                            db.run(`UPDATE videos
                                    set dis = dis +1,
                                    rating = rating - 1
                                    where videoid = $1`,[video], (err, result)=>{
                                res.json('likeToDis')
                            })
                        })
                    }
                    //if the user had already disliked the video and then changed their mind, we need to update the tables
                    if(result[0].rated === false && str === 'plus'){
                        db.run(`UPDATE rated set rated = true where video_id = $1 and user_id = $2`,[video, userid], (err, result)=>{
                            //after updating rated table we update video table as well
                            db.run(`UPDATE videos
                                    set dis = dis - 1,
                                    rating = rating + 1
                                    where videoid = $1`,[video], (err, result)=>{
                                res.json('disToLiked')
                            })
                        })
                    }
                    //if the user had already disliked the video and pressed the dislike button again, we send dislike message
                    if(result[0].rated === false && str === 'dis'){
                        //console.log('already disliked')
                        res.json('alreadyDisliked')
                    }
                }
            });
    },

    addToFavs: (req, res, next)=>{
        db.run(`insert into videos(videoid, type, rating, dis, usersfav, info)
            SELECT $1 , $2, $3, $4, $5, $6
            where not exists
            (SELECT videoid, type, rating, dis, usersfav, info
            from videos
            where usersfav = $5 and videoid = $1)`,[req.body.videoid, req.body.type, req.body.rating, req.body.dis, req.body.userid, req.body.info], (err, result)=>{
            if(err){
                console.log(err)
            }
            res.json(result)
        })
    },

    removeFromFavs: (req, res, next)=>{
        db.run(`update videos
                set usersfav = null 
                where usersfav = $1 and videoid = $2`, [req.params.userid, req.params.vidId], (err, result)=>{
            if(err){
                console.log(err)
            }
            console.log('deleted');
            res.json('deleted')
        })
    },

    getUserVideos: (req, res, next)=>{
        db.run('SELECT videoid, rating, dis, type, info from videos where usersfav = $1', [req.params.userid], (err, result)=>{
           if(err){
               console.log(err)
           }
           res.json(result);
        });
    },
    getRated: (req, res, next)=>{
        db.run(`select distinct videoid, type, dis, rating, channel from videos 
                where channel is not null`, (err, result)=>{
            res.json(result)
        })
    }
};
