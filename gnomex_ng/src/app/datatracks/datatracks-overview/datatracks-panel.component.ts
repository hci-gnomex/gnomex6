/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, OnDestroy, OnInit} from "@angular/core";
import {DataTrackService} from "../../services/data-track.service";



@Component({
    selector: 'datatracks-panel',
    template: `        
        <div style="height:100%;">
            <router-outlet name="datatracksPanel"></router-outlet>
        </div>
`
})
export class DatatracksPanelComponent implements OnInit, OnDestroy{

    constructor(private dataTrackService:DataTrackService){
    }

    ngOnInit(){

    }
    ngOnDestroy(){
        this.dataTrackService.previousURLParams = null;
        this.dataTrackService.datatrackListTreeNode = null;
    }
    save(){

    }
}
