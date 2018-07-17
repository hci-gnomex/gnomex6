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
import {MatTabChangeEvent, MatTabGroup} from "@angular/material";
import {AnalysisGroupComponent} from "./analysis-group.component";
import {AnalysisVisibleTabComponent} from "./analysis-visible-tab.component";


@Component({
    template: `
        <div class="full-width full-height">
            <div class="full-width full-height flex-container-col">
                <div class="full-width flex-container-row align-center">
                    <div class="flex-grow padded">
                        {{ this.analysisService.analysisList.length + ((this.analysisService.analysisList.length != 1) ? " Analyses" : " Analysis")}}
                    </div>
                    <div class="flex-container-row align-center right-padding">
                        <div class="padded">Analysis #</div>
                        <jqxComboBox class="no-top-margin"
                                     [width]="170"
                                     [height]="20"
                                     [source]="orderedAnalysisIds"
                                     (onSelect)="onIDSelect($event)" 
                                     (onUnselect)="onUnselectID($event)">
                        </jqxComboBox>
                    </div>
                </div>
                <div class="full-width vertical-spacer"></div>
                <div class="full-width flex-grow">
                    <mat-tab-group class="full-height full-width border" (selectedTabChange)="tabChanged($event)">
                        <mat-tab class="full-height full-width" label="Analysis">
                            <analysis-tab></analysis-tab>
                        </mat-tab>
                        <mat-tab class="full-height full-width" label="Visibility">
                            <analysis-visiblity-tab (saveSuccess)="saveVis()" ></analysis-visiblity-tab>
                        </mat-tab>
                        <mat-tab *ngIf="this.analysisGroup" class="full-height full-width" label="Analysis Group">
                            <analysis-group-tab (saveSuccess)="saveGroup()"></analysis-group-tab>
                        </mat-tab>
                    </mat-tab-group>
                </div>
                <div class="full-width">
                    <save-footer (saveClicked)="saveManager()"
                                 [dirty]="this.analysisService.dirty"
                                 [showSpinner]="this.showSpinner"
                                 [disableSave]="this.analysisService.invalid || this.noSave">
                    </save-footer>
                </div>
            </div>
        </div>
    `,
    styles: [`
        
        .padded { padding: 0.3em; }

        .right-padding { padding-right: 0.5em; }
        
        .border { border: 1px solid #e8e8e8; }
        
        .vertical-spacer { height: 0.3em; }
        
        .no-top-margin { margin-top: 0; }
        

        .flex-container{
            display: flex;
            justify-content: space-between;
            flex:1;
        }
        /deep/ .mat-tab-body-wrapper {
            flex-grow: 1 !important;
        }
        
    `]
})
export class AnalysisOverviewComponent implements OnInit,OnDestroy{
    public analysisGroup:any;
    public readonly message:string = "Your changes haven't been saved";
    private analysisIdSet: Set<string> = new Set();
    public orderedAnalysisIds: Array<string> = [];
    private overviewListSuscript: Subscription;
    private initialized:boolean = false;
    public showSpinner:boolean = false;
    private noSave:boolean = true;
    @ViewChild(MatTabGroup) tabs: MatTabGroup;

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
        });


        this.refreshOverviewData();
        this.initialized = true;

    }

    /* The subscribe is fire in the event a tree node of lab or project is select or search button in browse filter is
        selected. This is the first subscriber called and saves analysisList in the service so subsequent subscribers
        can use it.
     */
    refreshOverviewData():void{
        this.overviewListSuscript = this.analysisService.getAnalysisOverviewListSubject()
            .subscribe(data =>{
                this.analysisService.invalid = false;
                this.analysisService.dirty = false;
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
            });
    }


    getAnalyses(data:any):Array<any>{
        let flatAnalysisList:Array<any> = [];
        if(!data){
            return flatAnalysisList;
        }

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
    tabChanged(event:MatTabChangeEvent){
        if(event.index === 0){
            this.noSave = true;
        }else{
            this.noSave = false;
        }

    }



    saveVis():void{
        this.showSpinner = false;
        this.analysisService.dirty = false;


    }
    saveGroup():void{
        this.showSpinner = false;
        this.analysisService.dirty = false;
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

    saveManager(){
        this.showSpinner = true;
        if(this.tabs.selectedIndex === 1){
            this.analysisService.emitSaveManger("visibility")
        }else if (this.tabs.selectedIndex === 2){
            this.analysisService.emitSaveManger("group")
        }

        console.log(this.tabs.selectedIndex)

    }



    ngOnDestroy():void{
        this.overviewListSuscript.unsubscribe();
    }


}
