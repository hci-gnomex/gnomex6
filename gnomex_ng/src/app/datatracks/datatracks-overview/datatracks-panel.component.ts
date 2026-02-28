/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, OnDestroy, OnInit} from "@angular/core";
import {DataTrackService} from "../../services/data-track.service";
import {Router} from "@angular/router";
import {DatatracksOrganismComponent} from "./datatracks-organism.component";
import {GenomeBuildResolverService} from "../../services/resolvers/genome-build-resolver.service";



@Component({
    selector: 'datatracks-panel',
    template: `        
        <div style="height:100%;">
            <router-outlet></router-outlet>
        </div>
`
})
export class DatatracksPanelComponent implements OnInit, OnDestroy{

    constructor(private dataTrackService:DataTrackService,private router:Router){
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
