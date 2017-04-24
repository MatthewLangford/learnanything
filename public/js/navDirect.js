angular.module(`learnApp`)
    .directive(`navDirect`, function () {
        return {
            restrict: `E`,
            templateUrl: `../navItem.html`,
            scope:{
                input: '=',
                list: '=',
                data: '=',
                name: '@',
                next: '=',
                height: '=',
                navToggle: '='
            },
            controller: ($scope, mainService, $state) =>{
                $scope.getYoutubeData = (searchText, page)=>{
                    $scope.navToggle = true;
                    $scope.data = [];
                    mainService.getVideo(searchText, page).then((response) => {
                        $scope.data = response.data.videoIds;
                        $scope.next = response.data.nextPage;
                        $scope.input = searchText;
                        if ($state.current.name === 'acct') {
                            $state.go('home', {}, {reload: true});
                        } else{
                            $state.go('.', {}, {reload: true});
                        }
                        window.scrollTo(0,0)
                    });
                };
                $(document).ready(()=> {
                    if (window.innerWidth < 767) {
                        $scope.height = '200px'
                    } else {
                        $scope.height = '350px'
                    }
                });
            }
        }
    });