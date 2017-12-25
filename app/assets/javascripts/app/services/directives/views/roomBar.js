class RoomBar {

  constructor() {
    this.restrict = "E";
    this.templateUrl = "frontend/directives/room-bar.html";
    this.scope = {
    };
  }

  controller($rootScope, $scope, desktopManager, syncManager, modelManager, componentManager, $timeout) {
    'ngInject';

    $scope.componentManager = componentManager;
    $scope.rooms = [];

    modelManager.addItemSyncObserver("room-bar", "SN|Component", (allItems, validItems, deletedItems, source) => {
      $scope.rooms = _.uniq($scope.rooms
        .concat(allItems
        .filter((candidate) => {return candidate.area == "rooms"})))
        .filter((candidate) => {return !candidate.deleted});
    });

    componentManager.registerHandler({identifier: "roomBar", areas: ["rooms"], activationHandler: (component) => {
      if(component.active) {
        $timeout(() => {
          var iframe = componentManager.iframeForComponent(component);
          if(iframe) {
            var lastSize = component.getRoomLastSize();
            if(lastSize) {
              componentManager.handleSetSizeEvent(component, lastSize);
            }
            iframe.onload = function() {
              componentManager.registerComponentWindow(component, iframe.contentWindow);
            }.bind(this);
          }
        });
      }
    }, actionHandler: (component, action, data) => {
      if(action == "set-size") {
        componentManager.handleSetSizeEvent(component, data);
        component.setRoomLastSize(data);
      }
    }});

    $scope.selectRoom = function(room) {
      room.show = !room.show;
      if(room.show) {
        this.componentManager.activateComponent(room);
      } else {
        this.componentManager.deactivateComponent(room);
      }
    }

  }


}

angular.module('app.frontend').directive('roomBar', () => new RoomBar);