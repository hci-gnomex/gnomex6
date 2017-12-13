/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, ViewChild, OnInit} from "@angular/core";
import {Http, Response} from "@angular/http";
import {AuthenticationService, TimeoutNotificationComponent} from "@hci/authentication";
import {HeaderComponent} from "./header/header.component";

import {NavigationAction, NavigationItem, PrimaryNavigationItem, PrimaryNavigationItemGroup} from "@hci/navigation";
import {Observable} from "rxjs/Observable";
import 'rxjs/operator/finally';
import 'rxjs/add/operator/catch'
import {CreateSecurityAdvisorService} from "./services/create-security-advisor.service";
import {ProgressService} from "./home/progress.service";
import {DictionaryService} from "./services/dictionary.service";

import {NewBillingAccountComponent} from "./billing/new_billing_account/new-billing-account.component";

import {WindowService} from "./window-service";

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
	@ViewChild('newBillingAccountWindow') newBillingAccountWindow: NewBillingAccountComponent;

    public isCollapsed: boolean = true;
    public status: {isopen: boolean} = {isopen: false};
    objLoaderStatus: boolean;
    private appNameTitle: string = "Gnomex";

  @ViewChild(HeaderComponent)

    private _primaryNavEnabled: Observable<boolean>;

    constructor(private authenticationService: AuthenticationService,
                private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private dictionaryService: DictionaryService,
                private http: Http,
                private progressService: ProgressService,
                private windowService: WindowService) {
    }


    ngOnInit() {
        let isDone: boolean = false;
        console.log("GnomexAppComponent ngOnInit");

        this.authenticationService.isAuthenticated().subscribe((authenticated: boolean) => {
            if (authenticated) {
                this.createSecurityAdvisorService.createSecurityAdvisor().subscribe(response => {
                    console.log("subscribe createSecurityAdvisor");
                    isDone = true;
                    this.dictionaryService.reload();
                    this.progressService.displayLoader(80);
                });
            }
        });

        this.windowService.getNewBillingAccountWindowOpenObservable().subscribe(() => {
					this.newBillingAccountWindow.open();
        })
    }

    searchFn(): (keywords: string) => void {
        return (keywords) => {
            window.location.href = "http://localhost/gnomex/experiments/"+keywords;
        };
    }
}
