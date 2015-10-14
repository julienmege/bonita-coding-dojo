angular.module('bonitasoft.ui.widgets')
  .directive('pbButton', function() {
    return {
      controllerAs: 'ctrl',
      controller: function PbButtonCtrl($scope, $http, $timeout, $location, $log, $window) {

  'use strict';

  this.action = function action() {
    var id;

    if ($scope.properties.action === 'Remove from collection') {
      removeFromCollection();
    } else if ($scope.properties.action === 'Add to collection') {
      addToCollection();
    } else if ($scope.properties.action === "Start process") {
      id = getUrlParam('id');
      if (id) {
        doRequestDelayed('POST', '../API/bpm/process/' + id + '/instantiation', getUserParam());
      } else {
        $log.log('Impossible to retrieve the process definition id value from the URL');
      }
    } else if ($scope.properties.action === 'Submit task') {
      id = getUrlParam('id');
      if (id) {
        doRequestDelayed('POST', '../API/bpm/userTask/' + getUrlParam('id') + '/execution', getUserParam());
      } else {
        $log.log('Impossible to retrieve the task id value from the URL');
      }
    } else if ($scope.properties.url) {
      doRequestDelayed($scope.properties.action, $scope.properties.url);
    }
  };

  function removeFromCollection() {
    if ($scope.properties.collectionToModify) {
      if (!Array.isArray($scope.properties.collectionToModify)) {
        throw 'Collection property for widget button should be an array, but was ' + $scope.properties.collectionToModify;
      }
      var index = -1;
      if ($scope.properties.collectionPosition === 'First') {
        index = 0;
      } else if ($scope.properties.collectionPosition === 'Last') {
        index = $scope.properties.collectionToModify.length -1;
      } else if ($scope.properties.collectionPosition === 'Item') {
        index = $scope.properties.collectionToModify.indexOf($scope.properties.removeItem);
      }

      // Only remove element for valid index
      if ( index !== -1) {
        $scope.properties.collectionToModify.splice(index, 1);
      }
    }
  }

  function addToCollection() {
    if (!$scope.properties.collectionToModify) {
      $scope.properties.collectionToModify = [];
    }
    if (!Array.isArray($scope.properties.collectionToModify)) {
      throw 'Collection property for widget button should be an array, but was ' + $scope.properties.collectionToModify;
    }
    var item = angular.copy($scope.properties.valueToAdd);

    if ($scope.properties.collectionPosition === 'First') {
      $scope.properties.collectionToModify.unshift(item);
    } else {
      $scope.properties.collectionToModify.push(item);
    }
  }

  // we delayed the doRequest to ensure dataToSend is updated
  // this usefull when copy() update the dataToSend object.
  function doRequestDelayed(method, url, params) {
    $scope.properties
      .waitFor('dataToSend')
      .then(doRequest.bind(null, method, url, params));
  }

  /**
   * Execute a get/post request to an URL
   * It also bind custom data from success|error to a data
   * @return {void}
   */
  function doRequest(method, url, params) {
     var req = {
      method: method,
      url: url,
      data: angular.copy($scope.properties.dataToSend),
      params: params
    };

    return $http(req)
      .success(function (data) {
        if ($scope.properties.targetUrlOnSuccess) {
          $window.top.location.assign($scope.properties.targetUrlOnSuccess);
        }
        $scope.properties.dataFromSuccess = data;
      })
      .error(function (data) {
        $scope.properties.dataFromError = data;
      });
  }

  function getUserParam() {
    var userId = getUrlParam('user');
    if (userId) {
      return {'user': userId};
    }
    return {};
  }

  /**
   * Extract the param value from a URL query
   * e.g. if param = "id", it extracts the id value in the following cases:
   *  1. http://localhost/bonita/portal/resource/process/ProcName/1.0/content/?id=8880000
   *  2. http://localhost/bonita/portal/resource/process/ProcName/1.0/content/?param=value&id=8880000&locale=en
   *  3. http://localhost/bonita/portal/resource/process/ProcName/1.0/content/?param=value&id=8880000&locale=en#hash=value
   * @returns {id}
   */
  function getUrlParam(param) {
    var paramValue = $location.absUrl().match('[//?&]' + param + '=([^&#]*)($|[&#])');
    if (paramValue) {
      return paramValue[1];
    }
    return '';
  }
}
,
      template: '<div class="text-{{ properties.alignment }}">\n    <button\n        ng-class="\'btn btn-\' + properties.buttonStyle"\n        ng-click="ctrl.action()"\n        type="button"\n        ng-disabled="properties.disabled">{{ properties.label | uiTranslate }}</button>\n</div>\n'
    };
  });
