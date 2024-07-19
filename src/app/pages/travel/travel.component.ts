import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { BackgroundGeolocationService } from 'src/app/services/background-geolocation.service';
import { TravelService } from './services/travel.service';
import {
  BackgroundGeolocationPlugin,
  ConfigureOptions,
  Location,
} from "cordova-background-geolocation-plugin";
import { API_URL } from 'src/environments/env.dev';

// access to its functions
declare const BackgroundGeolocation: BackgroundGeolocationPlugin;

export  class Travel {
  name?: string;
  date!: any;
  speed!: number;
  co2!: number;
}

@Component({
  selector: 'app-travel',
  templateUrl: './travel.component.html',
  styleUrls: ['./travel.component.scss']
})
export class TravelComponent implements OnInit {
  private geoloc: any;
  private options = {
    enableHighAccuracy: true,
    timeout: 5000,
  };

  private config!: ConfigureOptions;
  public travelTimeSerie: Travel[] = [];
  
  constructor(private geolocationService: BackgroundGeolocationService, private travelService: TravelService) {}
  
  ngOnInit(): void {
    this.updateData();
  }

  updateData() {
    console.log('#update Data');
    this.geolocationService.getData().subscribe({
      next: (val) => {
        if (val && val.data) {
        this.travelTimeSerie = JSON.parse(val.data);
        this.travelTimeSerie = this.travelService.formatDate(this.travelTimeSerie);
        console.log('# Database data');
        console.log(this.travelTimeSerie);
        }
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  // call this function whenever you are ready to track!
  async init() {
    this.config = {
      // shared config
      debug: true,
      interval: 1000, // Adjust as needed
      fastestInterval: 500, // Faster interval for high-speed movement
      activitiesInterval: 10000, // Adjust based on activity updates
      stationaryRadius: 50, // Smaller radius since trains move continuously
      desiredAccuracy: BackgroundGeolocation.MEDIUM_ACCURACY, // Use high accuracy for precise updates
      locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
      distanceFilter: 10, // Smaller distance filter for frequent updates
  
      // android specific config
      startForeground: true,
      notificationsEnabled: true,
      notificationTitle: "Tracking",
      notificationText: "Your location is being tracked on the train!",
      notificationIconColor: "#424242",
      notificationIconSmall: "ic_location",
  
      // ios specific config
      saveBatteryOnBackground: false, // Do not save battery to ensure continuous tracking
      pauseLocationUpdates: false, // Do not pause updates
    };
  
    // insert config
    await BackgroundGeolocation.configure(this.config);
    // this will trigger the permission request if not yet granted
    await BackgroundGeolocation.start();
  
    // Event listeners
    BackgroundGeolocation.on('start', () => {
      console.log('[INFO] BackgroundGeolocation service has been started');
    });
  
    BackgroundGeolocation.on('error', (error) => {
      console.log('[ERROR] BackgroundGeolocation error:', error.code, error.message);
    });
  
    BackgroundGeolocation.on('authorization', (status) => {
      console.log('[INFO] BackgroundGeolocation authorization status: ' + status);
      if (status !== BackgroundGeolocation.AUTHORIZED) {
        // we need to set delay or otherwise alert may not be shown
        setTimeout(() => {
          var showSettings = confirm('App requires location tracking permission. Would you like to open app settings?');
          if (showSettings) {
            BackgroundGeolocation.showAppSettings();
          }
        }, 1000);
      }
    });
  
    BackgroundGeolocation.on('background', () => {
      console.log('[INFO] App is in background');
    });
  
    BackgroundGeolocation.on('foreground', () => {
      console.log('[INFO] App is in foreground');
    });
  
    BackgroundGeolocation.checkStatus((status) => {
      console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
      console.log('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
      console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);
  
      // you don't need to check status before start (this is just the example)
      if (!status.isRunning) {
        BackgroundGeolocation.start(); //triggers start on start event
      }
    });
  
    // Create a listener for location updates
    BackgroundGeolocation.on("location").subscribe((location) => {
      this.updateLocation(location);
    });
  
    BackgroundGeolocation.on('stationary', (stationaryLocation) => {
      console.log('I am in stationary mode');
    });
  
    BackgroundGeolocation.on('abort_requested', () => {
      console.log('[INFO] Server responded with 285 Updates Not Required');
      // Here we can decide whether we want stop the updates or not.
    });
  
    BackgroundGeolocation.on('http_authorization', () => {
      console.log('[INFO] App needs to authorize the http requests');
    });
  }

  private updateLocation(location: Location) {
    this.updateData();

    if (location == undefined) return;
    console.log("Speed:", location.speed);
    const speedSpan = document.getElementById('speed_background');
    if (location.speed && speedSpan) {
      speedSpan.innerHTML = Math.trunc(location.speed as number * 3.6)  + ' km/h'; // m/s in km/h
          this.travelTimeSerie.push({speed: location.speed, date: new Date(), co2: 0});
          this.geolocationService.saveLocation({
            'category': 'travel',
            'data': JSON.stringify(this.travelTimeSerie)
          }).subscribe({
            next: () => {
              console.log('data saved');
            },
            error: (error) => {
              console.log(error);
            }
          });
    }
  }

  public start() {
    this.init();
    // const _this = this;
    // setInterval(async () => {
    //   this.geoloc = await Geolocation.watchPosition(this.options, (pos: any) => {
    //     const speedSpan = document.getElementById('speed');
    //     if (pos && pos.coords && speedSpan) {
    //       const speed = Math.trunc(pos.coords.speed as number * 3.6);
    //       speedSpan.innerHTML = speed  + ' km/h';
    //       this.travelTimeSerie.push({speed: speed, date: new Date(), co2: 0});
    //       this.geolocationService.saveLocation({
    //         'category': 'travel',
    //         'data': JSON.stringify(this.travelTimeSerie)
    //       }).subscribe({
    //         next: () => {
    //           console.log('data saved');
    //         },
    //         error: (error) => {
    //           console.log(error);
    //         }
    //       });
    //     }
    //   });
    // }, 2000);
  }

  public stop() {
    Geolocation.clearWatch(this.geoloc);
  }

  // public start() {
  //   BackgroundGeolocation.addWatcher(
  //     {
  //         // If the "backgroundMessage" option is defined, the watcher will
  //         // provide location updates whether the app is in the background or the
  //         // foreground. If it is not defined, location updates are only
  //         // guaranteed in the foreground. This is true on both platforms.
  
  //         // On Android, a notification must be shown to continue receiving
  //         // location updates in the background. This option specifies the text of
  //         // that notification.
  //         backgroundMessage: "Cancel to prevent battery drain.",
  
  //         // The title of the notification mentioned above. Defaults to "Using
  //         // your location".
  //         backgroundTitle: "Tracking You.",
  
  //         // Whether permissions should be requested from the user automatically,
  //         // if they are not already granted. Defaults to "true".
  //         requestPermissions: true,
  
  //         // If "true", stale locations may be delivered while the device
  //         // obtains a GPS fix. You are responsible for checking the "time"
  //         // property. If "false", locations are guaranteed to be up to date.
  //         // Defaults to "false".
  //         stale: false,
  
  //         // The minimum number of metres between subsequent locations. Defaults
  //         // to 0.
  //         distanceFilter: 50
  //     },
  //     function callback(location, error) {
  //         if (error) {
  //             if (error.code === "NOT_AUTHORIZED") {
  //                 if (window.confirm(
  //                     "This app needs your location, " +
  //                     "but does not have permission.\n\n" +
  //                     "Open settings now?"
  //                 )) {
  //                     // It can be useful to direct the user to their device's
  //                     // settings when location permissions have been denied. The
  //                     // plugin provides the 'openSettings' method to do exactly
  //                     // this.
  //                     BackgroundGeolocation.openSettings();
  //                 }
  //             }
  //             return console.error(error);
  //         }
  
  //         return console.log(location);
  //     }
  // ).then(function after_the_watcher_has_been_added(watcher_id) {
  //     // When a watcher is no longer needed, it should be removed by calling
  //     // 'removeWatcher' with an object containing its ID.
  //     BackgroundGeolocation.removeWatcher({
  //         id: watcher_id
  //     });
  // });
  
  // // // The location object.
  // // {
  // //     // Longitude in degrees.
  // //     longitude: 131.723423719132,
  // //     // Latitude in degrees.
  // //     latitude: -22.40106297456,
  // //     // Radius of horizontal uncertainty in metres, with 68% confidence.
  // //     accuracy: 11,
  // //     // Metres above sea level (or null).
  // //     altitude: 65,
  // //     // Vertical uncertainty in metres, with 68% confidence (or null).
  // //     altitudeAccuracy: 4,
  // //     // Deviation from true north in degrees (or null).
  // //     bearing: 159.60000610351562,
  // //     // True if the location was simulated by software, rather than GPS.
  // //     simulated: false,
  // //     // Speed in metres per second (or null).
  // //     speed: 23.51068878173828,
  // //     // Time the location was produced, in milliseconds since the unix epoch.
  // //     time: 1562731602000
  // // }
  
  // // If you just want the current location, try something like this. The longer
  // // the timeout, the more accurate the guess will be. I wouldn't go below about
  // // 100ms.

  //   this.guess_location;
  // }

  // private guess_location(callback: any, timeout: number) {
  //   let last_location: any;
  //   BackgroundGeolocation.addWatcher(
  //       {
  //           requestPermissions: false,
  //           stale: true
  //       },
  //       function (location) {
  //           last_location = location || undefined;
  //           const speedSpan = document.getElementById('speed');
  //           if (speedSpan) {
  //             speedSpan.innerHTML = 'lol';
  //             if (last_location.coords.speed) {
  //               speedSpan.innerHTML = last_location.coords.speed;
  //             }
  //           }
  //       }
  //   ).then(function (id) {
  //       setTimeout(function () {
  //           callback(last_location);
  //           BackgroundGeolocation.removeWatcher({id});
  //       }, timeout);
  //   });
  // }
}
