import { Component, OnInit } from '@angular/core';
// import * as L from "leaflet";
import { filter, map, tap } from "rxjs/operators";
import { BackgroundGeolocationService } from 'src/app/services/background-geolocation.service';

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
  constructor(private geolocation: BackgroundGeolocationService) {}
  
  ngOnInit(): void {

    const x = document.getElementById("demo");

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
    };

      if (x) {
        if (navigator.geolocation) {
          navigator.geolocation.watchPosition(firstGeolocationSuccess, error, options);
        } else {
          x.innerHTML = "Geolocation is not supported by this browser.";
        }
      }

      function error(e: any) {
        console.log(e);
      }

    function showPosition(position: any) {
      if (x) {
        x.innerHTML = "Latitude: " + position.coords.latitude +
        "<br>Longitude: " + position.coords.longitude;
      } else {
        console.log('error');
      }
    }
    
    function calculateSpeed(t1: any, lat1: any, lng1: any, t2: any, lat2: any, lng2: any) {
      // From Caspar Kleijne's answer starts
      /** Converts numeric degrees to radians */
      const toRad = function(numb: number) {
        return numb * Math.PI / 180;
      }
      // From Caspar Kleijne's answer ends
      // From cletus' answer starts
      var R = 6371; // km
      var dLat = toRad(lat2-lat1);
      var dLon = toRad(lng2-lng1);
      lat1 = toRad(lat1);
      lat2 = toRad(lat2);
    
      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) *    Math.cos(lat2); 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var distance = R * c;
      // From cletus' answer ends
    
      if (x) {
        x.innerHTML = "speed: " + (distance / (t2 - t1));
      } else {
        console.log('error');
      }
    }
    
    function firstGeolocationSuccess(position1: any) {
      var t1 = Date.now();
      navigator.geolocation.getCurrentPosition(
        function (position2) {
          var speed = calculateSpeed(t1 / 1000, position1.coords.latitude, position1.coords.longitude, Date.now() / 1000, position2.coords.latitude, position2.coords.longitude);
        });
    }
  }

  // updateMarker(latLng: L.LatLng) {
  //   if (this.marker == undefined) this.createMarker(latLng);
  //   this.marker.setLatLng(latLng);
  // }
  
  // createMarker(latLng: L.LatLng) {
  //   this.marker = L.marker(latLng);
  // }

}
