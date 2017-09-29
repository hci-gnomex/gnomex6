/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, OnInit, ViewChild} from "@angular/core";
import {FormGroup,FormBuilder,Validators } from "@angular/forms"
import {ActivatedRoute} from "@angular/router";
import {URLSearchParams} from "@angular/http"
import {ExperimentsService} from "../experiments.service";
import {TabContainer} from "../../util/tabs/tab-container.component";


@Component({
    template: `
        <div>
            I am the project overview
            <tab-container (tabChanged)="changedTab()"
                           [state]="state" 
                           [componentNames]="tabNames">
                
            </tab-container>
        </div>
`
})
export class BrowseOverviewComponent implements OnInit{
    project:any;
    @ViewChild(TabContainer) tabView: TabContainer;
    state:string = TabContainer.VIEW;
    tabNames:Array<string>;
    constructor(private fb:FormBuilder,private route:ActivatedRoute,
                private experimentsService:ExperimentsService){
    }

    ngOnInit(){

        console.log("ngOnInit has been called")

        this.route.data.forEach((data) => {
            this.project = data['project']; // this data is carried on route look at browse-experiments.component.ts
            if(!this.tabView.isInitalize()){
                if(this.project){
                    this.tabNames = ["ExperimentsBrowseTab","DownloadsBrowseTab",
                        "ProgressBrowseTab","VisiblityBrowseTab","ProjectBrowseTab"];
                }
                else{
                    this.tabNames = ["ExperimentsBrowseTab","DownloadsBrowseTab",
                        "ProgressBrowseTab","VisiblityBrowseTab"];
                }
            }
            else{
                if (this.project) { // no projectTab, add it
                    let index = this.tabView.containsTab("ProjectBrowseTab");
                    if (index === -1) {
                        this.tabView.addTab("ProjectBrowseTab");

                    }
                }
                else {
                    let index = this.tabView.containsTab("ProjectBrowseTab");
                    if (index !== -1) {
                        this.tabView.removeTab(index);
                    }
                }

            }
        });

    }
    changedTab(){

    }
}
