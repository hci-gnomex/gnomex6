/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, OnDestroy, OnInit} from "@angular/core";


@Component({
    selector: 'configuration-browse-panel',
    template: `        
        <div class="full-height">
            <router-outlet name="browsePanel"></router-outlet>
        </div>
`
})
export class ConfigurationBrowsePanelComponent implements OnInit, OnDestroy{

    constructor(){
    }

    ngOnInit(){

    }
    ngOnDestroy(){
    }
    save(){

    }
}
