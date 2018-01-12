/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {FormGroup,FormBuilder,Validators } from "@angular/forms"
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {URLSearchParams} from "@angular/http"
import {TabContainer} from "../../util/tabs/tab-container.component";
import {TabChangeEvent} from "../../util/tabs/tab-change-event"
import {ConstantsService} from "../../services/constants.service";
import {DictionaryService} from "../../services/dictionary.service";
import {Subscription} from "rxjs/Subscription";
import {AnalysisService} from "../../services/analysis.service";


@Component({
    template: `
            <div class="flex-container">

                <div >
                    {{ this.analysisService.analysisList.length + " Analysis"}}
                </div>
                <div >
                    <label>Experiment #</label>
                    <jqxComboBox  class="inlineComboBox"
                                  [width]="170"
                                  [height]="20"
                                  [source]="orderedAnalysisIds"
                            (onSelect)="onIDSelect($event)" (onUnselect)="onUnselectID($event)">
                    </jqxComboBox>
                </div>


            </div>

            <div style="height: 100%;width:100%">
                <tab-container (tabChanging)="tabChanging($event)"
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
export class AnalysisOverviewComponent implements OnInit,OnDestroy{
    analysisGroup:any;
    private readonly ANALYSIS:string = "AnalysisTab";
    private readonly VISIBILITY:string = "AnalysisVisibleTabComponent";
    private readonly GROUP:string = "AnalysisGroupComponent";
    private analysisIdSet: Set<string> = new Set();
    public orderedAnalysisIds: Array<string> = [];
    private overviewListSuscript: Subscription;
    private initialed:boolean = false;



    @ViewChild(TabContainer) tabView: TabContainer;
    state:string = TabContainer.VIEW;
    tabNames:Array<string>;
    constructor(private appConstants:ConstantsService,private route:ActivatedRoute,
                public analysisService:AnalysisService, private router:Router,
                public dictionary:DictionaryService){
    }

    ngOnInit(){

        // This 'data' observable fires when tree node changes because url will change.
        this.route.data.forEach((data) => {
            this.analysisGroup = data['analysisGroup']; // this data is carried on route look at browse-analysis.component.ts
            if(!this.tabView.isInitalize()){
                if(this.analysisGroup){
                    this.tabNames = [this.ANALYSIS,this.ANALYSIS,this.GROUP];
                }
                else{
                    this.tabNames = [this.ANALYSIS,this.VISIBILITY];
                }
            }
            else{
                if (this.analysisGroup) { // no projectTab, add it
                    let index = this.tabView.containsTab(this.GROUP);
                    if (index === -1) {
                        this.tabView.addTab(this.GROUP);
                        this.tabNames.push(this.GROUP);
                    }
                }
                else {
                    let index = this.tabView.containsTab(this.GROUP);
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

    }

    /* The subscribe is fire in the event a tree node of lab or project is select or search button in browse filter is
        selected. This is the first subscriber called and saves analysisList in the service so subsequent subscribers
        can use it.
     */
    refreshOverviewData():void{
        this.overviewListSuscript = this.analysisService.getAnalysisOverviewListSubject()
            .subscribe(data =>{
                this.analysisIdSet.clear();
                this.analysisService.analysisList = this.getAnalyses(data);
                let sortIdFn = (obj1:string , obj2:string) => {
                    if(obj2 < obj1){
                        return 1;
                    }
                    if(obj2 > obj1){
                        return -1;
                    }
                    return 0;
                };
                this.orderedAnalysisIds = Array.from(this.analysisIdSet).sort(sortIdFn);
                if(this.tabView.isInitalize() ) { // incase new lab is being loaded from search
                    this.refresh(data);
                }
            });
    }


    refreshAnalysis():void{
        console.log("refreshing Analysis")
    }

    refresh(data?:any):void{
        if(this.tabNames[this.tabView.activeId] === this.ANALYSIS ){
            this.refreshAnalysis();
        }
        else if(this.tabNames[this.tabView.activeId] === this.VISIBILITY){
            //this.refreshVisibility();
        }
        else{ // Project this  is optional

            //this.refreshProject();
        }
    }

    getAnalyses(data:any):Array<any>{
        let flatAnalysisList:Array<any> = [];

        if(Array.isArray(data) ){
            if(data.length > 0 && !data[0].AnalysisGroup){
                (<Array<any>> data).forEach(aObj =>{
                    this.analysisIdSet.add(aObj.number)
                });
                flatAnalysisList = data;
            }
            else{
                return this.initAllLabs(data,flatAnalysisList);
            }
        }


        if (data.AnalysisGroup) { //Lab level
            let projectList: Array<any> = Array.isArray(data.AnalysisGroup) ? data.AnalysisGroup : [data.AnalysisGroup];
            projectList.forEach(subData => {
                let aList: Array<any> = Array.isArray(subData.Analysis) ? subData.Analysis :  subData.Analysis ? [subData.Analysis] : subData.Analysis;
                if(aList){
                    aList.forEach(aObject => {
                        flatAnalysisList.push(aObject);
                        this.analysisIdSet.add(aObject.number);
                    });
                }
            });
        }
        else if(data.Analysis){ // Analysis Group level
            flatAnalysisList = Array.isArray(data.Analysis) ? data.Analysis : [data.Analysis];
            flatAnalysisList.forEach(aObj =>{
                this.analysisIdSet.add(aObj.number);
            });
        }

        return flatAnalysisList;
    }


    initAllLabs(data:any ,flatAList:Array<any>):Array<any>{

        if(data.length > 0 && data[0].AnalysisGroup){ // array of labs(more complex parsing)
            for(let i = 0; i < data.length; i++){
                if(data[i].AnalysisGroup){
                    let projectList = Array.isArray(data[i].AnalysisGroup) ? data[i].AnalysisGroup : [data[i].AnalysisGroup] ;
                    for(let j = 0; j < projectList.length; j++){
                        if(projectList[j].Analysis){
                            let aList =  Array.isArray(projectList[j].Analysis) ? projectList[j].Analysis : [projectList[j].Analysis];
                            for(let k = 0; k < aList.length; k++){
                                if(i === 0 && j === 0){
                                    flatAList.push(aList[k]);
                                    this.analysisIdSet.add(aList[k].number);
                                }
                                aList[k].idAnalysisGroup = projectList[j].idAnalysisGroup;
                                //aList[k]["analysisChecked"] = aList[k].analysisNames !== '' ? this.appConstants.ICON_CHECKED : '';
                            }
                        }
                    }
                }
            }
        }
        return flatAList;

    }


     tabChanging(event:TabChangeEvent){

        if(this.tabNames[event.nextId] === this.ANALYSIS ){
            this.refreshAnalysis();
        }
        else if(this.tabNames[event.nextId] === this.VISIBILITY){
            //this.refreshVisibility();
        }
        else{ // Project this  is optional
            //this.refreshProject();
        }
    }



    private onIDSelect($event:any): void{
        let filteredIdList:Array<any> = [];
        if($event.args && $event.args.item.value){
            let aList:Array<any> = this.analysisService.analysisList;
            if(aList){
                aList.forEach(aObject => {
                    if($event.args.item.value === aObject.number){
                        filteredIdList.push(aObject);
                    }
                });
            }
        }
        if(filteredIdList.length > 0 ){
            this.analysisService.emitFilteredOverviewList(filteredIdList);
        }
    }
    private onUnselectID($event:any):void{
        let eList:Array<any> = this.analysisService.analysisList;
        if(eList){
            this.analysisService.emitFilteredOverviewList(eList);
        }
    }



    ngOnDestroy():void{
        this.analysisService.resetAnalysisOverviewListSubject();
        this.overviewListSuscript.unsubscribe();
    }


}
