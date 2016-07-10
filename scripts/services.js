demoApp.factory('Services', Services);

function Services ($q,$http) {
  	var service = {
  		callService: callService,
  		card: {}
  	}

  	return service;

  	function callService(api,method,data) {
  		console.log("callService: ",api);
  		var deferred = $q.defer();
  		$http({
		        method: method,
		        url: api,
		        data: data
		    }).then(function (response) {
		    	console.log(response);
		    	if(response && response.data && response.data.error != 'true'){
		    		console.log("callService: success");
		    		deferred.resolve(response);
		    	}
		    	else {
		    		console.log("callService: failed");
		    		deferred.reject();
		    	}
		    	
		    },function(error) {
		    	console.log("callService: failed");
		    	deferred.reject(error);
		    });
		return deferred.promise;
  	}
  }