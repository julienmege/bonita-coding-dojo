'use strict';
/**
 * @ngdoc overview
 * @name bonitable
 */
angular.module('org.bonitasoft.bonitable', [])
  .controller('BonitableController', ['$scope', function($scope){

    /* bo-sortable */
    // sortOption accessors
    this.getOptions = function() {
      return $scope.sortOptions;
    };

    this.triggerSortHandler = function(params){
      $scope.onSort({options:params});
    };

    /* multiselect */
    var selectors = [];
    this.registerSelector = function registerSelector(item){
      selectors.push(item);
    };

    this.unregisterSelector = function unregisterSelector(item){
      /*var index = selectors.indexOf(item);
      selectors = selectors.slice(0, index).concat(selectors.slice(index+1));*/
      selectors.splice(selectors.indexOf(item), 1);
    };

    var getters = {
      '$selectedItems': function() {
        return selectors
          .filter(isChecked)
          .map(getData);
      },
      '$allSelected': function() {
        return this.$selectedItems.length === selectors.length;
      },
      '$indeterminate': function () {
        return this.$selectedItems.length !== selectors.length &&
          this.$selectedItems.length > 0;
      }
    };

    this.prepareScope = function(scope){

      Object.keys(getters).forEach(function(property){
         Object.defineProperty(this, property, {
          get: getters[property],
          enumerable: true,
          iterable: true
        });
      }, scope);

      scope.$toggleAll = function toggleAll(){
        var selectedValue = !this.$allSelected;

        selectors.forEach( function(row){
          row.setChecked(selectedValue);
        });
      };
    };

   /**
    * helper method to check if row is checked
    * @param  {Object}  row
    * @return {Boolean}
    */
    function isChecked(row){
      return row.isChecked();
    }
    /**
     * accessor function for data
     * @param  {Object} row
     * @return {Object}     data associated to the row
     */
    function getData(row){
      return row.data;
    }

  }])
  /**
   * @ngdoc directive
   * @name bonitable.bonitable
   *
   * @description
   * This is a base directive to use with  {@link bonita.sortable:boSorter bo-sorter} and {@link bonita.sortable:boSelector bo-selector}/{@link bonita.sortable:boSelectall bo-selectall}
   * You should not use it only
   * The __bonitable__ directive will create it's own transcluded scope and
   * exposes and API only available to it's children.
   * These properties are used by the directive from bonita.selectable
   *
   * | Variable          | Type             | Details                                                            |
   * |-------------------|------------------|--------------------------------------------------------------------|
   * | `$selectedItems`  | {@type Array}    | an array containing the selected items. @see bo_selector.          |
   * | `$indeterminate`  | {@type boolean}  | true if not all the items are selected.                            |
   * | `$allSelected`    | {@type boolean}  | true if all items are selected.                                    |
   * | `$toggleAll`      | {@type function} | select/unselect all the bo-selector at once.                       |
   *
   *
   * @element ANY
   * @scope
   * @prioriyt 100
   * @restrict A
   * @param {expression} onSort an  expression to be evaluate upon each time the sortProperties are updated
   * @param {Array} repeatableConfig an array of ``boolean`` representing the visibility status for  each columns in the table
   * @param {Object} sortOptions  an function an object with 2 property: ``property``{string} for current property
   *                                    sort is apply on, and, 'direction' {boolean} ``false`` for ascending sort, ``true`` for descending sort
   *
   * @example
    <example module="bonitableExample">
      <file name="index.html">
        <p>sort called {{count}} times</p>
        <pre>{{options|json}}</pre>
        <table bonitable sort-options="options" on-sort="sortHandler()">
          <thead>
            <tr>
              <th><div bo-selectall></div></th>
              <th bo-sorter="name">name</th>
              <th bo-sorter="country">country</th>
            </tr>
          </thead>
          <tbody>
            <tr ng-repeat="user in users | orderBy: options.property : options.direction ">
              <td><input type="checkbox" bo-selector/></td>
              <td>{{user.name}}</td>
              <td>{{user.country}}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3">You have selected {{$selectedItems.length}} items</td>
            </tr>
          </tfoot>
        </table>
      </file>
      <file name="script.js">
        angular
          .module('bonitableExample', [
            'ui.bootstrap.tpls',
            'org.bonitasoft.bonitable',
            'org.bonitasoft.templates',
            'org.bonitasoft.bonitable.sortable',
            'org.bonitasoft.bonitable.selectable'
          ])
          .run(function($rootScope){
            $rootScope.users = [
              {name:'Paul', country:'Uk'},
              {name:'Sarah', country:'Fr'},
              {name:'Jacques', country:'Us'},
              {name:'Joan', country:'Al'},
              {name:'Tite', country:'Jp'},
            ];
            $rootScope.count = 0;
            $rootScope.sortHandler = function() {
              $rootScope.count += 1 ;
            };

            $rootScope.options = {
              property: 'name',
              direction: false
            };
          })
      </file>
    </example>
   *
   */
  .directive('bonitable', function(){
    return {
      priority:100,
      scope: {
        //bo-sortable options
        onSort:'&',
        sortOptions:'=',

        //bo-repeatable-config
        repeatableConfig:'='
      },
      transclude:'element',
      controller: 'BonitableController',
      compile: function(){
        return function($scope, $element, $attr, ctrl, $transclude){
          $transclude( function(clone, scope){
            ctrl.prepareScope(scope);
            $element.after(clone);
          });
        };
      }
    };
  });

angular.module('org.bonitasoft.dragAndDrop',[])
  .provider('boDraggableItem', function() {

    'use strict';

    var defaultConfig = {
      cloneOnDrop: true,
      bodyClass: false
    };

    /**
     * Allow the creation of a new node when we drag the item
     * Default is true;
     * @param  {Boolean} allowClone
     * @return {void}
     */
    this.cloneOnDrop = function cloneOnDrop(allowClone) {
      defaultConfig.cloneOnDrop = allowClone;
    };

    this.activeBodyClassName = function activeBodyClassName(activeClassName) {
      defaultConfig.bodyClass = activeClassName;
    };

    this.$get = function() {
      return {
        config: function config() {
          return angular.copy(defaultConfig);
        },
        allowCloneOnDrop: function allowCloneOnDrop() {
          return this.config().cloneOnDrop || false;
        },
        setBodyClass: function setBodyClass() {
          return !!this.config().bodyClass;
        }
      };
    };

  })
  .service('boDragUtils', function() {
    'use strict';
    /**
     * Generate a uniq identifier from 6/7 to 11 caracters (90% between 9 and 11)
     * @param  {String} key prefix
     * @return {String}
     */
    this.generateUniqId = function generateUniqId(key) {
      return (key || 'drag-') + Math.random().toString(36).substring(7);
    };

    /**
     * Use an API from Microsoft
     * Thanks to {@link http://stackoverflow.com/questions/5500615/internet-explorer-9-drag-and-drop-dnd}
     * @param {NodeList}
     */
    this.polyfillIE = function polyfillIE(list) {
      Array.prototype.forEach.call(list, function (el) {
        angular.element(el).on('selectstart', function(){
          this.dragDrop();
          return false;
        });
      });
    };

    /**
     * Try to find the node that initiate the dragEvent
     * @param  {Node} node the event.target node
     * @return {Node}      the found node or null
     */
    this.getDragInitiatorNode = function getDragInitiatorNode(node) {
      var currentNode = node;
      while(currentNode.parentNode) {
        if (currentNode.getAttribute('draggable') === 'true') {
          return currentNode;
        }
        currentNode = currentNode.parentNode;
      }
      return null;
    };

  })
  .directive('boDropzone', ['$document', '$parse', '$compile', 'boDragUtils', 'boDragEvent', 'boDraggableItem', function ($document, $parse, $compile, boDragUtils, boDragEvent, boDraggableItem){

    'use strict';

    // Register some callback for the directive
    var eventMap = {},
        DROPZONE_CLASSNAME_HOVER = boDragEvent.events.DROPZONE_CLASSNAME_HOVER,
        DRAGITEM_OWN_DROPZONE    = boDragEvent.events.DRAGITEM_OWN_DROPZONE,
        CLASSNAME_DRAG_HOVER     = boDragEvent.events.CLASSNAME_DRAG_HOVER;

    $document.on('dragenter', function (e) {

      if(e.target.hasAttribute('data-drop-id')) {

        var dropZoneInsideAnotherDragItemBetweenDragItem = !!angular
              .element('#' + boDragEvent.currentDragItemId)
              .find('[draggable] [data-drop-id='+e.target.getAttribute('data-drop-id')+']')[0];

        var dropZoneInsideDragItem = !!angular
              .element('#' + boDragEvent.currentDragItemId)
              .find('[data-drop-id='+e.target.getAttribute('data-drop-id')+']')[0];


        angular
          .element(document.querySelectorAll('.' + DRAGITEM_OWN_DROPZONE))
          .removeClass(DRAGITEM_OWN_DROPZONE);

        // Check if the dropZone is not inside the current dragged item
        if(dropZoneInsideAnotherDragItemBetweenDragItem || dropZoneInsideDragItem) {
          e.target.className += ' ' + DRAGITEM_OWN_DROPZONE;
        }

        // Remove all other dropZone with the className
        angular
          .element(document.querySelectorAll('.' +  DROPZONE_CLASSNAME_HOVER))
          .removeClass(DROPZONE_CLASSNAME_HOVER);

        e.target.className += ' ' + DROPZONE_CLASSNAME_HOVER;
      }
    });


    // Add a delegate for event detection. One event to rule them all
    $document.on('dragover', function (e) {
      e.preventDefault(); // allows us to drop

      if(e.target.hasAttribute('data-drop-id')) {

        // IE9 does not know dataset :/
        var dragElmId = e.target.getAttribute('data-drop-id');

        eventMap[dragElmId].onDragOver(eventMap[dragElmId].scope, {$event: e});
        (e.dataTransfer || e.originalEvent.dataTransfer).dropEffect = 'copy';

        return false;
      }
    });

    // Add a delegate for event detection. One event to rule them all
    $document.on('drop', function (e) {
      e.preventDefault(); // allows us to drop

      // Remove ClassName to the body when a drag action is running
      if(boDraggableItem.setBodyClass()) {
        angular.element(document.body).removeClass('bo-drag-action');
      }

      // Drop only in dropZone container
      if(e.target.hasAttribute('data-drop-id')) {

        // IE9 does not know dataset :/
        var dragElmId = e.target.getAttribute('data-drop-id');

        /**
         * Defines in the directive boDraggable inside the listener of dragStart
         * Format: JSON string
         *   - dragItemId: draggable item id
         *   - isDropZoneChild: Boolean
         */
        var eventData = JSON.parse((e.dataTransfer || e.originalEvent.dataTransfer).getData('Text'));

        // Grab the drag element
        var el              = document.getElementById(eventData.dragItemId),
            targetScope     = eventMap[dragElmId].scope,
            currentDragItem = boDragEvent.map[eventData.dragItemId],
            scopeData       = currentDragItem.data;

        // Was it a child of a dropzone ? If not then create a copy
        if(eventData.isDropZoneChild) {
          e.target.appendChild(el);
        }else {
          var surrogate = el.cloneNode(true);
          surrogate.id = boDragUtils.generateUniqId();

          // Update the event map reference
          boDragEvent.copy(eventData.dragItemId, surrogate.id);

          try {
            surrogate.attributes.removeNamedItem('ng-repeat');
          }catch (e) {
            // You're trying to delete an ghost attribute. DOMException: Failed to execute 'removeNamedItem'
          }

          // Default is true so we clone the node
          if(boDraggableItem.allowCloneOnDrop()) {
            e.target.appendChild(surrogate);
          }

          // Compile a new isolate scope for the drag element
          $compile(angular.element(surrogate))(boDragEvent.map[surrogate.id].scope);
        }

        targetScope.$apply(function() {
          angular
            .element(document.getElementsByClassName(DROPZONE_CLASSNAME_HOVER))
            .removeClass(DROPZONE_CLASSNAME_HOVER);

          angular
            .element(document.getElementsByClassName(CLASSNAME_DRAG_HOVER))
            .removeClass(CLASSNAME_DRAG_HOVER);

          // Hooks
          currentDragItem.onDropItem(targetScope,{$data: scopeData, $event: e});
          eventMap[dragElmId].onDropSuccess(targetScope, {$data: scopeData, $event: e});
        });

      }
    });

    return {
      type: 'A',
      link: function(scope, el, attr) {

        el.addClass('bo-dropzone-container');
        attr.$set('data-drop-id',boDragUtils.generateUniqId('drop'));

        // Register event for this node
        eventMap[attr['data-drop-id']] = {
          scope: scope,
          onDropSuccess: $parse(attr.boDropSuccess),
          onDragOver: $parse(attr.boDragOver)
        };
      }
    };

  }])
  .factory('boDragEvent',function() {

    'use strict';

    var eventMap = {};
    return {
      // Store each cb reference for a any draggable element
      map: eventMap,
      events: {
        DROPZONE_CLASSNAME_HOVER: 'bo-dropzone-hover',
        DRAGITEM_OWN_DROPZONE: 'bo-drag-dropzone-child',
        CLASSNAME_DRAG_HOVER: 'bo-drag-enter'
      },
      /**
       * Copy an event reference
       * @param  {String} from Identifier draggable item
       * @param  {String} to   Identifier other draggable event
       * @return {void}
       */
      copy: function copy(from, to) {
        eventMap[to] = eventMap[from];
      }
    };
  })
  .directive('boDraggable', ['$document', '$parse', 'boDragEvent', 'boDragUtils', 'boDraggableItem', function ($document, $parse, boDragEvent, boDragUtils, boDraggableItem){
    'use strict';

    // Add a delegate for event detection. One event to rule them all
    $document.on('dragstart', function (e) {

      var target     = boDragUtils.getDragInitiatorNode(e.target),
          eventData  = (e.dataTransfer || e.originalEvent.dataTransfer);

      // Add a ClassName to the body when a drag action is running
      if(boDraggableItem.setBodyClass()) {
        angular.element(document.body).addClass('bo-drag-action');
      }

      eventData.effectAllowed = 'copy';
      eventData.setData('Text', JSON.stringify({
        dragItemId      : target.id,
        isDropZoneChild : target.parentElement.hasAttribute('data-drop-id')
      }));

      // Cache for the current id as the event seems to not be fast enougth
      boDragEvent.currentDragItemId = target.id;

      // Trigger the event if we need to
      if (boDragEvent.map[target.id]){
        boDragEvent.map[target.id].onDragStart(boDragEvent.map[target.id].scope);
      }
    });

    $document.on('dragenter', function(e) {

      if(e.target.className.indexOf(boDragEvent.events.CLASSNAME_DRAG_HOVER) > -1) {
        return;
      }

      // Remove the className for previous hovered items
      angular
        .element(document.getElementsByClassName(boDragEvent.events.CLASSNAME_DRAG_HOVER))
        .removeClass(boDragEvent.events.CLASSNAME_DRAG_HOVER);
      e.target.className += ' ' + boDragEvent.events.CLASSNAME_DRAG_HOVER;

    });

    $document.on('dragleave', function(e) {
      if(e.target.className.indexOf(boDragEvent.events.CLASSNAME_DRAG_HOVER) > -1) {
        e.target.className = e.target.className.replace(' '+boDragEvent.events.CLASSNAME_DRAG_HOVER,'');
      }
    });

    return {
      link: function(scope, el, attr) {

        attr.$set('draggable',true);
        attr.$set('id',attr.id || boDragUtils.generateUniqId());

        // Register event for the current node and its scope
        boDragEvent.map[attr.id] = {
          key         : attr.boDraggableData, // Ref key to the scope custom data
          scope       : scope,
          onDragStart : $parse(attr.boDragStart),
          onDropItem  : $parse(attr.boDropItem)
        };

        // Some key in the scope are async (if it comes from directive)
        scope.$evalAsync(function (currentScope) {
          boDragEvent.map[attr.id].data = currentScope[attr.boDraggableData];
        });
      }
    };
  }])
  .directive('boDragPolyfill', ['$window', '$document', '$timeout', 'boDragUtils', function ($window, $document, $timeout, boDragUtils) {

    /**
     * Before angular bind the scope to the dom, we update the dom for IE
     * We find the declaration of boDraggable and change the dom to a <a href> since the div is buggy with IE9.
     *
     * Why do not use compile on boDraggable ?
     * Because angular create a fragment, and a fragment does not have any parents, so we cannot replace the old node by a polyfill.
     */
    'use strict';

    // After a drop action, we reload the polyfill for new item
    if($window.navigator.userAgent.indexOf('MSIE 9') > -1) {
      $document.on('drop', function (e) {
        e.preventDefault(); // allows us to drop
        $timeout(function() {
          boDragUtils.polyfillIE(document.querySelectorAll('[bo-draggable], [data-bo-draggable]'));
        },100);
      });
    }

    return {
      type: 'EA',
      link: function link() {

        if($window.navigator.userAgent.indexOf('MSIE 9') > -1) {

          // run the polyfill after the digest, because some directive can be bind, so compile cannot see them
          $timeout(function() {
            boDragUtils.polyfillIE(document.querySelectorAll('[bo-draggable], [data-bo-draggable]'));
          },100);

        }
      }
    };

  }]);

/* jshint sub:true*/
(function () {
  'use strict';
  angular.module('org.bonitasoft.services.topurl', [])
    .service('manageTopUrl', ['$window', function ($window) {
      var manageTopUrlService = {};
      manageTopUrlService.getCurrentPageToken = function() {
        var pageTokenRegExp = /(^|[&\?])_p=([^&]*)(&|$)/;
        var pageTokenMatches = pageTokenRegExp.exec($window.top.location.hash);
        if (pageTokenMatches && pageTokenMatches.length) {
          return pageTokenMatches[2];
        }
        return '';
      };

      manageTopUrlService.addOrReplaceParam = function (param, paramValue) {
        if (paramValue !== undefined && $window.self !== $window.top) {
          var pageToken = manageTopUrlService.getCurrentPageToken();
          if (!!$window.top.location.hash) {
            var paramRegExp = new RegExp('(^|[&\\?])'+pageToken+param+'=[^&]*(&|$)');
            var paramMatches = $window.top.location.hash.match(paramRegExp);
            if (!paramMatches || !paramMatches.length) {
              var currentHash = $window.top.location.hash;
              if(paramValue) {
                $window.top.location.hash += ((currentHash.indexOf('&', currentHash.length - 2) >= 0) ? '' : '&') + pageToken + param + '=' + paramValue;
              }
            } else {
              var paramToSet = '';
              if(paramValue){
                paramToSet = pageToken + param + '=' + paramValue;
              }
              $window.top.location.hash = $window.top.location.hash.replace(paramRegExp, '$1'+ paramToSet + '$2');
            }
          } else {
            if(paramValue) {
              $window.top.location.hash = '#' + pageToken + param + '=' + paramValue;
            }
          }
        }
      };
      manageTopUrlService.getCurrentProfile = function () {
        if ($window && $window.top && $window.top.location && $window.top.location.hash) {
          var currentProfileMatcher = $window.top.location.hash.match(/\b_pf=\d+\b/);
          return (currentProfileMatcher && currentProfileMatcher.length) ? currentProfileMatcher[0] : '';
        }
      };
      manageTopUrlService.getPath = function () {
        return $window.top.location.pathname;
      };
      manageTopUrlService.getSearch = function () {
        return $window.top.location.search || '';
      };
      manageTopUrlService.getUrlToTokenAndId = function (id, token) {
        return manageTopUrlService.getPath() + manageTopUrlService.getSearch() + '#?id=' + (id || '') + '&_p=' + (token || '') + '&' + manageTopUrlService.getCurrentProfile();
      };

      manageTopUrlService.goTo = function(destination){
        var token = destination.token;
        if(!token){
          return;
        }
        var params = '&';
        if(destination){
          angular.forEach(destination, function(value, key){
            if(key && value && key !== 'token'){
              params += token + key + '=' + value + '&';
            }
          });
        }
        $window.top.location.hash = '?_p='+ token+'&' + manageTopUrlService.getCurrentProfile() + params;
      };
//cannot use module pattern or reveling since we would want to mock methods on test
      return manageTopUrlService;
    }]);
})();

angular
  .module('org.bonitasoft.bonitable.selectable',['org.bonitasoft.bonitable'])
  /**
   * @ngdoc directive
   * @name bonita.selectable:boSelectall
   * @module bonita.selectable
   *
   * @description
   *
   * This directive will insert a checkbox that reflect the current
   * selection status (checked / unckeched / indeterminate) of the row.
   *
   * It will also allow user to check the ``input[bo-selector]`` all at once.
   * Internally, this directive rely on ``$toggleAll()`` and ``$allSelected``,
   * wich are both exposed by the {@link bonitable.bonitable directive}.
   *
   * @example
    <example module="selectableExample">
      <file name="index.html">

        <table bonitable>
          <thead>

              <tr>
                  <th><div bo-selectall></div></th>
                  <th>Name</th>
                  <th>Country</th>
              </tr>
          </thead>
          <tbody>
              <tr ng-repeat="user in users">
                  <td><input bo-selector="user" type="checkbox" /></td>
                  <td>{{user.name}}</td>
                  <td>{{user.country}}</td>
              </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>$allSelected</td>
              <td colspan="2"><pre>{{$allSelected | json}}</pre></td>
            </tr>
            <tr>
              <td>$indeterminate</td>
              <td colspan="2"><pre>{{$indeterminate | json}}</pre></td>
            </tr>
          </tfoot>
        </table>
      </file>
      <file name="script.js">
        angular
          .module('selectableExample', [
            'ui.bootstrap.tpls',
            'org.bonitasoft.bonitable',
            'org.bonitasoft.bonitable.selectable'
          ])
          .run(function($rootScope){
            $rootScope.users = [
              {name:'Paul', country:'Uk'},
              {name:'Sarah', country:'Fr'},
              {name:'Jacques', country:'Us'},
              {name:'Joan', country:'Al'},
              {name:'Tite', country:'Jp'},
            ];
          })
      </file>
    </example>
   */
  .directive('boSelectall', function(){
    // Runs during compile
    return {
      restrict: 'A', // E = Element, A = *Attribute, C = Class, M = Comment
      require: '^bonitable',
      replace: true,
      template: '<input type="checkbox" ng-checked="$allSelected" ng-click="$toggleAll()">',
      link: function(scope, elem){
        scope.$watch(function(){
          return scope.$indeterminate;
        }, function(newVal){
          elem[0].indeterminate  = newVal;
        });
      }
    };
  })
  /**
   * @ngdoc directive
   * @name bonita.selectable:boSelector
   * @module bonita.selectable
   * @element input
   * @description
   *
   * This directive could be used in association with {@link bonita.selectable:boSelector boSelector}.
   *
   *
   * The directive __bo-selector__ will updates ``$selectedItems`` which is exposed by {@link bonitable:bonitable bonitable} for all its child elements.
   *
   * By default, the directive will refer to a local property for defining the selected state of a row.
   * If you want to associate these property on the current row data, you use a ng-model
   *
   *
   * ```html
   * <input bo-selector="tag" ng-model="tag.selected" /></td>
   * ```
   *
   * @param {String} boSelector the data associated to the row from a ng-repeat
   *
   * @example
    <example module="selectorExample">
      <file name="index.html">

        <table bonitable>
          <thead>

              <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Country</th>
              </tr>
          </thead>
          <tbody>
              <tr ng-repeat="user in users">
                  <td><input bo-selector="user" type="checkbox" /></td>
                  <td>{{user.name}}</td>
                  <td>{{user.country}}</td>
              </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3"><pre>{{$selectedItems | json}}</pre></td>
            </tr>
          </tfoot>
        </table>
      </file>
      <file name="script.js">
        angular
          .module('selectorExample', [
            'ui.bootstrap.tpls',
            'org.bonitasoft.bonitable',
            'org.bonitasoft.bonitable.selectable'
          ])
          .run(function($rootScope){
            $rootScope.users = [
              {name:'Paul', country:'Uk'},
              {name:'Sarah', country:'Fr'},
              {name:'Jacques', country:'Us'},
              {name:'Joan', country:'Al'},
              {name:'Tite', country:'Jp'},
            ];
          })
      </file>
    </example>
   */
  .directive('boSelector', function(){
    // Runs during compile
    return {
      restrict: 'A', // E = Element, A = Attribute, C = Class, M = Comment
      require: '^bonitable',
      link: function($scope, elem, attr, bonitableCtrl) {
        var ngModel = elem.controller('ngModel');

         var item = {
          data: $scope.$eval(attr.boSelector),
          isChecked: function(){
            return ngModel && ngModel.$modelValue===true || elem[0].checked;
          },
          setChecked: function(value){
            if (ngModel){
              ngModel.$setViewValue(value===true);
              ngModel.$render();
            } else  {
              elem[0].checked = value;
            }
          }
        };

        elem.on('change', onChange);
        $scope.$on('$destroy', onDestroy);

        function onChange(){
          $scope.$apply();
        }

        function onDestroy(){
          bonitableCtrl.unregisterSelector(item);
        }
        bonitableCtrl.registerSelector(item);

      }
    };
  });

angular
  .module('org.bonitasoft.bonitable.repeatable', ['org.bonitasoft.bonitable'])
  .service('domAttributes', function(){
    this.copy = function(source, destination, needRemove) {
      [].slice.call(source.attributes).forEach(function (attr) {
        destination.setAttribute(attr.name, source.getAttribute(attr.name));
        if (needRemove) {
          source.removeAttribute(attr.name);
        }
      });
    };
  })
  .directive('columnTemplate', ['$compile', 'domAttributes', function ($compile, domAttributes) {
    return {
      restrict: 'A',
      scope: true,
      link: function (scope, element, attr) {

        var template = angular.element(attr.columnTemplate);
        var wrapper = angular.element('<div></div>');

        // copying the root node attributes to the wrapper element to compile them
        domAttributes.copy(template[0], wrapper[0], false);

        //compile the element
        var el = $compile(wrapper.append(template.contents()))(scope.$parent);

        // copying the compiled attributes to the root node and remove them from the wrapper
        domAttributes.copy(wrapper[0], element[0], true);
        element.append(el);
      }
    };
  }])
  /**
   * @ngdoc directive
   * @name bonita.repeatable:boRepeatable
   * @module bonita.repeatable
   *
   * @param {String=} boRepeatable a string representing a valid css selector
   *                  matching the thead where the columns are defined. By default the value is
   *                  ``thead tr:last-child``
   *
   * @description
   * Render table content dynamically in order to perform some columns manipulation
   * like show/hide or re-ordering. The directive will reconstruct a ng-repeat
   * under the hood to perform this but allow developper to get rid of it when
   * display the input. No need to add a generic function for cell rendering like
   * you will do when you put 2 ng-repeat directive inside.
   *
   * @example
   *
   * ```html
   *   <table bonitable bo-repeatable repeatable-config="colcfg" class="table">
   *     <thead>
   *       <tr>
   *         <td colspan="{{$columns.length}}" class="form-inline">
   *           <pre>{{$columns|json}}</pre>
   *           <label ng-repeat="col in $columns"><input type="checkbox" ng-model="col.visible"/>{{col.name}}</label>
   *         </td>
   *       </tr>
   *       <tr>
   *         <th>name</th>
   *         <th>country</th>
   *         <th data-ignore>action</th>
   *       </tr>
   *     </thead>
   *     <tbody>
   *       <tr ng-repeat="user in users">
   *         <td>{{user.name}}</td>
   *         <td>{{user.country}}</td>
   *         <td><button>&times;</button></td>
   *       </tr>
   *     </tbody>
   *   </table>
   * ```
   * ```javascript
   *   angular
   *     .module('boRepeaterExample', [
   *       'org.bonitasoft.bonitable',
   *       'org.bonitasoft.bonitable.repeatable',
   *       'org.bonitasoft.templates'
   *     ])
   *     .run(function($scope){
   *       $scope.users = [
   *         {name:'Paul', country:'Uk'},
   *         {name:'Sarah', country:'Fr'},
   *         {name:'Jacques', country:'Us'},
   *         {name:'Joan', country:'Al'},
   *         {name:'Tite', country:'Jp'},
   *       ];
   *       $scope.colcfg =[true, false];
   *     })
   * ```

   */
  .directive('boRepeatable', ['$interpolate', function ($interpolate) {
    return {
      require:'bonitable',
      restrict: 'A',
      compile: function (elem, attr, $scope) {

        var thSelecter  = attr[this.name] || 'thead tr:last-child';
        var tdSelecter = 'tr[ng-repeat]';

        var header = elem[0].querySelector(thSelecter);
        var row = elem[0].querySelector(tdSelecter);

        if (!header || !row || header.children.length !== row.children.length) {
          throw new Error('bo-repeatable th number does not correspond to td number. please verify you html table');
        }

        var columns = [];
        var tdCells =  row.children;

        var insertIndex;
        [].some.call(header.children, function(th, index){
          insertIndex = index;
          return th.getAttribute('data-ignore') === null;
        });


        /**
         * filter helper to test if data-ignore attribute is present on a Node
         * @param  {Object} item  an object containing both th and td node
         * @return {Boolean}      true id data-ignore is present
         */
        function filterIgnoreCell(item){
          return item.th.getAttribute('data-ignore') === null;
        }

        /**
         * dynamic filter function for filtering repeated columns
         * @param  {string}  Prop
         * @param  {Object}  column
         * @return {Boolean}
         */
        function columnFilter(prop, column) {
          return column[prop] === true;
        }
        var prop = attr.visibleProp || 'visible';

        columns = [].map.call(header.children, function(th, index) {
            return {th: th, td: tdCells[index]};
          })
          .filter(filterIgnoreCell)
          .map(function(item){
              angular.element(item.th).remove();
              angular.element(item.td).remove();
              var o = {
                name: $interpolate(item.th.textContent)($scope),
                header: item.th.outerHTML,
                cell: item.td.outerHTML
              };
              o[prop] = true;
              return o;
            });

        /**
         * create an HTMLElement for column-template which hold the ng-repeat
         * @param  {String} tagName
         * @param  {String} template
         * @return {HTMLElement}
         */
        function createNode(tagName, template) {
          var el = document.createElement(tagName);
          el.setAttribute('column-template', template);
          el.setAttribute('ng-repeat', 'column in $columns | filter:$visibilityFilter');

          return el;
        }
        var thRepeat = createNode('th', '{{::column.header}}');
        var tdRepeat = createNode('td', '{{::column.cell}}');

        header.insertBefore(thRepeat, header.children[insertIndex]);
        row.insertBefore(tdRepeat, row.children[insertIndex]);

        return function (scope) {
          scope.$columns = columns;
          scope.$visibilityFilter = columnFilter.bind(null, prop);
        };
      }
    };
  }])

  /**
   * @ngdoc directive
   * @name bonita.repeatable:repeatableConfig
   * @module bonita.repeatable
   *
   * @description
   * Allow preseting the visible property for each columns
   *
   * @param {String} visible-prop the name of the visible property to update in $columns arrays
   *
   * @example
    <example module="boRepeatConfigExample">
      <file name="index.html">
        <table bonitable bo-repeatable repeatable-config="colcfg" class="table">
          <thead>
            <tr >
              <td  ng-repeat="col in $columns">
                <span>column <strong>{{col.name}}</strong> is {{(col.visible? 'shown':'hided')}}</span>
              </td>
            </tr>
            <tr>
              <th>name</th>
              <th>country</th>
            </tr>
          </thead>
          <tbody>
            <tr ng-repeat="user in users">
              <td>{{user.name}}</td>
              <td>{{user.country}}</td>
            </tr>
          </tbody>
        </table>
      </file>
      <file name="script.js">
        angular
          .module('boRepeatConfigExample', [
            'org.bonitasoft.bonitable',
            'org.bonitasoft.bonitable.repeatable',
            'org.bonitasoft.templates'
          ])
          .run(function($rootScope){
            $rootScope.users = [
              {name:'Paul', country:'Uk'},
              {name:'Sarah', country:'Fr'},
              {name:'Jacques', country:'Us'},
              {name:'Joan', country:'Al'},
              {name:'Tite', country:'Jp'},
            ];
            $rootScope.colcfg =[true, false];

          })
      </file>
    </example>
   */
  .directive('repeatableConfig', function(){
    return {
      priority:1,
      require: 'bonitable',
      link: function(scope, elem, attr){
        scope.$watch(attr.repeatableConfig, function(visibleConfig){
          var prop = attr.visibleProp || 'visible';
          if (visibleConfig.length !== scope.$columns.length) {
            throw new Error('repeatable-config size differ from $columns size. Please check your config attr');
          }

          scope.$columns.forEach(function(item, index){
            item[prop] = visibleConfig[index];
          });
        });
      }
    };
  });

angular
  .module('org.bonitasoft.bonitable.sortable',['org.bonitasoft.bonitable'])
  /**
   * @ngdoc directive
   * @module bonita.sortable
   * @name bonita.sortable:boSorter
   *
   * @description
   * Tansforms a table heading into a button reflecting the current state of the sort
   * (sort upon which **property**, in which **direction**)?
   *
   * ## Requirements
   * To initialiaze the sort properties, you will need to set a ``sort-options`` to the
   * {@link bonitable.bonitable bonitable}. If you want to be notified each time
   * the sort have changed just provide a ``on-sort``  event handler to the
   *  {@link bonitable.bonitable bonitable} directive.
   *
   *
   * @param {String} boSorter the property name on which apply the sort _(optional)_
   *                          if __bo-sorter__ is empty, it will rely on the id attribute
   *                          to find the property name
   *
   * @example
    <example module="sorterExample">
      <file name="index.html">
        <p>sort called {{count}} times</p>
        <pre>{{options|json}}</pre>
        <table bonitable sort-options="options" on-sort="sortHandler()">
          <thead>
            <tr>
              <th bo-sorter="name">name</th>
              <th bo-sorter="country">country</th>
            </tr>
          </thead>
          <tbody>
            <tr ng-repeat="user in users | orderBy: options.property : options.direction ">
              <td>{{user.name}}</td>
              <td>{{user.country}}</td>
            </tr>
          </tbody>
        </table>
      </file>
      <file name="script.js">
        angular
          .module('sorterExample', [
            'ui.bootstrap.tpls',
            'org.bonitasoft.bonitable',
            'org.bonitasoft.templates',
            'org.bonitasoft.bonitable.sortable'
          ])
          .run(function($rootScope){
            $rootScope.users = [
              {name:'Paul', country:'Uk'},
              {name:'Sarah', country:'Fr'},
              {name:'Jacques', country:'Us'},
              {name:'Joan', country:'Al'},
              {name:'Tite', country:'Jp'},
            ];
            $rootScope.count = 0;
            $rootScope.sortHandler = function() {
              $rootScope.count += 1 ;
            };
            $rootScope.options = {
              property: 'name',
              direction: false
            }
          })
      </file>
    </example>
   */
  .directive('boSorter', function(){

    /**
     * Translate the boolean direction for the order of the sort
     * @param  {Boolean} isDesc
     * @return {Strinc}
     */
    function getDirectionSort(isDesc) {
      return isDesc ? 'DESC' : 'ASC';
    }

    /**
     * Find the attribute title for the directive for desc mode or asc mode (default one)
     * @param  {Object} attr Angular directive attr
     * @param  {String} sort cf {@link getDirectionSort}
     * @return {String}
     */
    function generateTitle(attr, sort) {
      // Add a suffix with ucFirst
      var key = 'boSorterTitle' + sort.charAt() + sort.substring(1).toLowerCase();
      return attr[key] || 'Sort by ' + sort;
    }

    return {
      restrict: 'A',
      scope: true,
      require:'^bonitable',
      templateUrl: 'template/sortable/sorter.tpl.html',
      transclude: true,
      link: function($scope, iElm, attr, bonitableCtrl) {
        $scope.property =  (attr.boSorter || attr.id || '').trim();

        if ($scope.property.length === 0){
          throw new Error('bo-sorter: no id found. Please specify on wich property the sort is applied to or add an id');
        }

        $scope.sortOptions = bonitableCtrl.getOptions();

        var sort = getDirectionSort($scope.sortOptions.direction);

        // Set de default title if no title exist
        $scope.titleSortAttr = generateTitle(attr, sort);

        $scope.sort = function() {
          if ($scope.sortOptions.property === $scope.property){
            $scope.sortOptions.direction = !$scope.sortOptions.direction;
          } else {
            $scope.sortOptions.property = $scope.property;
            $scope.sortOptions.direction = false;
          }

          sort = getDirectionSort($scope.sortOptions.direction);
          $scope.titleSortAttr = generateTitle(attr, sort);

          bonitableCtrl.triggerSortHandler($scope.sortOptions);
        };
      }
    };
  });

'use strict';
/**
 *
 */
angular.module('org.bonitasoft.bonitable.settings', [
  'ui.bootstrap.dropdown',
  'ui.bootstrap.buttons'
  ])

  /**
   * @ngdoc directive
   * @name bonita.settings:tableSettings
   * @module bonita.settings
   *
   * @description
   *
   * Table settings create a simple widget to manage table settings.
   * ## pagination settings
   * table settings create a small component to choose pageSize.
   * If you do it on the client side, here how you can achieve it.
   * simply create this slice filter
   * ```js
   * //Create a slice filter
   * app.filter('slice', function() {
   *   return function(input, start) {
   *     start = parseInt(start,10) || 0 ;
   *     return input.slice(start);
   *   };
   * })
   * ```
   *and add the slice filter with a limitTo filter on a ng-repeat
   *``ng-repeat="user in users | slice: (pagination.currentPage-1) * pagination.pageSize | limitTo:pagination.pageSize">``
   *
   * ## columns visibility
   * If you provide a columns attributes, the component will also render a list of columns with a checkbox associated to it.
   * the checlkbox value will represent the column visibility, so you can easily toggle their visibility.
   *
   * ## column reordering
   *
   * the table-settings component also permit to re-order the columns from the columsn list, using drag and drop.
   * this behaviour is optionnal, so if you need that feature, you will also need to add a ``<script>`` tag
   * to include the ng-sortable library (in the bower_components dir, since __ng-sortable__ is as a bower dependency.
   *
   * @example
   *
   * ```html
   *     <table bonitable class="table">
   *       <thead>
   *         <tr>
   *           <th colspan="2">
   *             <table-settings page-size="pageSize" sizes="sizes" columns="columns"></table-settings>
   *           </th>
   *         </tr>
   *         <tr>
   *           <th ng-repeat="col in columns | filter: col.visible">{{col.name}}</th>
   *         </tr>
   *       </thead>
   *       <tbody>
   *         <tr ng-repeat="user in users">
   *           <td ng-repeat="col in columns | filter: col.visible">{{user[col.name]}}</td>
   *         </tr>
   *       </tbody>
   *     </table>
   * ```
   * ```javascript
   *     angular
   *       .module('settingsExample', [
   *         'org.bonitasoft.bonitable',
   *         'org.bonitasoft.bonitable.settings',
   *         'org.bonitasoft.templates',
   *         'ui.bootstrap.tpls'
   *       ])
   *       .filter('slice', function() {
   *         return function(input, start) {
   *           start = parseInt(start,10) || 0 ;
   *           return input.slice(start);
   *         };
   *       })
   *       .filter('translate', function() {
   *         return function(input) {
   *           return input;
   *         };
   *       })
   *       .run(function($rootScope){
   *         $rootScope.users = [
   *           {name:'Paul', country:'Uk'},
   *           {name:'Sarah', country:'Fr'},
   *           {name:'Jacques', country:'Us'},
   *           {name:'Joan', country:'Al'},
   *           {name:'Tite', country:'Jp'},
   *         ];
   *         $rootScope.pageSize = 10;
   *         $rootScope.sizes = [1, 10, 100];
   *         $rootScope.columns = [{name:'name', visible:true},{name:'country', visible:true}];
   *       })
   *  ```
   *
   * @param {Array} columns an array of object representing the columns of the table.
   *                        Each object should have a  ``visible`` property and a ``name`` property
   *                          The name of these properties is customizable
   * @param {Array} sizes an array of int, containing the different number of element per pages
   * @param {int} pageSize the actual number per page value
   * @param {String} labelProp the name of the property reprensenting the columns name
   * @param {String} visibleProp the name of the property reprensenting the columns visibility
   * @param {function} updatePageSize a handler function wich is called each time the pageSize settings changed
   * @param {function} updateVisibility a handler function wich is called each time o columns visibility changes
   *
   */
  .directive('tableSettings', function(){
    // Runs during compile
    return {
      templateUrl: 'template/table-settings/tableSettings.tpl.html',
      replace: true,
      scope:{
        columns: '=',
        sizes: '=',
        pageSize: '=',
        labelProp:'@',
        visibleProp:'@',
        updatePageSize: '&',
        updateVisibility: '&'
      },
      link: function(scope, elem, attr) {
        scope.visible = attr.visibleProp || 'visible';
        scope.label = attr.labelProp || 'name';
        scope.isDragging = false;

        scope.sortableOptions = {};

      }
    };
  });

(function(module) {
try {
  module = angular.module('org.bonitasoft.templates');
} catch (e) {
  module = angular.module('org.bonitasoft.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('template/sortable/sorter.tpl.html',
    '<button class="bo-SortButton"\n' +
    '        title="{{titleSortAttr}}"\n' +
    '        ng-class="{\'bo-SortButton--active text-primary\':sortOptions.property === property}" ng-click="sort()">\n' +
    '  <span class="bo-SortButton-label" ng-transclude></span>\n' +
    '  <i class="bo-SortButton-icon" ng-class="{\'icon-sort-up\': !sortOptions.direction || sortOptions.property !== property, \'icon-sort-down\': sortOptions.direction && sortOptions.property === property}"></i>\n' +
    '</button>\n' +
    '');
}]);
})();

(function(module) {
try {
  module = angular.module('org.bonitasoft.templates');
} catch (e) {
  module = angular.module('org.bonitasoft.templates', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('template/table-settings/tableSettings.tpl.html',
    '<div class="bo-TableSettings pull-right" dropdown>\n' +
    '  <button type="button"\n' +
    '    id="aria-tablesettings"\n' +
    '    class="btn btn-default bo-Settings dropdown-toggle"\n' +
    '    title="{{\'Table settings\' | translate}}"\n' +
    '    ng-disabled="tasks.length === 0"\n' +
    '    aria-labelledby="aria-tablesettings">\n' +
    '    <i class="icon icon-gear"></i>\n' +
    '    <span class="sr-only">{{\'Table settings\' | translate}}</span>\n' +
    '  </button>\n' +
    '\n' +
    '  <div class="bo-TableSettings-content dropdown-menu pull-right" role="menu" aria-labelledby="aria-tablesettings">\n' +
    '    <h5 class="bo-TableSettings-title" >{{\'Items per page\'| translate}}</h5>\n' +
    '    <div class="btn-group btn-group-justified" role="group">\n' +
    '      <div class="btn-group" role="group" ng-repeat="size in sizes">\n' +
    '        <button class="btn btn-default"\n' +
    '          type="button"\n' +
    '          ng-model="$parent.pageSize" btn-radio="{{::size}}"\n' +
    '          ng-click="updatePageSize({size:size})" tabindex="0">\n' +
    '          {{size}}\n' +
    '        </button>\n' +
    '      </div>\n' +
    '    </div>\n' +
    '\n' +
    '    <h5 class="bo-TableSettings-title" >{{\'Columns selection\' | translate}}</h5>\n' +
    '    <ul class="bo-TableSettings-columns bo-Text-disableSelection" as-sortable="sortableOptions" ng-model="columns">\n' +
    '      <li  ng-repeat="field in columns" as-sortable-item>\n' +
    '      <div as-sortable-item-handle ng>\n' +
    '      <label\n' +
    '        class="bo-TableSettings-column"\n' +
    '        title="{{((field.visible ? \'Hide\' : \'Show\') +\' \'+ field[label]) | translate}}"\n' +
    '        ng-click="$event.stopPropagation()">\n' +
    '        <span class="glyphicon glyphicon-align-justify grabHover"></span>\n' +
    '        <span class="glyphicon glyphicon-align-justify grabHover"></span>\n' +
    '        <input type="checkbox" ng-model="field[visible]" ng-change="updateVisibility({field:field})">\n' +
    '        {{::field[label]}}\n' +
    '      </label>\n' +
    '      </div>\n' +
    '      </li>\n' +
    '    </ul>\n' +
    '  </div>\n' +
    '</div>\n' +
    '');
}]);
})();
