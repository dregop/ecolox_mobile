import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";

// access to its functions
// declare const BackgroundGeolocation: BackgroundGeolocationPlugin;

@Injectable({
  providedIn: 'root'
})
export class BackgroundGeolocationService {

  // private config: ConfigureOptions = {
  //   // shared config
  //   maxLocations: 100,
  //   distanceFilter: 50,
  //   stationaryRadius: 100,
  //   desiredAccuracy: BackgroundGeolocation.LOW_ACCURACY,
  //   locationProvider: BackgroundGeolocation.RAW_PROVIDER,
  
  //   // android specific config
  //   interval: 1000,
  //   startForeground: true,
  //   notificationsEnabled: true,
  //   notificationTitle: "Tracking",
  //   notificationText: "Your location is being tracked!",
  //   notificationIconColor: "#424242",
  //   notificationIconSmall: "ic_location",
  
  //   // ios specific config
  //   saveBatteryOnBackground: true,
  //   pauseLocationUpdates: false,
  // };

    // an observable that will be used later in this ariticle
  // public position$ = new BehaviorSubject<L.LatLng>(undefined as any);

  constructor() { }

  // // call this function whenever you are ready to track!
  // async init() {
  //   // insert config
  //   await BackgroundGeolocation.configure(this.config);
  //   // create a listener for location updates
  //   BackgroundGeolocation.on("location")
  //     .subscribe((location) => this.updateLocation(location));
  //   // this will trigger the permission request if not yet granted
  //   await BackgroundGeolocation.start();
  // }

  // private updateLocation(location: Location) {
  //   if (location == undefined) return;
  //   console.log("Location update:", location);
    
  //   // update the observable for the use of the map component later
  //   const latLng = L.latLng([location.latitude, location.longitude]);
  //   this.position$.next(latLng);
    
  //   // do it yourself below, what have you in mind?
  // }
}
