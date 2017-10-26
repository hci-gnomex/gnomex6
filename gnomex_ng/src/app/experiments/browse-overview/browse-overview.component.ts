/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {AfterViewInit, Component, OnInit, ViewChild} from "@angular/core";
import {FormGroup,FormBuilder,Validators } from "@angular/forms"
import {ActivatedRoute} from "@angular/router";
import {URLSearchParams} from "@angular/http"
import {ExperimentsService} from "../experiments.service";
import {TabContainer} from "../../util/tabs/tab-container.component";
import {TabChangeEvent} from "../../util/tabs/tab-change-event"


@Component({
    template: `
        <div>
            I am the project overview
            <tab-container (tabChanged)="changedTab($event)"
                           [state]="state" 
                           [componentNames]="tabNames">
                
            </tab-container>
        </div>
`
})
export class BrowseOverviewComponent implements OnInit,AfterViewInit{
    project:any;
    private readonly EXPERIMENT:string = "ExperimentsBrowseTab";
    private readonly PROGRESS:string = "ProgressBrowseTab";
    private readonly VISIBILITY:string = "VisiblityBrowseTab";
    private readonly PROJECT:string = "ProjectBrowseTab";


    @ViewChild(TabContainer) tabView: TabContainer;
    state:string = TabContainer.VIEW;
    tabNames:Array<string>;
    constructor(private fb:FormBuilder,private route:ActivatedRoute,
                private experimentsService:ExperimentsService){
    }

    ngOnInit(){

        console.log("ngOnInit has been called");

        this.route.data.forEach((data) => {
            this.project = data['project']; // this data is carried on route look at browse-experiments.component.ts
            if(!this.tabView.isInitalize()){
                if(this.project){
                    this.tabNames = [this.EXPERIMENT,this.PROGRESS,this.VISIBILITY,this.PROJECT];
                }
                else{
                    this.tabNames = [this.EXPERIMENT,this.PROGRESS,this.VISIBILITY];
                }
            }
            else{
                if (this.project) { // no projectTab, add it
                    let index = this.tabView.containsTab(this.PROJECT);
                    if (index === -1) {
                        this.tabView.addTab(this.PROJECT);
                        this.tabNames.push(this.PROJECT);
                    }
                }
                else {
                    let index = this.tabView.containsTab(this.PROJECT);
                    if (index !== -1) {
                        this.tabView.removeTab(index);
                        this.tabNames.pop();// will Project will always be the last tab
                    }
                }
                this.refresh();
            }

        });

    }
    ngAfterViewInit(){

    }


    refreshExperiment():void{

        console.log("refreshing Experiment")
    }
    refreshProgress():void{
        let params:URLSearchParams = this.experimentsService.browsePanelParams;
        if(params){
            let idProject = this.route.snapshot.paramMap.get('idProject');
            params.set('idProject',idProject);
            this.experimentsService.getRequestProgressList_FromBackend(params);
            this.experimentsService.getRequestProgressDNASeqList_FromBackend(params);
            this.experimentsService.getRequestProgressSolexaList_FromBackend(params);


        }
        else{
            console.log("check browseFilter.search() to make sure browsePanelParams were set");
        }
        //this.experimentsService.browsePanelParams.Object


    }
    refresh():void{
            if(this.tabNames[this.tabView.activeId] === this.EXPERIMENT ){
                this.refreshExperiment();
            }
            else if(this.tabNames[this.tabView.activeId] === this.PROGRESS){
                this.refreshProgress();
                console.log("refresh Progress");
            }
            else if(this.tabNames[this.tabView.activeId] === this.VISIBILITY){
                //this.refreshVisibility();
                console.log("refresh Visibility")
            }
            else{ // Project this  is optional

                //this.refreshProject();
            }
    }


    changedTab(event:TabChangeEvent){
        console.log("I am changing tabs");
        if(this.tabNames[event.nextId] === this.EXPERIMENT ){
            this.refreshExperiment();
        }
        else if(this.tabNames[event.nextId] === this.PROGRESS){
            this.refreshProgress();
            console.log("refresh Progress");
        }
        else if(this.tabNames[event.nextId] === this.VISIBILITY){
            //this.refreshVisibility();
            console.log("refresh Visibility")
        }
        else{ // Project this  is optional

            //this.refreshProject();
        }
    }
}
