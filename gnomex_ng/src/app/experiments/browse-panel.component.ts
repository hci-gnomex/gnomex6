import {Component, OnDestroy, OnInit} from "@angular/core";
import {ExperimentsService} from "./experiments.service";



@Component({
    selector: 'browse-panel',
    template: `
        <div class="full-height full-width">
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
