'use strict';

angular.module('learnApp', ['ui.router', 'lwytEmbed', 'infinite-scroll', 'ngAnimate', 'ui.bootstrap']).config(function ($stateProvider, $urlRouterProvider) {
    //go home by default
    $urlRouterProvider.when('', '/home');
    //states
    $stateProvider
    //home view
    .state('home', {
        templateUrl: 'home/home.html',
        url: '/home',
        controller: 'homeCtrl'
    })
    //acct view
    .state('acct', {
        templateUrl: 'acct/acct.html',
        url: '/acct',
        controller: 'acctCtrl'
    })
    //about view
    .state('about', {
        templateUrl: 'about/about.html',
        url: '/about'
    })
    //rated view
    .state('rated', {
        templateUrl: 'rated/rated.html',
        url: '/rated',
        controller: 'ratedCtrl'
    });
});
'use strict';

angular.module('learnApp').service('mainService', function ($http) {
    this.getVideo = function (search, page) {
        if (page) {
            return $http.get('/api/getVideos/' + search + '?nextPage=' + page);
        } else {
            return $http.get('/api/getVideos/' + search);
        }
    };
    this.changeRating = function (vid, str, user_id) {
        return $http.post('/api/changeRating/', { vid: vid, str: str, user_id: user_id });
    };
    this.getDesc = function (id) {
        return $http.get('/api/getDesc/' + id);
    };
    this.addToFavs = function (id, vid) {
        $http.post('/api/addToFavs', { user_id: id, vid: vid });
    };
    this.removeFromFavs = function (id, vidId) {
        return $http.delete('/api/removeFromFavs/' + id + '/' + vidId);
    };
    this.getUserVids = function (user_id) {
        return $http.get('/api/getUserVids/' + user_id);
    };
    this.getRated = function () {
        return $http.get('/api/rated');
    };
    this.getUser = function () {
        return $http({
            method: 'GET',
            url: '/auth/me'
        }).then(function (res) {
            return res.data;
        }).catch(function (err) {});
    };
    this.logout = function () {
        return $http({
            method: 'GET',
            url: '/auth/logout'
        }).then(function (res) {
            return res.data;
        }).catch(function (err) {
            console.log(err);
        });
    };
});
'use strict';

angular.module('learnApp').controller('homeCtrl', function ($scope, mainService, $state) {
    $scope.programmingList = ['Angular 2', 'AngularJs', 'C Sharp Programming', 'C++', 'Golang Tutorials', 'Ios Swift', 'Java Tutorials', 'Javascript', 'PHP Tutorials', 'Python Tutorials', 'ReactJs', 'Ruby On Rails Tutorials'];
    $scope.computerList = ['How to Build PC', 'Replace Hard Drive PC', 'Replace Graphics Card PC', 'Replace Memory PC', 'Replace Motherboard', 'Replace Power Supply PC', 'Replace Processor PC'];
    $scope.homeImprovement = ['Bathroom DIY Tutorials', 'Bedroom Decor DIY', 'Home Appliance Install', 'Kids room DIY', 'Kitchen Life DIY', 'Roof Fix', 'Siding Fix', 'Windows & Doors DIY'];
    $scope.makeup = ['Apply Mascara', 'Best Eye Shadow', 'Best Lipstick', 'Contouring Tutorials', 'Eye Liner', 'Eyebrow Tutorials', 'Fingernail Design', 'Foundation Tutorials', 'Lip Liner'];
    $scope.vidFilter = '';
    $scope.showDesc = false;
    $scope.stopScroll = false;
    //get the video data from the back
    $scope.getYoutubeData = function (searchText, page) {
        $scope.youtubeSearchText = searchText;
        $scope.youtubeData = [];
        mainService.getVideo(searchText, page).then(function (response) {
            $scope.youtubeData = response.data.videoIds;
            $scope.nextPageToken = response.data.nextPage;
        });
    };
    //get the description data from the back
    $scope.getDesc = function (vid) {
        mainService.getDesc(vid.video_id).then(function (response) {
            vid.snippet.desc = response.data.snippet.description;
            vid.snippet.tags = response.data.snippet.tags;
            vid.snippet.views = response.data.views;
        });
    };
    // infinite scrolling function that fires when the user gets close to the bottom of the screen
    $scope.scroller = function (searchText, page) {
        if ($scope.stopScroll) {
            return;
        }
        $scope.stopScroll = true;
        mainService.getVideo(searchText, page).then(function (response) {
            $scope.data = response.data.videoIds;
            $scope.nextPageToken = response.data.nextPage;
            for (var i = 0; i < $scope.data.length; i++) {
                $scope.youtubeData.push($scope.data[i]);
            }
            $scope.stopScroll = false;
        });
    };
    //change rating function
    $scope.changeRating = function (vid, type, index, str, user_id) {
        vid.type = type;
        mainService.changeRating(vid, str, user_id).then(function (response) {
            console.log(response);
            if (str === 'plus') {
                switch (response.data) {
                    case 'added_l':
                        $scope.youtubeData[index].rating++;
                        break;
                    case 'alreadyLiked':
                        alert('you already liked that video');
                        break;
                    case 'disToLiked':
                        $scope.youtubeData[index].rating++;
                        $scope.youtubeData[index].dis--;
                        break;
                }
            }
            if (str === 'dis') {
                switch (response.data) {
                    case 'added_d':
                        $scope.youtubeData[index].dis++;
                        break;
                    case 'alreadyDisliked':
                        alert('you already disliked that video');
                        break;
                    case 'likeToDis':
                        $scope.youtubeData[index].rating--;
                        $scope.youtubeData[index].dis++;
                        break;
                }
            }
        });
    };
    $scope.goHome = function () {
        $state.go('.', {}, { reload: true });
        window.scrollTo(0, 0);
    };
    //
    $scope.searchGoHome = function () {
        if ($state.current.name === 'acct' || $state.current.name === 'rated' || $state.current.name === 'about') {
            $state.go('home', {}, { reload: true });
        } else {
            $state.go('.', {}, { reload: true });
        }
        window.scrollTo(0, 0);
    };

    $scope.addToFavs = function (userid, vid, type) {
        vid.type = type;
        mainService.addToFavs(userid, vid);
    };
    $scope.goToTopFast = function () {
        window.scrollTo(0, 0);
    };
    $scope.goToTop = function () {
        $('html,body').animate({ scrollTop: 0 }, 'slow');
    };

    $scope.scrollDesc = function (vid) {
        if (window.innerWidth < 990) {
            if ($(window).scrollTop() < 50) {
                $('html,body').animate({ scrollTop: 350 }, 'slow');
                vid.open = true;
            } else {
                if (!vid.open) {
                    vid.pos = $(window).scrollTop();
                    $('html,body').animate({ scrollTop: vid.pos + 300 }, 'slow');
                    vid.open = true;
                } else {
                    $('html,body').animate({ scrollTop: vid.pos }, 'slow');
                    vid.open = false;
                }
            }
        }
    };
    var getUser = function getUser() {
        mainService.getUser().then(function (user) {
            if (user) {
                $scope.user = {
                    user_id: user.user_id,
                    user_name: user.user_name
                };
            } else {
                $scope.user = 'NOT LOGGED IN';
            }
        });
    };
    getUser();
    $(document).ready(function () {
        if (window.innerWidth < 767) {
            $scope.playerHeight = '200px';
        } else {
            $scope.playerHeight = '350px';
        }
        $(window).scroll(function () {
            if ($(window).scrollTop() > 700) {
                $('.backToTop').css('display', 'block');
            } else {
                $scope.topButton = false;
                $('.backToTop').css('display', 'none');
            }
        });
    });
});
'use strict';

angular.module('learnApp').controller('acctCtrl', function ($scope, mainService, $state) {
    var getUser = function getUser() {
        mainService.getUser().then(function (user) {
            if (user) {
                $scope.user = {
                    user_id: user.user_id,
                    user_name: user.user_name
                };
                mainService.getUserVids(user.user_id).then(function (response) {
                    $scope.userVids = response.data;
                });
            } else {
                $scope.user = 'NOT LOGGED IN';
            }
        });
    };

    $scope.changeRating = function (vid, index, str, user_id) {
        mainService.changeRating(vid, str, user_id).then(function (response) {
            if (str === 'plus') {
                switch (response.data) {
                    case 'added_l':
                        $scope.userVids[index].rating++;
                        break;
                    case 'alreadyLiked':
                        alert('you already liked that video');
                        break;
                    case 'disToLiked':
                        $scope.userVids[index].rating++;
                        $scope.userVids[index].dis--;
                        break;
                }
            }
            if (str === 'dis') {
                switch (response.data) {
                    case 'added_d':
                        $scope.userVids[index].dis++;
                        break;
                    case 'alreadyDisliked':
                        alert('you already disliked that video');
                        break;
                    case 'likeToDis':
                        $scope.userVids[index].rating--;
                        $scope.userVids[index].dis++;
                        break;
                }
            }
        });
    };

    $scope.removeFromFavs = function (userid, videoid, index) {
        $scope.userVids.splice(index, 1);
        mainService.removeFromFavs(userid, videoid).then(function (response) {});
    };

    getUser();

    $scope.scrollDesc = function (vid) {
        if (window.innerWidth < 990) {
            if ($(window).scrollTop() < 50) {
                $('html,body').animate({ scrollTop: 350 }, 'slow');
                vid.open = true;
            } else {
                if (!vid.open) {
                    vid.pos = $(window).scrollTop();
                    $('html,body').animate({ scrollTop: vid.pos + 300 }, 'slow');
                    vid.open = true;
                } else {
                    $('html,body').animate({ scrollTop: vid.pos }, 'slow');
                    vid.open = false;
                }
            }
        }
    };
    $(document).ready(function () {
        if (window.innerWidth < 767) {
            $scope.playerHeight = '200px';
        } else {
            $scope.playerHeight = '350px';
        }
        $(window).scroll(function () {
            if ($(window).scrollTop() > 700) {
                $('.backToTop').css('display', 'block');
            } else {
                $scope.topButton = false;
                $('.backToTop').css('display', 'none');
            }
        });
    });
});
'use strict';

angular.module('learnApp').directive('navDirect', function () {
    return {
        restrict: 'E',
        templateUrl: '../navItem.html',
        scope: {
            input: '=',
            list: '=',
            data: '=',
            name: '@',
            next: '=',
            height: '=',
            navToggle: '='
        },
        controller: function controller($scope, mainService, $state) {
            $scope.getYoutubeData = function (searchText, page) {
                $scope.navToggle = true;
                $scope.data = [];
                mainService.getVideo(searchText, page).then(function (response) {
                    $scope.data = response.data.videoIds;
                    $scope.next = response.data.nextPage;
                    $scope.input = searchText;
                    if ($state.current.name === 'acct') {
                        $state.go('home', {}, { reload: true });
                    } else {
                        $state.go('.', {}, { reload: true });
                    }
                    window.scrollTo(0, 0);
                });
            };
            $(document).ready(function () {
                if (window.innerWidth < 767) {
                    $scope.height = '200px';
                } else {
                    $scope.height = '350px';
                }
            });
        }
    };
});
'use strict';

angular.module('learnApp').controller('aboutCtrl', function ($scope) {});
'use strict';

angular.module('learnApp').controller('ratedCtrl', function ($scope, mainService) {
    //getting all the videos that have been rated
    mainService.getRated().then(function (response) {
        $scope.ratedVids = response.data;
    });
    //see if the user is logged in
    var getUser = function getUser() {
        mainService.getUser().then(function (user) {
            if (user) {
                $scope.user = {
                    user_id: user.user_id,
                    user_name: user.user_name
                };
            } else {
                $scope.user = 'NOT LOGGED IN';
            }
        });
    };

    $scope.addToFavs = function (user_id, vid) {
        mainService.addToFavs(user_id, vid);
    };

    //change the raeting on the videos if the user is logged in
    $scope.changeRating = function (vid, index, str, user_id) {
        mainService.changeRating(vid, str, user_id).then(function (response) {
            if (str === 'plus') {
                switch (response.data) {
                    case 'added_l':
                        $scope.filteredRated[index].rating++;
                        break;
                    case 'alreadyLiked':
                        alert('you already liked that video');
                        break;
                    case 'disToLiked':
                        $scope.filteredRated[index].rating++;
                        $scope.filteredRated[index].dis--;
                        break;
                }
            }
            if (str === 'dis') {
                switch (response.data) {
                    case 'added_d':
                        $scope.filteredRated[index].dis++;
                        break;
                    case 'alreadyDisliked':
                        alert('you already disliked that video');
                        break;
                    case 'likeToDis':
                        $scope.filteredRated[index].rating--;
                        $scope.filteredRated[index].dis++;
                        break;
                }
            }
        });
    };

    getUser();
    //scrolling function that scrolls the page with the description if your on tablet or smaller
    $scope.scrollDesc = function (vid) {
        if (window.innerWidth < 990) {
            if ($(window).scrollTop() < 50) {
                $('html,body').animate({ scrollTop: 350 }, 'slow');
                vid.open = true;
            } else {
                if (!vid.open) {
                    vid.pos = $(window).scrollTop();
                    $('html,body').animate({ scrollTop: vid.pos + 300 }, 'slow');
                    vid.open = true;
                } else {
                    $('html,body').animate({ scrollTop: vid.pos }, 'slow');
                    vid.open = false;
                }
            }
        }
    };
    //function that shows the go to top button when u scroll down a certain distance
    $(document).ready(function () {
        if (window.innerWidth < 767) {
            $scope.playerHeight = '200px';
        } else {
            $scope.playerHeight = '350px';
        }
        $(window).scroll(function () {
            if ($(window).scrollTop() > 700) {
                $('.backToTop').css('display', 'block');
            } else {
                $scope.topButton = false;
                $('.backToTop').css('display', 'none');
            }
        });
    });
});
//# sourceMappingURL=bundle.js.map
