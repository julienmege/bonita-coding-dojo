angular.module('bonitasoft.ui.widgets')
  .directive('pbLink', function() {
    return {
      template: '<div class="text-{{ properties.alignment }}">\n    <a ng-class="properties.buttonStyle !== \'none\' ? \'btn btn-\' + properties.buttonStyle : \'\'" ng-href="{{properties.targetUrl}}">{{ properties.text | uiTranslate }}</a>\n</div>\n'
    };
  });
