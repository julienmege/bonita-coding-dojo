angular.module('bonitasoft.ui.widgets')
  .directive('pbUpload', function() {
    return {
      controllerAs: 'ctrl',
      controller: function PbUploadCtrl($scope, $sce, $element, widgetNameFactory, $timeout, $log) {
  var ctrl = this;
  this.name = widgetNameFactory.getName('pbInput');
  this.filename = '';
  this.filemodel = '';

  this.clear = clear;
  this.startUploading = startUploading;
  this.uploadError = uploadError;
  this.uploadComplete = uploadComplete;

  this.name = widgetNameFactory.getName('pbUpload');

  var input = $element.find('input');
  var form = $element.find('form');

  input.on('change', forceSubmit);
  $scope.$on('$destroy', function() {
    input.off('change', forceSubmit);
  });

  $scope.$watch('properties.url', function(newUrl, oldUrl){
    ctrl.url = $sce.trustAsResourceUrl(newUrl);
    if (newUrl === undefined) {
      $log.warn('you need to define a url for pbUpload');
    }
  });

  if (!$scope.properties.isBound('value')) {
    $log.error('the pbUpload property named "value" need to be bound to a variable');
  }

  function clear() {
    ctrl.filename = '';
    ctrl.filemodel = '';
    $scope.properties.value = {};
  }

  function uploadError(error) {
    $log.warn('upload fails too', error);
    ctrl.filemodel = '';
    ctrl.filename = 'Upload failed';
  }

  function startUploading() {
    ctrl.filemodel = '';
    ctrl.filename  = 'Uploading...';
  }

  function uploadComplete(response) {
    if(response && response.type && response.message){
      $log.warn('upload fails');
      ctrl.filemodel = '';
      ctrl.filename = 'Upload failed';
      return;
    }

    if (response.filename) {
      ctrl.filemodel = true;
      ctrl.filename = response.filename;
    }

    $scope.properties.value = response;
  }

  function forceSubmit(event) {
    if( !event.target.value) {
      return;
    }

    form.triggerHandler('submit');
    form[0].submit();
  }
}
,
      template: '<div ng-class="{\n    \'form-horizontal\': properties.labelPosition === \'left\' && !properties.labelHidden,\n    \'row\': properties.labelPosition === \'top\' && !properties.labelHidden || properties.labelHidden\n    }">\n    <div class="form-group">\n        <label\n            ng-if="!properties.labelHidden"\n            ng-class="{ \'control-label--required\': properties.required }"\n            class="control-label col-xs-{{ !properties.labelHidden && properties.labelPosition === \'left\' ? properties.labelWidth : 12 }}">\n            {{ properties.label | uiTranslate }}\n        </label>\n        <div class="col-xs-{{ 12 - (!properties.labelHidden && properties.labelPosition === \'left\' ? properties.labelWidth : 0) }}">\n           <form action="{{ctrl.url}}"\n                 ng-upload="ctrl.uploadComplete(content)"\n                 ng-upload-loading="ctrl.startUploading()"\n                 error-catcher="ctrl.uploadError(error)">\n                <div class="input-group file-upload">\n                    <input type="text" readonly disabled placeholder="{{properties.placeholder | uiTranslate}}" value="{{ctrl.filename}}" class="form-control">\n\n                    <button type="button" ng-if="ctrl.filemodel" ng-click="ctrl.clear()" class="file-upload-clear">\n                        <i class="glyphicon glyphicon-remove-circle"></i>\n                        <span class="hide" translate>Close</span>\n                    </button>\n                    <span class="input-group-btn">\n                        <span class="btn" ng-class="{\'btn-default disabled\':$isUploading, \'btn-primary\':!$isUploading}">\n                            <input class="file-upload-input"\n                                   ng-class="{\'file-upload-input--disabled\':$isUploading}"\n                                   name="{{ctrl.name}}" type="file"\n                                   ng-required="properties.required"\n                                   ng-model="ctrl.filemodel" />\n                            <i class="glyphicon" ng-class="{\'glyphicon-cloud-upload\':$isUploading, \'glyphicon-paperclip\':!$isUploading}"></i>\n                        </span>\n                    </span>\n                </div>\n            </form>\n            <div ng-messages="$form[ctrl.name].$dirty && $form[ctrl.name].$error " ng-messages-include="forms-generic-errors.html" role="alert"></div>\n        </div>\n    </div>\n</div>\n'
    };
  });
