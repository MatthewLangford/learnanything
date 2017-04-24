angular.module('learnApp').service('mainService', function ($http) {
    this.getVideo = (search, page)=> {
        if(page) {
            return $http.get('/api/getVideos/' + search + '?nextPage=' + page)
        }else{
            return $http.get('/api/getVideos/' + search);
        }
    };
    this.changeRating = (vid, type, str, info, userid)=>{
        return $http.post('/api/changeRating/',{vid: vid, str: str, type: type, snippet:info, userid: userid})
    };
    this.getDesc = (id)=>{
        return $http.get('/api/getDesc/' + id);
    };
    this.addToFavs = (id, vidId, type, info, rating, dis) =>{
        $http.post('/api/addToFavs',{userid: id, videoid: vidId, type: type, info:info, rating: rating, dis: dis})
    };
    this.removeFromFavs = (id, vidId)=>{
        return $http.delete('/api/removeFromFavs/' + id + '/' + vidId)
    };
    this.getUserVids = (userid)=>{
        return $http.get('/api/getUserVids/' + userid);
    };
    this.getRated = ()=>{
        return $http.get('/api/rated');
    };
    this.getUser = function() {
        return $http({
            method: 'GET',
            url: '/auth/me'
        })
            .then(function(res) {
                return res.data;
            })
            .catch(function(err) {
            })
    };
    this.logout = function() {
        return $http({
            method: 'GET',
            url: '/auth/logout'
        })
            .then(function(res) {
                return res.data;
            })
            .catch(function(err) {
                console.log(err);
            })
    }
});
