/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {FormGroup,FormBuilder,Validators } from "@angular/forms"
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {URLSearchParams} from "@angular/http"
import {ExperimentsService} from "../experiments.service";
import {TabContainer} from "../../util/tabs/tab-container.component";
import {TabChangeEvent} from "../../util/tabs/tab-change-event"
import {ConstantsService} from "../../services/constants.service";
import {DictionaryService} from "../../services/dictionary.service";
import {Subscription} from "rxjs/Subscription";
import {MatTabChangeEvent, MatTabGroup} from "@angular/material";


@Component({
    template: `
            <div class="flexbox-column">
                <div class="flex-container">
                    <div >
                        {{ this.experimentsService.experimentList.length + " Experiments"}}
                    </div>
                    <div >
                        <label>Experiment #</label>
                        <jqxComboBox  class="inlineComboBox"
                                      [width]="170"
                                      [height]="20"
                                      [source]="orderedExperimentIds"
                                      (onSelect)="onIDSelect($event)" (onUnselect)="onUnselectID($event)">
                        </jqxComboBox>
                    </div>
                </div>
                <div style="flex:10; width:100%">
                    <mat-tab-group style="height:100%; width:100%;" class="mat-tab-group-border" (selectedTabChange)="tabChanged($event)">
                        <mat-tab style="height:100%" label="Experiment">
                            <experiment-browse-tab> </experiment-browse-tab>
                        </mat-tab>
                        <mat-tab style="height:100%" label="Progress">
                            <progress-tab> </progress-tab>
                        </mat-tab>
                        <mat-tab style="height:100%" label="Visibility">
                            <visibility-tab (saveSuccess)="saveVis()"> </visibility-tab>
                        </mat-tab>
                        <mat-tab *ngIf="this.project" style="height:100%;" label="Project">
                            <project-tab (saveSuccess)="saveProject()"> </project-tab>
                        </mat-tab>
                    </mat-tab-group>
                    
                </div>
                <save-footer (saveClicked)="saveManager()"
                             [dirty]="this.experimentsService.dirty"
                             [showSpinner]="this.showSpinner"
                             [disableSave]="this.experimentsService.invalid || this.noSave">
                </save-footer>

               

                
            </div>
`,
    styles: [`
       
        
        
        .flex-container{
            display: flex;
            justify-content: space-between;
            flex:1;
        }
        .flexbox-column{
            display:flex;
            flex-direction:column;
            height:100%;
            width:100%;
        }
        /deep/ .mat-tab-body-wrapper {
            flex-grow: 1 !important;
        }
        .mat-tab-group-border{
            border: 1px solid #e8e8e8;
        }
        
    `]
})
export class BrowseOverviewComponent implements OnInit,OnDestroy{
    project:any;
    private experimentIdSet: Set<string> = new Set();
    public orderedExperimentIds: Array<string> = [];
    private overviewListSuscript: Subscription;
    private intialized:boolean = false;
    private readonly PROJECT_INDEX:number = 1;
    public showSpinner:boolean = false;
    public noSave:boolean = true;

    @ViewChild(MatTabGroup) tabs: MatTabGroup;



    @ViewChild(TabContainer) tabView: TabContainer;
    state:string = TabContainer.VIEW;
    tabNames:Array<string>;
    constructor(private appConstants:ConstantsService,private route:ActivatedRoute,
                public experimentsService:ExperimentsService, private router:Router,
                public dictionary:DictionaryService){
    }

    ngOnInit(){

        // This 'data' observable fires when tree node changes because url will change.
        this.route.data.forEach((data) => {
            this.project = data['project']; // this data is carried on route look at browse-experiments.component.ts
        });


        this.refreshOverviewData();

    }

    /* The subscribe is fire in the event a tree node of lab or project is select or search button in browse filter is
        selected. This is the first subscriber called and saves experimentList in the service so subsequent subscribers
        can use it.
     */
    refreshOverviewData():void{
        this.overviewListSuscript = this.experimentsService.getExperimentOverviewListSubject()
            .subscribe(data =>{
                this.intialized =false;
                this.experimentsService.invalid = false;
                this.experimentsService.dirty = false;
                this.experimentIdSet.clear();
                this.experimentsService.experimentList = this.getExperiments(data);
                let sortIdFn = (obj1:string , obj2:string) => {
                    if(obj2 < obj1){
                        return 1;
                    }
                    if(obj2 > obj1){
                        return -1;
                    }
                    return 0;
                };
                this.orderedExperimentIds = Array.from(this.experimentIdSet).sort(sortIdFn);
                this.refreshOnSearch(data)
            });
    }



    refreshOnSearch(data?:any):void{
        if( this.tabs.selectedIndex === this.PROJECT_INDEX){
            this.refreshProgress(data);
        }

    }

    refreshProgress(data?:any):void{
        let params:URLSearchParams = this.experimentsService.browsePanelParams;
        if(params){

            if(data){//when user selects from the tree
                let idProject = data['idProject'];
                params.set('idProject',idProject);
            }else{// Use when user changes to tab to progress
                let idProject = this.route.snapshot.paramMap.get('idProject');
                params.set('idProject',idProject);
            }

            if(!this.intialized){
                this.experimentsService.getRequestProgressList_FromBackend(params);
                this.experimentsService.getRequestProgressDNASeqList_FromBackend(params);
                this.experimentsService.getRequestProgressSolexaList_FromBackend(params);
                this.intialized = true;
            }

        }
        else{
            console.log("check browseFilter.search() to make sure browsePanelParams were set");
        }
    }

    getExperiments(data:any):Array<any>{
        let flatRequestList:Array<any> = [];
        if(!data){
            return flatRequestList;
        }

        if(Array.isArray(data) ){
            if(data.length > 0 && !data[0].Project){
                (<Array<any>> data).forEach(rObj =>{
                    this.experimentIdSet.add(rObj.requestNumber)
                });
                flatRequestList = data;
            }
            else{
                return this.initAllLabs(data,flatRequestList);
            }
        }


        if (data.Project) { // for Lab level
            let projectList: Array<any> = Array.isArray(data.Project) ? data.Project : [data.Project];
            projectList.forEach(subData => {
                let requestList: Array<any> = Array.isArray(subData.Request) ? subData.Request :  subData.Request ? [subData.Request] : subData.Request;
                if(requestList){
                    requestList.forEach(rObject => {
                        this.getExperimentKind(rObject);
                        rObject["ownerFullName"] = rObject.ownerLastName + ', ' + rObject.ownerFirstName;
                        rObject["analysisChecked"] = rObject.analysisNames !== '' ? this.appConstants.ICON_CHECKED : '';

                        flatRequestList.push(rObject);
                        this.experimentIdSet.add(rObject.requestNumber);
                    });
                }
            });
        }
        else if(data.Request){
            flatRequestList = Array.isArray(data.Request) ? data.Request : [data.Request];
            flatRequestList.forEach(rObj =>{
                this.experimentIdSet.add(rObj.requestNumber);
            });
        }

        return flatRequestList;
    }


    initAllLabs(data:any ,flatRList:Array<any>):Array<any>{

        if(data.length > 0 && data[0].Project){ // array of labs(more complex parsing)
            for(let i = 0; i < data.length; i++){
                if(data[i].Project){
                    let projectList = Array.isArray(data[i].Project) ? data[i].Project : [data[i].Project] ;
                    for(let j = 0; j < projectList.length; j++){
                        if(projectList[j].Request){
                            let requestList =  Array.isArray(projectList[j].Request) ? projectList[j].Request : [projectList[j].Request];
                            for(let k = 0; k < requestList.length; k++){
                                if(i === 0 && j === 0){
                                    flatRList.push(requestList[k]);
                                    this.experimentIdSet.add(requestList[k].requestNumber);
                                }
                                this.getExperimentKind(requestList[k]);
                                requestList[k]["ownerFullName"] = requestList[k].ownerLastName + ', ' + requestList[k].ownerFirstName;
                                requestList[k]["analysisChecked"] = requestList[k].analysisNames !== '' ? this.appConstants.ICON_CHECKED : '';
                            }
                        }
                    }
                }
            }
        }
        return flatRList;

    }
    tabChanged(event:MatTabChangeEvent){
        if(event.index  <= this.PROJECT_INDEX){
            this.refreshProgress();
            this.noSave = true;
        }else{
            this.noSave = false;
        }

    }





    getRequestKind(item:any):string {
        var de:any = this.dictionary.getEntry(DictionaryService.REQUEST_CATEGORY, item.codeRequestCategory);
        if (de) {
            return de.display;
        } else {
            return "";
        }
    }
    getExperimentKind(item:any):void {
        let experimentKind:string = "";

        if (item.codeApplication == "") {
            experimentKind = this.getRequestKind(item);
        } else {
            // let de:Array<any> = this.dictionary.getEntry('hci.gnomex.model.Application', item.codeApplication);
            // if (de.length == 1) {
            let de:any = this.dictionary.getEntry(DictionaryService.APPLICATION, item.codeApplication);
            if (de) {
                experimentKind = de.display;
            } else {
                experimentKind = this.getRequestKind(item);
            }
        }
        item['experimentKind'] = experimentKind;
    }

    private onIDSelect($event:any): void{
        let filteredIdList:Array<any> = [];
        if($event.args && $event.args.item.value){
            let eList:Array<any> = this.experimentsService.experimentList;
            if(eList){
               //eList.filter(reqObject => $event.args.item.value === reqObject.requestNumber);
                eList.forEach(reqObject => {
                    if($event.args.item.value === reqObject.requestNumber){
                        filteredIdList.push(reqObject);
                    }
                });
            }
        }
        if(filteredIdList.length > 0 ){
            this.experimentsService.emitFilteredOverviewList(filteredIdList);
        }
    }
    private onUnselectID($event:any):void{
        let eList:Array<any> = this.experimentsService.experimentList;
        if(eList){
            this.experimentsService.emitFilteredOverviewList(eList);
        }
    }


    saveVis():void{
        this.showSpinner = false;
        this.experimentsService.dirty = false;


    }
    saveProject():void{
        this.showSpinner = false;
        this.experimentsService.dirty = false;
    }


    saveManager(){
        this.showSpinner = true;
        if(this.tabs.selectedIndex === 2){
            this.experimentsService.emitSaveManger("visibility")
        }else if (this.tabs.selectedIndex === 3){
            this.experimentsService.emitSaveManger("project")
        }

    }



    ngOnDestroy():void{
        this.overviewListSuscript.unsubscribe();
    }


}
