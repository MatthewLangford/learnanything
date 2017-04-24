angular.module('learnApp', ['ui.router','lwytEmbed','infinite-scroll','ngAnimate','ui.bootstrap'])
.config(function($stateProvider ,$urlRouterProvider) {
    //go home by default
    $urlRouterProvider.when('', '/home');
    //states
    $stateProvider
        //home view
        .state('home',{
            templateUrl: 'home/home.html',
            url:'/home',
            controller: 'homeCtrl'
        })
        //acct view
        .state('acct',{
            templateUrl: 'acct/acct.html',
            url: '/acct',
            controller: 'acctCtrl'
        })
        //about view
        .state('about',{
            templateUrl: 'about/about.html',
            url: '/about'
        })
        //rated view
        .state('rated',{
            templateUrl: 'rated/rated.html',
            url: '/rated',
            controller: 'ratedCtrl'
        })
    });