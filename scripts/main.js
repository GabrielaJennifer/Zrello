
var demoApp=angular.module('zrelloApp',['ui.router','ngRoute','ui.sortable']);
	demoApp.controller('homeController',function ($scope,Services,$state){
			function init() {
				$scope.addList = false;
				$scope.showAddBoard = true;
				var data = {};
				Services.callService(globalurl+'/getBoard',getmethod,data).then(function(response){
					if(response && response.data && response.data.board[0]
						&& response.data.board[0].board_title && response.data.board[0].board_title.length > 0){
						$scope.board = response.data.board[0];
						$scope.lists = response.data.lists;
						var cards = [];
						var lists = response.data.lists;
						$scope.lists = lists;
						console.log("$scope.lists: ",$scope.lists);
						$scope.showAddBoard = false;

					}

				}, function(error) {
					console.log(error);
				});
			}

			$scope.dragControlListeners = {
			    accept: function (sourceItemHandleScope, destSortableScope) {return true},//override to determine drag is allowed or not. default is true.
			    itemMoved: function (event) {//Do what you want

			    },
			    orderChanged: function(event) {//Do what you want
			    },
			    //containment: '.list',//optional param.
			    clone: true, //optional param for clone feature.
			    allowDuplicates: false //optional param allows duplicates to be dropped.
			};

			$scope.addBoard=function(board_title){
				var data ={
				 	"board_title" : board_title
				}
				Services.callService(globalurl+'/createBoard',postmethod, data).then(function(response) {
					$scope.board = response.data.board;
					alert("created");
					$scope.showAddBoard = false;
				}, function(error) {
					alert("error");
				});
			};

			$scope.createList = function() {
				

				$scope.addList = true;
			}

			$scope.saveList = function(newListTitle) {
					$scope.addList = false;
					var data = {
						board_id: $scope.board.board_id,
						list_title : newListTitle
					};
					Services.callService(globalurl+'/createList',postmethod,data).then(function(response){
						$scope.lists.push(response.data.list);
						$scope.newListTitle = '';
					}, function(error){
						alert(error);
					});
				
				
				
			}
			$scope.sortableOptions = createOptions('A');

			function createOptions (listName) {
			    var _listName = listName;
			    var options = {
			      placeholder: "card",
			      connectWith: ".card-wrapper"
			    };
			    return options;
			  }

			$scope.deleteList = function(list_id) {
				
				Services.callService(globalurl+'/deleteList',postmethod,{'list_id':list_id}).then(function(response){
					console.log($scope.lists);
					$scope.lists = $scope.lists.filter(function(ele) {
						return ele.list_id != list_id;
					});
					console.log($scope.lists);
				}, function(error){
					alert(error);
				});
			}

			$scope.addCard = function(list) {
				
				list.showAddCard = true;
			}

			$scope.saveCard = function(list,cardTitle) {
				console.log("list : ",list);
				Services.callService(globalurl+'/createCard',postmethod,{'list_id':list.list_id,'card_title':cardTitle}).then(function(response){
					var card = { card_id: response.data.card_id,
									card_title: response.data.card_title
								}
					if(list.cards && list.cards.length >= 1) {
						
						list.cards.push(card);
					}			
					else if(list.cards.length == 0) {
						list.cards = [];
						list.cards.push(card);
					}	
					console.log(list.cards);
					list.showAddCard = false;		
				}, function(error){
					alert(error);
				});
			}

			$scope.openCard = function(card) {
				Services.card = card;
				$state.go('card',{id:card.card_id});
			}

			$scope.getCards = function(list) {
				var data = {
					list_id: list.list_id,
					list_title: list.list_title
				}
				Services.callService(globalurl+'/getCard',postmethod, data).then(function(res) {								 
					list.cards = res.data.cards;					
				}, function(error) {
					alert("error");
				}).finally(function() {						
				});
			}

			init();
	})
	demoApp.controller('cardController',function($scope,Services,$state,$stateParams) {
		function init() {
			console.log($stateParams.id);
			var data = {
				card_id : $stateParams.id
			}
			Services.callService(globalurl+'/getCardDetails',postmethod, data).then(function(res) {								 
				$scope.card = res.data.card;
				
			}, function(error) {
				alert("error");
			}).finally(function() {

			});

		}
		$scope.deleteCard = function(card) {
			var data = {
				card_id : card.card_id
			}
			Services.callService(globalurl+'/deleteCard',postmethod, data).then(function(res) {								 
				alert("Card deleted");
				$state.go('home');
				
			}, function(error) {
				alert("error");
			}).finally(function() {

			});
		}

		$scope.updateDesc = function(card,newDesc) {
			var data = {
				card_id: card.card_id,
				card_desc: newDesc
			}
			Services.callService(globalurl+'/updateDesc',postmethod, data).then(function(res) {								 
				alert("card updated");
				
			}, function(error) {
				alert("error");
			}).finally(function() {

			});
		}

		$scope.goBack = function() {
			$state.go('home');
		}

		$scope.addComment = function(comment) {
			var data = {
				comment: comment
			}
			Services.callService(globalurl+'/addComment',postmethod, data).then(function(res) {								 
				
				
			}, function(error) {
				alert("error");
			}).finally(function() {

			});
		}
		init();
	})


demoApp.config(function($stateProvider,$urlRouterProvider, $httpProvider) {
$httpProvider.defaults.useXDomain = true;
        $httpProvider.defaults.withCredentials = true;
        delete $httpProvider.defaults.headers.common["X-Requested-With"];
        $httpProvider.defaults.headers.common["Accept"] = "application/json";
        $httpProvider.defaults.headers.common["Content-Type"] = "application/json";
   $stateProvider

  // setup an abstract state for the tabs directive
    .state('home', {
    url: '/home',
    controller: 'homeController',
    templateUrl: 'templates/home.html'
  })

  // Each tab has its own nav history stack:

  .state('card', {
    url: '/card:id',
    controller: 'cardController',
    templateUrl: 'templates/card.html'
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/home');

})