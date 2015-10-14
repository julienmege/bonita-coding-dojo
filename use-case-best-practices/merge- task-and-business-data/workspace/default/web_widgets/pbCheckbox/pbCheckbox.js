angular.module('bonitasoft.ui.widgets')
  .directive('pbCheckbox', function() {
    return {
      controllerAs: 'ctrl',
      controller: function PbCheckboxCtrl($scope, $log, widgetNameFactory) {

  $scope.$watch('properties.value', function(value) {
    if (value === 'true' || value === true) {
      $scope.properties.value = true;
    } else {
      $scope.properties.value = false;
    }
  });

  this.name = widgetNameFactory.getName('pbCheckbox');

  if (!$scope.properties.isBound('value')) {
    $log.error('the pbCheckbox property named "value" need to be bound to a variable');
  }
}
,
      template: '<div class="checkbox">\n    <label>\n        <input type="checkbox" name="{{ctrl.name}}" ng-model="properties.value" ng-required="properties.required" ng-disabled="properties.disabled"> {{ properties.label | uiTranslate }}\n    </label>\n    <div ng-messages="$form[ctrl.name].$dirty && $form[ctrl.name].$error " ng-messages-include="forms-generic-errors.html" role="alert"></div>\n</div>\n'
    };
  });
