(function() {
    "use strict";

    var directive = function($timeout, $compile) {
        return {
            restrict: "A",
            scope: {
                tooltip: "@",
                fixedPosition: "=",
                tooltipClass: "@"
            },
            link: function($scope, element, attrs) {
                // adds the tooltip to the body
                $scope.createTooltip = function(event) {
                    if (attrs.tooltip) {
                        // create the tooltip
                        $scope.tooltipElement = angular
                            .element("<div>")
                            .addClass("angular-tooltip")
                            .addClass($scope.tooltipClass);

                        // append to the body
                        angular
                            .element(document)
                            .find("body")
                            .append($scope.tooltipElement);

                        // update the contents and position
                        $scope.updateTooltip(attrs.tooltip);

                        // fade in
                        $scope.tooltipElement.addClass(
                            "angular-tooltip-fade-in"
                        );
                    }
                };

                $scope.updateTooltip = function(tooltip) {
                    // insert html into tooltip
                    $scope.tooltipElement.html(tooltip);

                    // compile html contents into angularjs
                    $compile($scope.tooltipElement.contents())($scope);

                    // calculate the position of the tooltip
                    var pos = $scope.calculatePosition(
                        $scope.tooltipElement,
                        $scope.getDirection()
                    );
                    $scope.tooltipElement
                        .addClass("angular-tooltip-" + pos.direction)
                        .css(pos);

                    // stop the standard tooltip from being shown
                    $timeout(function() {
                        element.removeAttr("ng-attr-tooltip");
                        element.removeAttr("tooltip");
                    });
                };

                // if the tooltip changes the update the tooltip
                $scope.$watch("tooltip", function(newTooltip) {
                    if ($scope.tooltipElement) {
                        $scope.updateTooltip(newTooltip);
                    }
                });

                // removes all tooltips from the document to reduce ghosts
                $scope.removeTooltip = function() {
                    var tooltip = angular.element(
                        document.querySelectorAll(".angular-tooltip")
                    );
                    // tooltip.removeClass('angular-tooltip-fade-in');

                    // $timeout(function() {
                    tooltip.remove();
                    // }, 300);
                };

                // gets the current direction value
                $scope.getDirection = function() {
                    return element.attr("tooltip-direction") || "top";
                };

                // gets the bottom space value
                $scope.getBottomSpace = function() {
                    return element.attr("tooltip-space-bottom") || 0;
                };

                // gets the top space value
                $scope.getTopSpace = function() {
                    return element.attr("tooltip-space-top") || 0;
                };

                // gets the left space value
                $scope.getLeftSpace = function() {
                    return element.attr("tooltip-space-left") || 0;
                };

                // gets the right space value
                $scope.getRightSpace = function() {
                    return element.attr("tooltip-space-right") || 0;
                };

                // calculates the position of the tooltip
                $scope.calculatePosition = function(tooltip, direction) {
                    var tooltipBounding = tooltip[0].getBoundingClientRect();
                    var elBounding = element[0].getBoundingClientRect();
                    var scrollLeft =
                        window.scrollX || document.documentElement.scrollLeft;
                    var scrollTop =
                        window.scrollY || document.documentElement.scrollTop;
                    var arrow_padding = 12;
                    var pos = {};
                    var newDirection = null;
                    var addedSpace;

                    // calculate the left position
                    if ($scope.stringStartsWith(direction, "left")) {
                        addedSpace = $scope.getAddedSpace(
                            $scope.getLeftSpace()
                        );
                        pos.left =
                            elBounding.left -
                            tooltipBounding.width -
                            arrow_padding / 2 +
                            scrollLeft -
                            addedSpace;
                    } else if ($scope.stringStartsWith(direction, "right")) {
                        addedSpace = $scope.getAddedSpace(
                            $scope.getRightSpace()
                        );
                        pos.left =
                            elBounding.left +
                            elBounding.width +
                            arrow_padding / 2 +
                            scrollLeft -
                            addedSpace;
                    } else if ($scope.stringContains(direction, "left")) {
                        addedSpace = $scope.getAddedSpace(
                            $scope.getLeftSpace()
                        );
                        pos.left =
                            elBounding.left -
                            tooltipBounding.width +
                            arrow_padding +
                            scrollLeft -
                            addedSpace;
                    } else if ($scope.stringContains(direction, "right")) {
                        addedSpace = $scope.getAddedSpace(
                            $scope.getRightSpace()
                        );
                        pos.left =
                            elBounding.left +
                            elBounding.width -
                            arrow_padding +
                            scrollLeft -
                            addedSpace;
                    } else {
                        pos.left =
                            elBounding.left +
                            elBounding.width / 2 -
                            tooltipBounding.width / 2 +
                            scrollLeft;
                    }

                    // calculate the top position
                    if ($scope.stringStartsWith(direction, "top")) {
                        addedSpace = $scope.getAddedSpace($scope.getTopSpace());
                        var topSpace = $scope.getTopSpace() || 0;
                        if (typeof topSpace === "string")
                            topSpace = parseInt(topSpace);
                        pos.top =
                            elBounding.top -
                            tooltipBounding.height -
                            arrow_padding / 2 +
                            scrollTop -
                            addedSpace;
                    } else if ($scope.stringStartsWith(direction, "bottom")) {
                        addedSpace = $scope.getAddedSpace(
                            $scope.getBottomSpace()
                        );
                        pos.top =
                            elBounding.top +
                            elBounding.height +
                            arrow_padding / 2 +
                            scrollTop;
                    } else if ($scope.stringContains(direction, "top")) {
                        addedSpace = $scope.getAddedSpace($scope.getTopSpace());
                        pos.top =
                            elBounding.top -
                            tooltipBounding.height +
                            arrow_padding +
                            scrollTop;
                    } else if ($scope.stringContains(direction, "bottom")) {
                        addedSpace = $scope.getAddedSpace(
                            $scope.getBottomSpace()
                        );
                        pos.top =
                            elBounding.top +
                            elBounding.height -
                            arrow_padding +
                            scrollTop;
                    } else {
                        pos.top =
                            elBounding.top +
                            elBounding.height / 2 -
                            tooltipBounding.height / 2 +
                            scrollTop;
                    }

                    // check if the tooltip is outside the bounds of the window
                    if ($scope.fixedPosition) {
                        if (pos.left < scrollLeft) {
                            newDirection = direction.replace("left", "right");
                        } else if (
                            pos.left + tooltipBounding.width >
                            window.innerWidth + scrollLeft
                        ) {
                            newDirection = direction.replace("right", "left");
                        }

                        if (pos.top < scrollTop) {
                            newDirection = direction.replace("top", "bottom");
                        } else if (
                            pos.top + tooltipBounding.height >
                            window.innerHeight + scrollTop
                        ) {
                            newDirection = direction.replace("bottom", "top");
                        }

                        if (newDirection) {
                            return $scope.calculatePosition(
                                tooltip,
                                newDirection
                            );
                        }
                    }

                    pos.left += "px";
                    pos.top += "px";
                    pos.direction = direction;

                    return pos;
                };

                $scope.getAddedSpace = function(space) {
                    if (!space) return 0;

                    var spaceToUse = parseInt(space);

                    return spaceToUse;
                };

                $scope.stringStartsWith = function(searchString, findString) {
                    return (
                        searchString.substr(0, findString.length) === findString
                    );
                };

                $scope.stringContains = function(searchString, findString) {
                    return searchString.indexOf(findString) !== -1;
                };

                if (attrs.tooltip) {
                    // attach events to show tooltip
                    element.on("mouseover", $scope.createTooltip);
                    element.on("mouseout", $scope.removeTooltip);
                } else {
                    // remove events
                    element.off("mouseover", $scope.createTooltip);
                    element.off("mouseout", $scope.removeTooltip);
                }

                element.on("destroy", $scope.removeTooltip);
                $scope.$on("$destroy", $scope.removeTooltip);
            }
        };
    };

    directive.$inject = ["$timeout", "$compile"];

    angular.module("tooltips", []).directive("tooltip", directive);
})();
