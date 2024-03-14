import { Component, OnInit } from '@angular/core';
import {registerPlugin} from "@capacitor/core";
import { LocalNotifications } from '@capacitor/local-notifications';
// import { BackgroundGeolocationPlugin } from 'cordova-background-geolocation-plugin';

// This is important!
// declare const BackgroundGeolocation: BackgroundGeolocationPlugin;


import {BackgroundGeolocationPlugin} from "@capacitor-community/background-geolocation";
const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>("BackgroundGeolocation");

@Component({
  selector: 'app-travel',
  templateUrl: './travel.component.html',
  styleUrls: ['./travel.component.scss']
})
export class TravelComponent implements OnInit {
  
  // options: L.MapOptions = { zoom: 6.5, center: [52.5900535, 9.00511] };
  // baseLayer: L.Layer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
  
  // marker will be defined later by the first location update
  // marker!: L.Marker;
  
  // // using rxjs pipe to aggregate tasks and output the marker
  // marker$ = this.geolocation.position$.pipe(
  //   filter((latLng) => latLng != undefined),
  //   tap((latLng) => this.updateMarker(latLng)),
  //   map(() => this.marker as any),
  // );

  // geolocation service you just created
  constructor() {}
  
  ngOnInit(): void {

    // this.onDeviceReady();

    // To start listening for changes in the device's location, add a new watcher.
    // You do this by calling 'addWatcher' with an options object and a callback. An
    // ID is returned, which can be used to remove the watcher in the future. The
    // callback will be called every time a new location is available. Watchers can
    // not be paused, only removed. Multiple watchers may exist at the same time.
    const watcher_id = BackgroundGeolocation.addWatcher(
      {
    //       // If the "backgroundMessage" option is defined, the watcher will
          // provide location updates whether the app is in the background or the
          // foreground. If it is not defined, location updates are only
          // guaranteed in the foreground. This is true on both platforms.

          // On Android, a notification must be shown to continue receiving
          // location updates in the background. This option specifies the text of
          // that notification.
          backgroundMessage: "Cancel to prevent battery drain.",

          // The title of the notification mentioned above. Defaults to "Using
          // your location".
          backgroundTitle: "Tracking You.",

          // Whether permissions should be requested from the user automatically,
          // if they are not already granted. Defaults to "true".
          requestPermissions: true,

          // If "true", stale locations may be delivered while the device
          // obtains a GPS fix. You are responsible for checking the "time"
          // property. If "false", locations are guaranteed to be up to date.
          // Defaults to "false".
          stale: false,

          // The minimum number of metres between subsequent locations. Defaults
          // to 0.
          distanceFilter: 50
      },
      function callback(location, error) {
        if (error) {
            if (error.code === "NOT_AUTHORIZED") {
                if (window.confirm(
                    "This app needs your location, " +
                    "but does not have permission.\n\n" +
                    "Open settings now?"
                )) {
                    // It can be useful to direct the user to their device's
                    // settings when location permissions have been denied. The
                    // plugin provides the 'openSettings' method to do exactly
                    // this.
                    BackgroundGeolocation.openSettings();
                }
            }
            return console.error(error);
        }

        return console.log(location);
    }
    ).then(function after_the_watcher_has_been_added(watcher_id) {
    // When a watcher is no longer needed, it should be removed by calling
    // 'removeWatcher' with an object containing its ID.
      BackgroundGeolocation.removeWatcher({
          id: watcher_id
      });
    });

    // If you just want the current location, try something like this. The longer
    // the timeout, the more accurate the guess will be. I wouldn't go below about
    // 100ms.
    function guess_location(callback: any, timeout: number) {
      let last_location: any;
      BackgroundGeolocation.addWatcher(
          {
              requestPermissions: false,
              stale: true
          },
          function (location) {
              last_location = location || undefined;
              const speedSpan = document.getElementById('speed');
              if (speedSpan) {
                speedSpan.innerHTML = last_location.coords.speed;
              }
          }
      ).then(function (id) {
          setTimeout(function () {
              callback(last_location);
              BackgroundGeolocation.removeWatcher({id});
          }, timeout);
      });
    }
    guess_location;
  }

  public displayChallenges() {
    const overlay_message = document.getElementById('overlay_message');
    if (overlay_message) {
      overlay_message.style.display = 'block';
    }
  }

  public request_permissions() {
    LocalNotifications.requestPermissions().then(
      function (status) {
        console.log("Notification permissions " + status.display);
      }
    );
  }

  // private onDeviceReady() {
  //   BackgroundGeolocation.configure({
  //     locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
  //     desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
  //     stationaryRadius: 50,
  //     distanceFilter: 50,
  //     notificationTitle: 'Background tracking',
  //     notificationText: 'enabled',
  //     debug: true,
  //     interval: 10000,
  //     fastestInterval: 5000,
  //     activitiesInterval: 10000,
  //     // url: 'http://192.168.81.15:3000/location',
  //     // httpHeaders: {
  //     //   'X-FOO': 'bar'
  //     // },
  //     // customize post properties
  //     postTemplate: {
  //       lat: '@latitude',
  //       lon: '@longitude',
  //       foo: 'bar' // you can also add your own properties
  //     }
  //   });
  
  //   BackgroundGeolocation.on('location', function(location) {
  //     // handle your locations here
  //     console.log(location);
  //     const speedSpan = document.getElementById('speed');
  //     if (speedSpan && location) {
  //       speedSpan.innerHTML = location.speed + ' km/h';
  //     }

  //     // to perform long running operation on iOS
  //     // you need to create background task
  //     BackgroundGeolocation.startTask(function(taskKey) {
  //       // execute long running task
  //       // eg. ajax post location
  //       // IMPORTANT: task has to be ended by endTask
  //       BackgroundGeolocation.endTask(taskKey);
  //     });
  //   });
  
  //   BackgroundGeolocation.on('stationary', function(stationaryLocation) {
  //     // handle stationary locations here
  //   });
  
  //   BackgroundGeolocation.on('error', function(error) {
  //     console.log('[ERROR] BackgroundGeolocation error:', error.code, error.message);
  //   });
  
  //   BackgroundGeolocation.on('start', function() {
  //     console.log('[INFO] BackgroundGeolocation service has been started');
  //   });
  
  //   BackgroundGeolocation.on('stop', function() {
  //     console.log('[INFO] BackgroundGeolocation service has been stopped');
  //   });
  
  //   BackgroundGeolocation.on('authorization', function(status) {
  //     console.log('[INFO] BackgroundGeolocation authorization status: ' + status);
  //     if (status !== BackgroundGeolocation.AUTHORIZED) {
  //       // we need to set delay or otherwise alert may not be shown
  //       setTimeout(() => {
  //         var showSettings = confirm('App requires location tracking permission. Would you like to open app settings?');
  //         if (showSettings) {
  //           return BackgroundGeolocation.showAppSettings();
  //         } else 
  //         {
  //           return;
  //         }
  //       }, 1000);
  //     }
  //   });
  
  //   BackgroundGeolocation.on('background', function() {
  //     console.log('[INFO] App is in background');
  //     // you can also reconfigure service (changes will be applied immediately)
  //     BackgroundGeolocation.configure({ debug: true });
  //   });
  
  //   BackgroundGeolocation.on('foreground', function() {
  //     console.log('[INFO] App is in foreground');
  //     BackgroundGeolocation.configure({ debug: false });
  //   });
  
  //   BackgroundGeolocation.on('abort_requested', function() {
  //     console.log('[INFO] Server responded with 285 Updates Not Required');
  
  //     // Here we can decide whether we want stop the updates or not.
  //     // If you've configured the server to return 285, then it means the server does not require further update.
  //     // So the normal thing to do here would be to `BackgroundGeolocation.stop()`.
  //     // But you might be counting on it to receive location updates in the UI, so you could just reconfigure and set `url` to null.
  //   });
  
  //   BackgroundGeolocation.on('http_authorization', () => {
  //     console.log('[INFO] App needs to authorize the http requests');
  //   });
  
  //   BackgroundGeolocation.checkStatus(function(status) {
  //     console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
  //     console.log('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
  //     console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);
  
  //     // you don't need to check status before start (this is just the example)
  //   //   if (!status.isRunning) {
  //   // BackgroundGeolocation.start(); //triggers start on start event
  //   //   }
  //   });
  
  //   // you can also just start without checking for status

  
  //   // Don't forget to remove listeners at some point!
  //   // BackgroundGeolocation.removeAllListeners();
  // }

  // public start() {
  //   BackgroundGeolocation.start();
  // }

}

