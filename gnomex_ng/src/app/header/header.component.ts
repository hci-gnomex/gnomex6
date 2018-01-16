/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, ElementRef, OnInit, ViewChild, ViewEncapsulation} from "@angular/core";
import { ExperimentsService } from '../experiments/experiments.service';
import {ProgressService} from "../home/progress.service";
import {AuthenticationService, TimeoutNotificationComponent} from "@hci/authentication";
import {Observable} from "rxjs/Observable";
import {LocalStorageService} from "angular-2-local-storage";
import {FormBuilder, FormGroup} from "@angular/forms";
import {WindowService} from "../window-service";

import {MatDialogRef, MatDialog} from "@angular/material";

import {NewBillingAccountComponent} from "../billing/new_billing_account/new-billing-account.component"

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
        
        .no-padding-dialog .mat-dialog-container {
            padding: 0;
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

    `],
    encapsulation: ViewEncapsulation.None
})

export class HeaderComponent implements OnInit{

    isLoggedIn: Observable<boolean>;
    options: FormGroup;

    constructor(private authenticationService: AuthenticationService,
								private dialog: MatDialog,
                private progressService: ProgressService,
                private localStorageService: LocalStorageService,
                private formBuilder: FormBuilder,
                private windowService: WindowService) {
        this.options = this.formBuilder.group({
            hideRequired: false,
            floatPlaceholder: 'auto',
        });

    }

    public objNumber: string;
    public searchText: string;
    private experimentService: ExperimentsService;
    ngOnInit() {
        this.authenticationService.isAuthenticated().subscribe( response => {
            this.isLoggedIn = response && this.progressService.hideLoader.asObservable();
        });
    }
    public myErrorStateMatcher(): boolean {
        return true;
    }
    public searchNumber() {
        console.log(this.objNumber);
    }
    public searchByText() {
        console.log(this.searchText);
    }
    public browseExp() {
    }

    public openNewBillingAccountsPopup(): void {

			let dialogRef = this.dialog.open(NewBillingAccountComponent, { width: '60em', panelClass: 'no-padding-dialog' });

			dialogRef.afterClosed().subscribe((result) => {
				console.log('Test dialog closed!');
			});


			// this.windowService.openNewBillingAccountWindow();
    }

    onLogout() {
        this.authenticationService.logout();
    }

}
