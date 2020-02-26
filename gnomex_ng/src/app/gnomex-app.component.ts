/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, ViewChild, OnInit} from "@angular/core";
import {Http, Response} from "@angular/http";
import {HeaderComponent} from "./header/header.component";

import {Observable} from "rxjs";
import {CreateSecurityAdvisorService} from "./services/create-security-advisor.service";
import {ProgressService} from "./home/progress.service";
import {DictionaryService} from "./services/dictionary.service";
import {AuthenticationService} from "./auth/authentication.service";

/**
 * The gnomex application component.
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
        this.authenticationService.isAuthenticated().subscribe((authenticated: boolean) => {
            console.log("GNOMEX App user is authed ")
        });

    }

    searchFn(): (keywords: string) => void {
        return (keywords) => {
            window.location.href = "http://localhost/gnomex/experiments/"+keywords;
        };
    }
}
