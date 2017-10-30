/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, OnInit, ViewEncapsulation} from "@angular/core";
import { ExperimentsService } from '../experiments/experiments.service';
import {AuthenticationService, TimeoutNotificationComponent} from "@hci/authentication";
import {Observable} from "rxjs/Observable";

@Component({
  selector: "gnomex-header",
  templateUrl: "./header.component.html",
  // template: require("./header.component.html"),
    styles: [`
        .example-fill-remaining-space {
        // This fills the remaining space, by using flexbox.
        // Every toolbar row uses a flexbox row layout.
        flex: 1 1 auto;
        }

        .lookup {
            font-size: small;
            text-decoration: none;
        }
        .header-one {
            color: black;
            background-color: white;
            position: fixed;
            z-index: 1;
        }
        .header-two {
            background-color: #f5fffa;
            color: black;
        }
        .experiment-menu {
            flex: 1;
        }
        .links-menu {
            flex: 1;
            text-align: right;
        }
        .right-arrow {
            flex:.1;
        }
        .links {
            flex: .25;
            text-decoration: none;
        }
        .link {
            font-size: small;
            color: inherit;
            text-decoration: none;
            text-align: center;
        }
        .problem {
            color: red;
            text-decoration: underline;
        }
        .mat-menu-item.menu {
            font-size: small;
            color: black;
            background-color: white;
            border-top-color: white;
            border-bottom-color: white;
        }
        .mat-menu-panel.myPanel {
            max-width: 30em;
            color: black !important;
            background-color: white !important;
            border-top-color: white;
            border-bottom-color: white;
        }

    `],
        encapsulation: ViewEncapsulation.None
})
  export class HeaderComponent implements OnInit{
  isLoggedIn$: Observable<boolean>;

  constructor(private authService: AuthenticationService) {
    // Do instance configuration here

  }
    public myInput: string;
    public searchText: string;
    private experimentService: ExperimentsService;
    ngOnInit() {
      this.isLoggedIn$ = this.authService.isAuthenticated();
    }
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

    onLogout() {
        this.authService.logout();
    }

}
