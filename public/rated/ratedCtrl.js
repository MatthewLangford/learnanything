angular.module('learnApp').controller('ratedCtrl', function ($scope, mainService) {
    //getting all the videos that have been rated
    mainService.getRated().then(response =>{
        $scope.ratedVids = response.data;
    });
    //see if the user is logged in
   let getUser = ()=> {
        mainService.getUser().then(user => {
            if(user){
                $scope.user = {
                    userid: user.userid,
                    username: user.username
                };
            }else {
                $scope.user = 'NOT LOGGED IN';
            }
        });
    };

    $scope.addToFavs = (userid, videoid, type, info, rating, dis, channel) => {
        info.channel = channel;
        mainService.addToFavs(userid, videoid, type, info, rating, dis)
    };

    //change the raeting on the videos if the user is logged in
    $scope.changeRating = (vid, type, index, str, info, userid) =>{
        mainService.changeRating(vid, type, str, info, userid).then(response => {
            if (str === 'plus') {
                switch(response.data){
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
                switch(response.data){
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
    //function that shows the go to top button when u scroll down a certain distance
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