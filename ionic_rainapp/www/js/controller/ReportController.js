'use strict';

angular.module('report.controllers', []).controller('ReportController', function ($scope, $ionicPopup, $http, apiUrl, $rootScope, LoginService, ApiService, CachingService) {

  /**
   * Init
   */

  //Set up the form
  resetForm();

  $scope.$on('$ionicView.enter', function (e) {
    checkUserStatus();
    $scope.cachedReports = CachingService.getReportCache();
  });

  $scope.$on('login-state-changed', function (e) {
    checkUserStatus();
  });

  $scope.refreshUser = function () {
    //Perform login again - in case user's verification status has changed:
    LoginService.reAuthenticateUser().then(function (response) {
      var currentUser = $rootScope.globals.currentUser;
      console.log("currentUser: " + JSON.stringify(currentUser));
      checkUserStatus();
    }, function (error) {});
  };

  function checkUserStatus() {
    $scope.isUserNotLoggedIn = false;
    $scope.isUserNotVerified = false;
    $scope.isUserLoggedInAndVerified = false;

    var currentUser = $rootScope.globals.currentUser;

    if (!currentUser) {
      $scope.isUserNotLoggedIn = true;
    } else if (currentUser.verified == false) {
      $scope.isUserNotVerified = true;
    } else {
      $scope.isUserLoggedInAndVerified = true;
    }
  }

  // Validate and submit form
  $scope.sendReport = function (form) {

    // TODO: Validate fields
    if ($scope.form.postcode == null || $scope.form.postcode == null || $scope.form.postcode == null || $scope.form.postcode == null) {
      console.log("Fill out the form!");
      var alertPopup = $ionicPopup.alert({
        title: 'Error',
        template: "Please fill out all the fields"
      });
    } else {
      (function () {
        var data = {
          postcode: $scope.form.postcode,
          value: $scope.form.value,
          resourceId: $scope.form.resourceId,
          date: $scope.form.date
        };

        ApiService.updateReading(data).then(function (response) {
          displayMessage("Thanks!", "Submitted successfully.");
          resetForm();
        }).catch(function (err) {
          if (err.status === 0) {
            displayMessage("Connection Error", "Saving for later submission.");
            CachingService.addReportToCache(data);
            $scope.cachedReports = CachingService.getReportCache();
            resetForm();
          } else {
            console.log("Error: ", err);
            displayMessage("Error", err.data.error.message);
          }
        });
      })();
    }
  };

  $scope.submit = function (index) {
    var report = CachingService.getReportAtIndex(index);
    ApiService.updateReading(report).then(function (response) {
      console.log("Submitted successfully", response);
      displayMessage("Thanks!", "Submitted successfully.");
      CachingService.deleteReportAtIndex(index);
      $scope.cachedReports = CachingService.getReportCache();
    }).catch(function (err) {
      if (err.status === 0) {
        displayMessage("Connection Error", "Still having trouble connecting. Please try again later.");
      } else {
        console.log("Error: ", err);
        displayMessage("Error", err.data.error.message);
      }
    });
  };

  $scope.delete = function (index) {
    CachingService.deleteReportAtIndex(index);
    $scope.cachedReports = CachingService.getReportCache();
  };

  /**
   *  Helper functions
   */

  function displayMessage(title, message) {
    var alertPopup = $ionicPopup.alert({
      title: title,
      template: message
    });
  }

  function resetForm() {
    $scope.form = {};
    $scope.form.date = new Date();
  }
});