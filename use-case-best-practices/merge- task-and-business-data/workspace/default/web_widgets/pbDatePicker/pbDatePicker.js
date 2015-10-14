angular.module('bonitasoft.ui.widgets')
  .directive('pbDatePicker', function() {
    return {
      controllerAs: 'ctrl',
      controller: function PbDatePickerCtrl($scope, $log, widgetNameFactory) {

  'use strict';

  //By default the picker is closed
  this.opened = false;

  this.datepickerOptions = {
    startingDay: 1
  };

  this.today = function() {
    $scope.properties.value = new Date();
    this.floorDate();
  };

  this.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    if (!$scope.properties.readOnly) {
      this.opened = true;
    }
  };

  this.floorDate = function() {
    if (angular.isDate($scope.properties.value)) {
      $scope.properties.value.setTime(Date.UTC($scope.properties.value.getFullYear(), $scope.properties.value.getMonth(), $scope.properties.value.getDate(), 0, 0, 0, 0));
    }
  };

  this.name = widgetNameFactory.getName('pbDatepicker');

  if (!$scope.properties.isBound('value')) {
    $log.error('the pbDatepicker property named "value" need to be bound to a variable');
  }


}
,
      template: '<div ng-class="{\n    \'form-horizontal\': properties.labelPosition === \'left\' && !properties.labelHidden,\n    \'row\': properties.labelPosition === \'top\' && !properties.labelHidden || properties.labelHidden\n    }">\n    <div class="form-group">\n        <label\n            ng-if="!properties.labelHidden"\n            ng-class="{ \'control-label--required\': properties.required }"\n            class="control-label col-xs-{{ !properties.labelHidden && properties.labelPosition === \'left\' ? properties.labelWidth : 12 }}">\n            {{ properties.label | uiTranslate }}\n        </label>\n\n        <div\n            class="col-xs-{{ 12 - (!properties.labelHidden && properties.labelPosition === \'left\' ? properties.labelWidth : 0) }}">\n            <p class="input-group">\n                <input type="text" class="form-control"\n                       ng-click="ctrl.open($event)"\n                       datepicker-popup="{{ properties.dateFormat | uiTranslate }}"\n                       name="{{ctrl.name}}"\n                       ng-model="properties.value"\n                       ng-change="ctrl.floorDate()"\n                       is-open="ctrl.opened"\n                       datepicker-options="ctrl.datepickerOptions"\n                       placeholder="{{ properties.placeholder | uiTranslate }}"\n                       ng-required="properties.required"\n                       show-button-bar="false"\n                       ng-class="{ \'Datepicker--enabled\': !properties.readOnly}"\n                       readonly />\n\n                <span class="input-group-btn">\n                    <button type="button" class="btn btn-default"\n                            ng-click="ctrl.open($event)"\n                            ng-disabled="properties.readOnly">\n                        <i class="glyphicon glyphicon-calendar"></i>\n                    </button>\n                </span>\n            </p>\n            <div ng-messages="$form[ctrl.name].$dirty && $form[ctrl.name].$error "\n                 ng-messages-include="forms-generic-errors.html" role="alert"></div>\n        </div>\n    </div>\n</div>\n'
    };
  });
