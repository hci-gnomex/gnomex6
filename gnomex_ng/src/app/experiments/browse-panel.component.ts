/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, OnDestroy, OnInit} from "@angular/core";
import {ExperimentsService} from "./experiments.service";



@Component({
    selector: 'browse-panel',
    template: `        
        <div class="full-height full-width">
            <!-- todo possibly take away named outlet.... this is preference because url seem more simple and clear -->
            <!-- todo name of outlet is abstracted away and () aren't shown -->
            <router-outlet></router-outlet>
        </div>
`
})
export class BrowsePanelComponent implements OnInit, OnDestroy{

    constructor(private experimentsService:ExperimentsService){
    }

    ngOnInit(){

    }
    ngOnDestroy(){
        this.experimentsService.browsePanelParams = null;
        this.experimentsService.resetExperimentOverviewListSubject();
    }
    save(){

    }
}
