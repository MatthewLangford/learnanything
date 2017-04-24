angular.module('learnApp').controller('homeCtrl', function ($scope,mainService, $state) {
    $scope.programmingList = ['Angular 2','AngularJs', 'C Sharp Programming', 'C++', 'Golang Tutorials','Ios Swift','Java Tutorials','Javascript','PHP Tutorials', 'Python Tutorials','ReactJs', 'Ruby On Rails Tutorials'];
    $scope.computerList = ['How to Build PC', 'Replace Hard Drive PC', 'Replace Graphics Card PC', 'Replace Memory PC','Replace Motherboard', 'Replace Power Supply PC','Replace Processor PC'];
    $scope.homeImprovement = ['Bathroom DIY Tutorials','Bedroom Decor DIY','Home Appliance Install','Kids room DIY','Kitchen Life DIY','Roof Fix','Siding Fix','Windows & Doors DIY'];
    $scope.makeup = ['Apply Mascara','Best Eye Shadow','Best Lipstick','Contouring Tutorials','Eye Liner','Eyebrow Tutorials','Fingernail Design','Foundation Tutorials','Lip Liner'];
    $scope.vidFilter = '';
    $scope.showDesc = false;
    $scope.stopScroll = false;
    //get the video data from the back
    $scope.getYoutubeData = (searchText, page)=>{
        $scope.youtubeSearchText = searchText;
        $scope.youtubeData = [];
        mainService.getVideo(searchText, page).then((response)=> {
            $scope.youtubeData = response.data.videoIds;
            $scope.nextPageToken = response.data.nextPage;
        });
    };
    //get the description data from the back
    $scope.getDesc =(vid) =>{
        mainService.getDesc(vid.video_id).then(response =>{
            vid.snippet.desc = response.data.snippet.description;
            vid.snippet.tags = response.data.snippet.tags;
            vid.snippet.views = response.data.views;
        })
    };
    // infinite scrolling function that fires when the user gets close to the bottom of the screen
    $scope.scroller = (searchText, page)=>{
        if($scope.stopScroll){
            return;
        }
        $scope.stopScroll = true;
        mainService.getVideo(searchText, page).then(response=> {
            $scope.data = response.data.videoIds;
            $scope.nextPageToken = response.data.nextPage;
            for(let i = 0; i < $scope.data.length; i++){
                $scope.youtubeData.push($scope.data[i])
            }
            $scope.stopScroll = false;
        })
    };
    //change rating function
    $scope.changeRating = (vid, type, index, str,  user_id) =>{
        vid.type = type;
                mainService.changeRating(vid, str, user_id).then(response => {
                    console.log(response)
                    if (str === 'plus') {
                        switch(response.data){
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
                        switch(response.data){
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
    $scope.goHome = ()=>{
        $state.go('.',{},{reload: true});
        window.scrollTo(0,0)
    };
    //
    $scope.searchGoHome = () => {
        if ($state.current.name === 'acct' || $state.current.name === 'rated'|| $state.current.name === 'about') {
            $state.go('home', {}, {reload: true});
        } else{
            $state.go('.', {}, {reload: true});
        }
        window.scrollTo(0,0)

    };

    $scope.addToFavs = (userid, vid, type) => {
        vid.type = type;
        mainService.addToFavs(userid, vid)
    };
    $scope.goToTopFast = ()=> {
        window.scrollTo(0,0)
    };
    $scope.goToTop = () =>{
        $('html,body').animate({scrollTop: 0}, 'slow');
    };

    $scope.scrollDesc = (vid)=>{
        if(window.innerWidth < 990) {
            if ($(window).scrollTop() < 50) {
                $('html,body').animate({scrollTop: 350}, 'slow');
                vid.open = true
            } else {
                if (!vid.open) {
                    vid.pos = $(window).scrollTop()
                    $('html,body').animate({scrollTop: vid.pos + 300}, 'slow');
                    vid.open = true;
                } else {
                    $('html,body').animate({scrollTop: vid.pos}, 'slow');
                    vid.open = false;
                }
            }
        }
    };
    let getUser = ()=>{
        mainService.getUser().then(user => {
            if (user) {
                $scope.user = {
                    user_id: user.user_id,
                    user_name: user.user_name
                }
            } else {
                $scope.user = 'NOT LOGGED IN';
            }
        });
    };
    getUser();
     $(document).ready(()=> {
         if(window.innerWidth < 767){
             $scope.playerHeight = '200px'
         }else{
             $scope.playerHeight = '350px'
         }
         $(window).scroll(() => {
             if ($(window).scrollTop() > 700) {
                 $('.backToTop').css('display', 'block')
             } else {
                 $scope.topButton = false;
                 $('.backToTop').css('display', 'none')
             }
         });
     });
});