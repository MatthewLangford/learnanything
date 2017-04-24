angular.module('learnApp').controller('acctCtrl', function ($scope, mainService, $state) {
    $scope.vidFilter = '';
    let getUser = ()=> {
        mainService.getUser().then(user => {
            if(user){
                $scope.user = {
                    userid: user.userid,
                    username: user.username
                };
                mainService.getUserVids(user.userid).then(response =>{
                    console.log(response)
                    $scope.userVids = response.data;
                });
            }else {
                $scope.user = 'NOT LOGGED IN';
            }
        });
    };

    $scope.changeRating = (vid, type, index, str, info, userid) =>{
        mainService.changeRating(vid, type, str, info, userid).then(response => {
            if (str === 'plus') {
                switch(response.data){
                    case 'added_l':
                        $scope.userVidsFiltered[index].rating++;
                        break;
                    case 'alreadyLiked':
                        alert('you already liked that video');
                        break;
                    case 'disToLiked':
                        $scope.userVidsFiltered[index].rating++;
                        $scope.userVidsFiltered[index].dis--;
                        break;
                }
            }
            if (str === 'dis') {
                switch(response.data){
                    case 'added_d':
                        $scope.userVidsFiltered[index].dis++;
                        break;
                    case 'alreadyDisliked':
                        alert('you already disliked that video');
                        break;
                    case 'likeToDis':
                        $scope.userVidsFiltered[index].rating--;
                        $scope.userVidsFiltered[index].dis++;
                        break;
                }
            }
        });
    };

    $scope.removeFromFavs = (userid, videoid, index) =>{
        $scope.userVids.splice(index, 1);
        mainService.removeFromFavs(userid, videoid).then(response =>{
        });
    };

    getUser();

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
