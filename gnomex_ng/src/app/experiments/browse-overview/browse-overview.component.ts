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


@Component({
    template: `
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

            <div style="height: 100%;width:100%">
                <tab-container (tabChanged)="changedTab($event)"
                               [state]="state"
                               [componentNames]="tabNames">

                </tab-container>
            </div>
`,
    styles: [`
       
        
        
        .flex-container{
            display: flex;
            justify-content: space-between;
            margin-left: auto;
            padding-left: 1em;
        }
    `]
})
export class BrowseOverviewComponent implements OnInit,OnDestroy{
    project:any;
    private readonly EXPERIMENT:string = "ExperimentsBrowseTab";
    private readonly PROGRESS:string = "ProgressBrowseTab";
    private readonly VISIBILITY:string = "VisiblityBrowseTab";
    private readonly PROJECT:string = "ProjectBrowseTab";
    private experimentIdSet: Set<string> = new Set();
    public orderedExperimentIds: Array<string> = [];
    private overviewListSuscript: Subscription;
    private initialed:boolean = false;



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
                        this.tabNames.pop();//Project will always be the last tab
                        if(index === this.tabView.activeId){
                            this.tabView.select(0);
                        }
                    }
                }
            }
        });


        this.refreshOverviewData();
        this.initialed = true;

        /*this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                let something = this.route.snapshot;
            }
        });*/
    }

    /* The subscribe is fire in the event a tree node of lab or project is select or search button in browse filter is
        selected. This is the first subscriber called and saves experimentList in the service so subsequent subscribers
        can use it.
     */
    refreshOverviewData():void{
        this.overviewListSuscript = this.experimentsService.getExperimentOverviewListSubject()
            .subscribe(data =>{
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
                if(this.tabView.isInitalize() ) { // incase new lab is being loaded from search
                   this.refresh(data);
                }
            });
    }


    refreshExperiment():void{
        console.log("refreshing Experiment")
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
            this.experimentsService.getRequestProgressList_FromBackend(params);
            this.experimentsService.getRequestProgressDNASeqList_FromBackend(params);
            this.experimentsService.getRequestProgressSolexaList_FromBackend(params);
        }
        else{
            console.log("check browseFilter.search() to make sure browsePanelParams were set");
        }
    }
    refresh(data?:any):void{
            if(this.tabNames[this.tabView.activeId] === this.EXPERIMENT ){
                this.refreshExperiment();
            }
            else if(this.tabNames[this.tabView.activeId] === this.PROGRESS){
                this.refreshProgress(data);
            }
            else if(this.tabNames[this.tabView.activeId] === this.VISIBILITY){
                //this.refreshVisibility();
            }
            else{ // Project this  is optional

                //this.refreshProject();
            }
    }

    getExperiments(data:any):Array<any>{
        let flatRequestList:Array<any> = [];

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


    changedTab(event:TabChangeEvent){

        if(this.tabNames[event.nextId] === this.EXPERIMENT ){
            this.refreshExperiment();
        }
        else if(this.tabNames[event.nextId] === this.PROGRESS){
            this.refreshProgress();
        }
        else if(this.tabNames[event.nextId] === this.VISIBILITY){
            //this.refreshVisibility();
        }
        else{ // Project this  is optional
            //this.refreshProject();
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



    ngOnDestroy():void{
        this.experimentsService.resetExperimentOverviewListSubject();
        this.overviewListSuscript.unsubscribe();
    }


}
