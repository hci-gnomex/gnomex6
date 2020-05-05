import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {TabContainer} from "../../util/tabs/tab-container.component";
import {ConstantsService} from "../../services/constants.service";
import {DictionaryService} from "../../services/dictionary.service";
import {Subscription} from "rxjs";
import {AnalysisService} from "../../services/analysis.service";
import {MatTabChangeEvent, MatTabGroup} from "@angular/material";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {DialogsService} from "../../util/popup/dialogs.service";


@Component({
    template: `
        <div class="full-width full-height">
            <div class="full-width full-height flex-container-col">
                <div class="full-width flex-container-row align-center">
                    <div class="flex-grow padded">
                        {{ nodeTitle}} &nbsp;&nbsp;&nbsp;&nbsp; {{"(" + this.analysisService.analysisList.length + ((this.analysisService.analysisList.length !== 1) ? " Analyses)" : " Analysis)")}}
                    </div>
                    <div class="flex-container-row align-center right-padding">
                        <div class="padded">Analysis #</div>
                        <custom-combo-box [options]="this.orderedAnalysisIds"
                                          (optionSelected)="onIDSelect($event)">
                        </custom-combo-box>
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
                            <analysis-group-tab (saveSuccess)="saveGroup($event)"></analysis-group-tab>
                        </mat-tab>
                    </mat-tab-group>
                </div>
                <div class="full-width flex-container-row right-align">
                    <div class="full-height flex-grow">
                    </div>
                    <div>
                        <save-footer *ngIf="!this.noSave" (saveClicked)="saveManager()"
                                     [dirty]="this.analysisService.dirty"
                                     [showSpinner]="this.showSpinner"
                                     [disableSave]="this.analysisService.invalid || this.noSave || this.createSecurityAdvisorService.isGuest">
                        </save-footer>
                    </div>
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
export class AnalysisOverviewComponent implements OnInit, OnDestroy {
    @ViewChild(MatTabGroup) tabs: MatTabGroup;
    state: string = TabContainer.VIEW;
    public nodeTitle: string = "";
    public analysisGroup: any;
    public readonly message: string = "Your changes haven't been saved";
    public orderedAnalysisIds: Array<string> = [];
    public showSpinner: boolean = false;
    public noSave: boolean = true;

    private analysisIdSet: Set<string> = new Set();
    private overviewListSubscript: Subscription;
    private initialized: boolean = false;


    constructor(private appConstants: ConstantsService, private route: ActivatedRoute,
                public analysisService: AnalysisService, private router: Router,
                public dictionary: DictionaryService, private dialogsService: DialogsService,
                public createSecurityAdvisorService: CreateSecurityAdvisorService) {
    }

    ngOnInit() {

        // This 'data' observable fires when tree node changes because url will change.
        this.route.data.forEach((data) => {
            this.analysisGroup = data["analysisGroup"]; // this data is carried on route look at browse-analysis.component.ts
        });


        this.refreshOverviewData();
        this.initialized = true;

    }

    /* The subscribe is fire in the event a tree node of lab or project is select or search button in browse filter is
        selected. This is the first subscriber called and saves analysisList in the service so subsequent subscribers
        can use it.
     */
    refreshOverviewData(): void {
        this.overviewListSubscript = this.analysisService.getAnalysisOverviewListSubject()
            .subscribe(data => {
                this.analysisService.invalid = false;
                this.analysisService.dirty = false;
                this.analysisIdSet.clear();
                this.analysisService.analysisList = this.getAnalyses(data);
                let sortIdFn = (obj1: string , obj2: string) => {
                    if(obj2 < obj1) {
                        return 1;
                    }
                    if(obj2 > obj1) {
                        return -1;
                    }
                    return 0;
                };
                this.orderedAnalysisIds = Array.from(this.analysisIdSet).sort(sortIdFn);

                if(data && !data.idAnalysis) {
                    this.nodeTitle = data.label;
                }

                setTimeout(() => {
                    this.dialogsService.stopAllSpinnerDialogs();
                });
            });

    }


    getAnalyses(data: any): Array<any> {
        let flatAnalysisList: Array<any> = [];
        if(!data) {
            return flatAnalysisList;
        }

        if(Array.isArray(data) ) {
            if(data.length > 0 && !data[0].AnalysisGroup) {
                (<Array<any>> data).forEach(aObj => {
                    this.analysisIdSet.add(aObj.number);
                });
                flatAnalysisList = data;
            } else {
                return this.initAllLabs(data, flatAnalysisList);
            }
        }


        if (data.AnalysisGroup) { //Lab level
            let projectList: Array<any> = Array.isArray(data.AnalysisGroup) ? data.AnalysisGroup : [data.AnalysisGroup];
            projectList.forEach(subData => {
                let aList: Array<any> = Array.isArray(subData.Analysis) ? subData.Analysis :  subData.Analysis ? [subData.Analysis] : subData.Analysis;
                if(aList) {
                    aList.forEach(aObject => {
                        flatAnalysisList.push(aObject);
                        this.analysisIdSet.add(aObject.number);
                    });
                }
            });
        } else if(data.Analysis) { // Analysis Group level
            flatAnalysisList = Array.isArray(data.Analysis) ? data.Analysis : [data.Analysis];
            flatAnalysisList.forEach(aObj => {
                this.analysisIdSet.add(aObj.number);
            });
        }

        return flatAnalysisList;
    }


    tabChanged(event: MatTabChangeEvent) {
        if(event.index === 0) {
            this.noSave = true;
        } else {
            this.noSave = false;
        }

    }


    saveVis(): void {
        this.showSpinner = false;
        this.analysisService.dirty = false;
    }


    saveGroup(saveSuccess: boolean): void {
        this.showSpinner = false;
        if(saveSuccess) {
            this.analysisService.dirty = false;
        } else {
            this.analysisService.dirty = true;
        }

    }


    initAllLabs(data: any, flatAList: Array<any>): Array<any> {

        if(data.length > 0 && data[0].AnalysisGroup) { // array of labs(more complex parsing)
            for(let i = 0; i < data.length; i++) {
                if(data[i].AnalysisGroup) {
                    let projectList = Array.isArray(data[i].AnalysisGroup) ? data[i].AnalysisGroup : [data[i].AnalysisGroup] ;
                    for(let j = 0; j < projectList.length; j++) {
                        if(projectList[j].Analysis) {
                            let aList =  Array.isArray(projectList[j].Analysis) ? projectList[j].Analysis : [projectList[j].Analysis];
                            for(let k = 0; k < aList.length; k++) {
                                if(i === 0 && j === 0) {
                                    flatAList.push(aList[k]);
                                    this.analysisIdSet.add(aList[k].number);
                                }
                                aList[k].idAnalysisGroup = projectList[j].idAnalysisGroup;
                            }
                        }
                    }
                }
            }
        }
        return flatAList;

    }

    onIDSelect($event: any): void {
        let filteredIdList: Array<any> = [];
        if($event) {
            let aList: Array<any> = this.analysisService.analysisList;
            if(aList) {
                aList.forEach(aObject => {
                    if($event === aObject.number) {
                        filteredIdList.push(aObject);
                    }
                });
            }
        }
        if(filteredIdList.length > 0) {
            this.analysisService.emitFilteredOverviewList(filteredIdList);
        } else {
            let eList: Array<any> = this.analysisService.analysisList;
            if(eList) {
                this.analysisService.emitFilteredOverviewList(eList);
            }
        }
    }

    saveManager() {
        this.showSpinner = true;
        if(this.tabs.selectedIndex === 1) {
            this.analysisService.emitSaveManger("visibility");
        } else if (this.tabs.selectedIndex === 2) {
            this.analysisService.emitSaveManger("group");
        }

    }

    ngOnDestroy(): void {
        this.overviewListSubscript.unsubscribe();
    }

}
