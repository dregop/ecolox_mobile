import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UserFeatures } from 'src/app/models/userFeatures';
import { ToastService, toastType } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';
import * as d3 from 'd3';
import { GraphService } from '../internet/services/graph.service';

export interface Challenge {
  id: number,
  category: string,
  sumary: string,
  status: string
}

export  class Co2ByOriginByTime {
  co2!: number;
  date!: any;
  origin?: string;
}

@Component({
  selector: 'app-global',
  templateUrl: './global.component.html',
  styleUrls: ['./global.component.scss'],
})
export class GlobalComponent  implements OnInit, AfterViewChecked {

  @ViewChild('bar_chart') chartElement!: ElementRef;
  
  public time_to_lvl_up = 600;//seconds : 10min
  public level = 1;
  public pourcent_lvl = 0;
  public acheived_challenges: Challenge[] = [];
  public pourcent_health = 101; // %
  public last_watering!: Date;
  public IsChallengesStarted = false;
  public features!: UserFeatures;
  public loading = true;
  public chartProps!: any;
  public dataGlobalMean: Co2ByOriginByTime[] = [
    {co2: 4, date: Date.now(), origin: 'internet'},
    {co2: 30, date: Date.now() + 10, origin: 'maison'},
    {co2: 30, date: Date.now() + 20, origin: 'deplacement'},
    {co2: 36, date: Date.now() + 30, origin: 'achats'},
  ];
  public bars!: any;

  constructor(public toastService: ToastService, public userService: UserService, private graphService: GraphService) { }

  ngOnInit() {

    // niv1 600 niv2 600*2 niv3 600*2² niv4 6002^3 time_to_lvl_up = 600*2^level; 
    // niv1: 100 - 100/6
    // health = 100 - (100/6)*level


    // const intervalLvl = setInterval(() => {
    //   const lvl_bar = document.getElementById('lvl_bar');
    //   const health_bar = document.getElementById('health_bar');
    //   if (this.pourcent_lvl > 99) {
    //     this.level++;
    //     this.time_to_lvl_up*=1.8;
    //     this.pourcent_lvl = 0;
    //     console.log(this.pourcent_lvl);
    //   }

    //   this.pourcent_lvl = this.pourcent_lvl + (100 / this.time_to_lvl_up);
    //   console.log(this.pourcent_lvl);
    //   if (lvl_bar) {
    //     if(this.pourcent_lvl < 6) { 
    //       lvl_bar.style.width = '6%'; // let some space for writing
    //     } else {
    //       lvl_bar.style.width = this.pourcent_lvl + '%';
    //     }
    //   }

    //   this.pourcent_health = this.pourcent_health - (100 / this.time_to_lvl_up);
    //   if (health_bar) {
    //     health_bar.style.width = this.pourcent_health + '%';
    //     if (this.pourcent_health < 15) {
    //       health_bar.style.backgroundColor = '#dc2626';
    //     } else if (this.pourcent_health < 30) {
    //       health_bar.style.backgroundColor = '#fb923c';
    //     } else if (this.pourcent_health < 50) {
    //       health_bar.style.backgroundColor = '#fde047';
    //     } else {
    //       health_bar.style.backgroundColor = '#65a30d';
    //     }
    //   }
    //   if (this.pourcent_health < 1) {
    //     clearInterval(intervalLvl);
    //     this.IsChallengesStarted = false;
    //     this.toastService.handleToast(toastType.Error, 'Ta plante est décédée');
    //   }
    // }, 1000);

    // get lvl, pourcent_lvl et pourcent_health et last_watering
    this.userService.getFeatures().subscribe({
      next: (features: UserFeatures) => {
        this.loading = false;
        this.features = features;
        if (features.level) {
          this.IsChallengesStarted = true;
          this.level = features.level;
          this.pourcent_lvl = features.pourcent_lvl;
          this.pourcent_health = features.pourcent_health;
          this.last_watering = features.last_watering;

          if (features.start_challenges) {
            const timeDelta = new Date().getTime() - new Date(features.start_challenges).getTime();
            this.time_to_lvl_up = timeDelta / 1000; // in sec to match time_to_lvl_up
            console.log(this.time_to_lvl_up);
            this.level = Math.trunc(Math.abs(Math.log2(this.time_to_lvl_up/600)));
            if (this.level === 0) {
              this.level = 1;
            } 
            this.pourcent_lvl = Math.abs(Math.log2(this.time_to_lvl_up/600)) % this.level * 100;
            console.log(this.pourcent_lvl);
            this.pourcent_health = 100 - (100/6)*this.level;
          }
        }
      },
      error: (err) => console.log(err.message)
    });
  }

  ngAfterViewChecked(): void {
    this.build();
  }

  private build() {
    this.chartProps = {};

    // Set the dimensions of the graph
    const margin = { top: 30, right: 20, bottom: 40, left: 50 };
    let width = 1244  - margin.left - margin.right;
    let height = 651  - margin.top - margin.bottom;

    const widthDivChart = document.getElementById('bar_chart')?.clientWidth;
    const heightDivChart = document.getElementById('bar_chart')?.clientHeight;
    if (widthDivChart && heightDivChart) {
      width = widthDivChart - margin.left - margin.right;
      height = heightDivChart - margin.top - margin.bottom;
    }
    
    const svg = d3.select(this.chartElement.nativeElement)
      .append('svg')
      // .attr('width', width + margin.left + margin.right)
      // .attr('height', height + margin.top + margin.bottom)
      .attr('viewBox', '0 0 ' + ( width + margin.left + margin.right)  + ' ' + (height + margin.top + margin.bottom));
      const svgBox = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Set the ranges and domains
    this.chartProps.x = d3.scaleBand()
    .domain(this.dataGlobalMean.map((d) => d.date))
    .range([0, width])
    .padding(0.1);

    this.chartProps.y = d3.scaleLinear()
    .domain([0, d3.max(this.dataGlobalMean, (d) => d.co2 as any + d.co2/15)]) // as any -> otherwise error
    .range([height, 0]);

    // Define the axes
    const xAxis = (g: any, x: any) => g
    .call(d3.axisBottom(x).ticks(5).tickFormat(this.graphService.multiFormat).tickPadding(width / 80));
    var yAxis = (g: any, y: any) => g
    .call(d3.axisLeft(y).tickPadding(height / 80).tickSize(-15000));
  
    // Add a rect for each bar.
    this.bars = svg.append("g")
      .attr("fill", "orange")
      .attr("class", "bars")
      .selectAll()
      .data(this.dataGlobalMean)
      .join("rect")
        .attr("x", (d) => this.chartProps.x(d.date) + margin.left)
        .attr("y", (d) => this.chartProps.y(d.co2) + margin.top - 1)
        .attr("height", (d) => this.chartProps.y(0) - this.chartProps.y(d.co2))
        .attr("width", this.chartProps.x.bandwidth());

    // Add the X Axis
    const gx = svgBox.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis, this.chartProps.x);

    this.chartProps.height = height;
    this.chartProps.width = width;

      svgBox.append('image')
      .attr("class", "arrow")
      .attr('xlink:href', "assets/arrow.png")
      .attr('width', 14)
      .attr('height', 14)
      .attr('x', this.chartProps.width - 5)
      .attr('opacity', '1')
      .attr('y', this.chartProps.height - 7);

    // Add the Y Axis
    const gy = svgBox.append('g')
      .attr('class', 'y axis')
      .call(yAxis, this.chartProps.y);

    gy.selectAll(".tick line").style("stroke-dasharray", "5 5").style("opacity", "0.3");
    // gx.select('path').style("opacity", "0");
    gy.select('path').style("opacity", "0");

    // Setting the required objects in chartProps so they could be used to update the chart
    this.chartProps.svg = svg;
    this.chartProps.svgBox = svgBox;
    this.chartProps.xAxis = xAxis;
    this.chartProps.yAxis = yAxis;
    this.chartProps.margin = margin;

    // // // Add treashold internet line
    // this.dataGlobalMean.forEach((data) =>  {
    //   this.dataThreshold.push({co2: this.thresholdCo2, date: data.date});
    // })

    // add the threshold TODO: name it to update it
    // svg.append("g")
    // .attr("fill", "red")
    // .attr("class", "threshold")
    // .selectAll()
    // .data(this.dataThreshold)
    // .join("rect")
    //   .attr("x", (d) => this.chartProps.x(d.date) + margin.left)
    //   .attr("y", (d) => this.chartProps.y(d.co2) + margin.top - 1)
    //   .attr("height", (d) => this.chartProps.y(d.co2 - 4) - this.chartProps.y(d.co2))
    //   .attr("width", this.chartProps.x.bandwidth());

    // this.chartProps.svgBox.append("text")
    // .attr("class", 'threshold_label')
    // .attr("x", width - 40)
    // .attr("y", height + margin.top + margin.bottom - this.thresholdCo2 - 15)
    // .style("font-size", "12px")
    // .attr("dy", ".75em")
    // .text('Seuil');

    // Label for Y axis
    svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("x", 100)
    .attr("y", this.chartProps.height / 2)
    .style("font-size", "12px")
    .attr("dy", ".75em")
    .text("Co2(grammes)");

    d3.select('.threshold').style("opacity", 0);
    d3.select('.threshold_label').style("opacity", 0);
  }

  public trunc(numb:number): number {
    return Math.trunc(numb);
  }

  public displayChallenges() {
    const overlay_message = document.getElementById('overlay_message');
    if (overlay_message) {
      overlay_message.style.display = 'block';
    }
  }

  public water() {
    const new_watering = new Date();
    if (this.last_watering && new_watering.getTime() - new Date(this.last_watering).getTime() < 1000) { //10s
      this.pourcent_health-= 20 / this.level;
      this.last_watering = new_watering;
      return;
    }
    this.pourcent_health+= 60;
    console.log(this.pourcent_health);
    if (this.pourcent_health > 100) {
      this.pourcent_health = 100;
      // const diff = this.health - 100;
      // console.log(this.health);
      // this.health -= diff * 1.2;
      // console.log(this.health);
    }
    this.last_watering = new_watering;
  }

  public resetChallenges() {
    this.time_to_lvl_up = 600;
    this.level = 1;
    this.pourcent_lvl = 0;
    this.pourcent_health = 101;
    this.IsChallengesStarted = false;
    // this.userService.updateFeatures({level: this.level, this.tim})
  }

  public startChallenges() {
    this.IsChallengesStarted = true;
    this.last_watering = new Date();

    if (!this.features) {
      this.userService.saveFeatures({start_challenges: new Date(),level: this.level,pourcent_lvl: this.pourcent_lvl, pourcent_health: this.pourcent_health, last_watering: new Date()}).subscribe({
        next: () => {
          console.log('features saved to db');
        },
        error: (err) => console.log(err.message)
      });
    }

  }
}
