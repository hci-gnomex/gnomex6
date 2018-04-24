/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, OnDestroy, OnInit} from "@angular/core";
import {AnalysisService} from "../../services/analysis.service"



@Component({
    selector: 'analysis-panel',
    template: `        
        <div style="height: 100%">
            <router-outlet name="analysisPanel"></router-outlet>
        </div>
`
})
export class AnalysisPanelComponent implements OnInit, OnDestroy{

    constructor(private analysisService:AnalysisService){
    }

    ngOnInit(){

    }
    ngOnDestroy(){
        this.analysisService.analysisPanelParams = null;
        this.analysisService.resetAnalysisOverviewListSubject();
    }
    save(){

    }
}
