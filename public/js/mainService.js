angular.module('learnApp').service('mainService', function ($http) {
    this.getVideo = (search, page)=> {
        if(page) {
            return $http.get('/api/getVideos/' + search + '?nextPage=' + page)
        }else{
            return $http.get('/api/getVideos/' + search);
        }
    };
    this.changeRating = (vid, str, user_id)=>{
        return $http.post('/api/changeRating/',{vid: vid, str: str, user_id: user_id})
    };
    this.getDesc = (id)=>{
        return $http.get('/api/getDesc/' + id);
    };
    this.addToFavs = (id, vid) =>{
        $http.post('/api/addToFavs',{user_id: id, vid: vid})
    };
    this.removeFromFavs = (id, vidId)=>{
        return $http.delete('/api/removeFromFavs/' + id + '/' + vidId)
    };
    this.getUserVids = (user_id)=>{
        return $http.get('/api/getUserVids/' + user_id);
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
