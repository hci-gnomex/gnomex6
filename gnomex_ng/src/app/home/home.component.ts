/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, ViewEncapsulation} from "@angular/core";

@Component({
  selector: "gnomex-home",
  template: require('./home.component.html'),
  // template: require("./home.component.html"),
    styles: [`
    .login-view{
        height: 12em;
        width: 30em;
        margin-left: 45em;
        display: block;
        background-image: url("assets/gnomex_splash_logo.png");
        background-repeat:no-repeat;
    }        
  `],
    encapsulation: ViewEncapsulation.None
})
export class HomeComponent {
  constructor() {
    // Do instance configuration here

  }
    public myInput: string;
    public searchText: string;

    public myErrorStateMatcher(): boolean {
        return true;
    }
    public searchNumber() {
        console.log(this.myInput);
    }
    public searchByText() {
        console.log(this.searchText);
    }
    public browseExp() {
        console.log('Browse Experiments selected');
    }

}
