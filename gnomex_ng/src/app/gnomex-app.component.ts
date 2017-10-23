/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, ViewChild, OnInit} from "@angular/core";
import {Http, Response} from "@angular/http";
import {AuthenticationService, TimeoutNotificationComponent} from "@hci/authentication";
import {HeaderComponent} from "./header/header.component";
import {AppHeaderComponent} from "@hci/app-header";
import {NavigationAction, NavigationItem, PrimaryNavigationItem, PrimaryNavigationItemGroup} from "@hci/navigation";
import {Observable} from "rxjs/Observable";
import 'rxjs/operator/finally';
import 'rxjs/add/operator/catch'
import {CreateSecurityAdvisorService} from "./services/create-security-advisor.service";
import {ProgressService} from "./home/progress.service";
import {DictionaryService} from "./services/dictionary.service";

/**
 * The gnomex application component.
 *
 * @author jason.holmberg <jason.holmberg@hci.utah.edu>
 */
@Component({
    selector: "gnomex-app",
    providers: [],
    templateUrl: './gnomex-app.component.html'
})

export class GnomexAppComponent implements OnInit {
    public isCollapsed: boolean = true;
    public status: {isopen: boolean} = {isopen: false};
    objLoaderStatus: boolean;
    private appNameTitle: string = "Gnomex";

  @ViewChild(HeaderComponent)
  private _appHdrCmpt: AppHeaderComponent;

    private _primaryNavEnabled: Observable<boolean>;

    constructor(private authenticationService: AuthenticationService,
                private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private dictionaryService: DictionaryService,
                private http: Http,
                private progressService: ProgressService) {
    }


    ngOnInit() {
        let isDone: boolean = false;
        console.log("GnomexAppComponent ngOnInit");

        this.authenticationService.isAuthenticated().subscribe( response => {
            if (response) {
                this.createSecurityAdvisorService.createSecurityAdvisor().subscribe(response => {
                    console.log("subscribe createSecurityAdvisor");
                    isDone = true;
                    console.log(response);
                    this.dictionaryService.reload();
                    this.progressService.displayLoader(80);
                });
            }
        });

        this.authenticationService.isAuthenticated().subscribe((authenticated: boolean) => {
            if (authenticated) {
                this.createSecurityAdvisorService.createSecurityAdvisor().subscribe(response => {
                    console.log("subscribe createSecurityAdvisor");
                    isDone = true;
                    this.progressService.displayLoader(80);
                    console.log(response);
                });
            }
        });
    }


    searchFn(): (keywords: string) => void {
        return (keywords) => {
            window.location.href = "http://localhost/gnomex/experiments/"+keywords;
        };
    }
}
