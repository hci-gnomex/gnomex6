import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {URLSearchParams} from "@angular/http";
import {ExperimentsService} from "../experiments.service";
import {TabContainer} from "../../util/tabs/tab-container.component";
import {ConstantsService} from "../../services/constants.service";
import {DictionaryService} from "../../services/dictionary.service";
import {Subscription} from "rxjs";
import {MatTabChangeEvent, MatTabGroup} from "@angular/material";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {UserPreferencesService} from "../../services/user-preferences.service";
import {HttpParams} from "@angular/common/http";


@Component({
    template: `
        <div class="flexbox-column">
            <div class="flex-container">
                <div >
                    {{ nodeTitle}} &nbsp;&nbsp;&nbsp;&nbsp; {{ "(" + this.experimentsService.experimentList.length + " Experiments)"}}
                </div>
                <div>
                    <label>Experiment #</label>
                    <jqxComboBox  class="inlineComboBox"
                                  [width]="170"
                                  [height]="20"
                                  [source]="orderedExperimentIds"
                                  (onSelect)="onIDSelect($event)" (onUnselect)="onUnselectID($event)">
                    </jqxComboBox>
                </div>
            </div>
            <div class="full-width full-height flex-grow-greater overflow">
                <mat-tab-group class="mat-tab-group-border full-height full-width" (selectedTabChange)="tabChanged($event)">
                    <mat-tab class="full-height" label="Experiment">
                        <experiment-browse-tab></experiment-browse-tab>
                    </mat-tab>
                    <mat-tab class="full-height" label="Progress">
                        <progress-tab></progress-tab>
                    </mat-tab>
                    <mat-tab class="full-height" label="Visibility">
                        <visibility-browse-tab (saveSuccess)="saveVis()"></visibility-browse-tab>
                    </mat-tab>
                    <mat-tab *ngIf="this.project" class="full-height" label="Project">
                        <project-tab (saveSuccess)="saveProject($event)"></project-tab>
                    </mat-tab>
                </mat-tab-group>
            </div>
            <save-footer (saveClicked)="saveManager()"
                         [dirty]="this.experimentsService.dirty"
                         [showSpinner]="this.showSpinner"
                         [disableSave]="this.experimentsService.invalid || this.noSave || this.createSecurityAdvisorService.isGuest">
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

        .overflow { overflow: auto; }

        .flex-grow-greater { flex: 10; }

    `]
})
export class BrowseOverviewComponent implements OnInit, OnDestroy {
    @ViewChild(MatTabGroup) tabs: MatTabGroup;
    @ViewChild(TabContainer) tabView: TabContainer;
    state: string = TabContainer.VIEW;
    project: any;
    public nodeTitle: string = "";
    public orderedExperimentIds: Array<string> = [];
    public showSpinner: boolean = false;
    public noSave: boolean = true;
    private experimentIdSet: Set<string> = new Set();
    private overviewListSubscript: Subscription;
    private initialized: boolean = false;
    private readonly PROJECT_INDEX: number = 1;


    constructor(private appConstants: ConstantsService, private route: ActivatedRoute,
                public experimentsService: ExperimentsService,
                public dictionary: DictionaryService,
                public createSecurityAdvisorService: CreateSecurityAdvisorService,
                public prefService: UserPreferencesService) {
    }


    ngOnInit() {

        // This 'data' observable fires when tree node changes because url will change.
        this.route.data.forEach((data) => {
            this.project = data["project"]; // this data is carried on route look at browse-experiments.component.ts
        });

        this.refreshOverviewData();

    }


    /* The subscribe is fire in the event a tree node of lab or project is select or search button in browse filter is
        selected. This is the first subscriber called and saves experimentList in the service so subsequent subscribers
        can use it.
     */
    refreshOverviewData(): void {
        this.overviewListSubscript = this.experimentsService.getExperimentOverviewListSubject()
            .subscribe(data => {
                this.initialized = false;
                this.experimentsService.invalid = false;
                this.experimentsService.dirty = false;
                this.experimentIdSet.clear();
                this.experimentsService.experimentList = this.getExperiments(data);
                let sortIdFn = (obj1: string , obj2: string) => {
                    if(obj2 < obj1) {
                        return 1;
                    }
                    if(obj2 > obj1) {
                        return -1;
                    }
                    return 0;
                };
                this.orderedExperimentIds = Array.from(this.experimentIdSet).sort(sortIdFn);
                this.refreshOnSearch(data);

                if(data && !data.idRequest) {
                    this.nodeTitle = data.label;
                }
            });
    }


    refreshOnSearch(data?: any): void {
        if( this.tabs.selectedIndex === this.PROJECT_INDEX) {
            this.refreshProgress(data);
        }

    }

    refreshProgress(data?:any):void{
        let params:HttpParams = this.experimentsService.browsePanelParams;
        if(params){

            if(data){//when user selects from the tree
                let idProject = data['idProject'];
                params = params.set('idProject',idProject);
            }else{// Use when user changes to tab to progress
                let idProject = this.route.snapshot.paramMap.get('idProject');
                params = params.set('idProject',idProject);
            }

            if(!this.initialized) {
                this.experimentsService.getRequestProgressList_FromBackend(params);
                this.experimentsService.getRequestProgressDNASeqList_FromBackend(params);
                this.experimentsService.getRequestProgressSolexaList_FromBackend(params);
                this.initialized = true;
            }

        } else {
            console.log("check browseFilter.search() to make sure browsePanelParams were set");
        }
    }


    getExperiments(data: any): Array<any> {
        let flatRequestList: Array<any> = [];
        if(!data) {
            return flatRequestList;
        }

        if(Array.isArray(data)) {
            if(data.length > 0 && !data[0].Project) {
                (<Array<any>> data).forEach(rObj => {
                    this.experimentIdSet.add(rObj.requestNumber);
                });
                flatRequestList = data;
            } else {
                return this.initAllLabs(data, flatRequestList);
            }
        }


        if (data.Project) { // for Lab level
            let projectList: Array<any> = Array.isArray(data.Project) ? data.Project : [data.Project];
            projectList.forEach(subData => {
                let requestList: Array<any> = Array.isArray(subData.Request) ? subData.Request :  subData.Request ? [subData.Request] : subData.Request;
                if(requestList) {
                    requestList.forEach(rObject => {
                        this.getExperimentKind(rObject);
                        rObject["ownerFullName"] = this.prefService.formatUserName(rObject.ownerFirstName, rObject.ownerLastName);
                        rObject["analysisChecked"] = rObject.analysisNames !== "" ? "Y" : "N";

                        flatRequestList.push(rObject);
                        this.experimentIdSet.add(rObject.requestNumber);
                    });
                }
            });
        } else if(data.Request) {
            flatRequestList = Array.isArray(data.Request) ? data.Request : [data.Request];
            flatRequestList.forEach(rObj => {
                this.experimentIdSet.add(rObj.requestNumber);
            });
        }

        return flatRequestList;
    }


    initAllLabs(data: any, flatRList: Array<any>): Array<any> {

        if(data.length > 0 && data[0].Project) { // array of labs(more complex parsing)
            for(let i = 0; i < data.length; i++) {
                if(data[i].Project) {
                    let projectList = Array.isArray(data[i].Project) ? data[i].Project : [data[i].Project] ;
                    for(let j = 0; j < projectList.length; j++) {
                        if(projectList[j].Request) {
                            let requestList =  Array.isArray(projectList[j].Request) ? projectList[j].Request : [projectList[j].Request];
                            for(let k = 0; k < requestList.length; k++) {
                                if(i === 0 && j === 0) {
                                    flatRList.push(requestList[k]);
                                    this.experimentIdSet.add(requestList[k].requestNumber);
                                }
                                this.getExperimentKind(requestList[k]);
                                requestList[k]["ownerFullName"] = this.prefService.formatUserName(requestList[k].ownerFirstName, requestList[k].ownerLastName);
                                requestList[k]["analysisChecked"] = requestList[k].analysisNames !== "" ? "Y" : "N";
                            }
                        }
                    }
                }
            }
        }
        return flatRList;

    }


    tabChanged(event: MatTabChangeEvent) {
        if(event.index  <= this.PROJECT_INDEX) {
            this.refreshProgress();
            this.noSave = true;
        } else {
            this.noSave = false;
        }

    }


    getRequestKind(item: any): string {
        let de: any = this.dictionary.getEntry(DictionaryService.REQUEST_CATEGORY, item.codeRequestCategory);
        if (de) {
            return de.display;
        } else {
            return "";
        }
    }


    getExperimentKind(item: any): void {
        let experimentKind: string = "";

        if (item.codeApplication === "") {
            experimentKind = this.getRequestKind(item);
        } else {
            let de: any = this.dictionary.getEntry(DictionaryService.APPLICATION, item.codeApplication);
            if (de) {
                experimentKind = de.display;
            } else {
                experimentKind = this.getRequestKind(item);
            }
        }
        item["experimentKind"] = experimentKind;
    }


    onIDSelect($event: any): void {
        let filteredIdList: Array<any> = [];
        if($event.args && $event.args.item.value) {
            let eList: Array<any> = this.experimentsService.experimentList;
            if(eList) {
                eList.forEach(reqObject => {
                    if($event.args.item.value === reqObject.requestNumber) {
                        filteredIdList.push(reqObject);
                    }
                });
            }
        }
        if(filteredIdList.length > 0 ) {
            this.experimentsService.emitFilteredOverviewList(filteredIdList);
        }
    }


    onUnselectID($event: any): void {
        let eList: Array<any> = this.experimentsService.experimentList;
        if(eList) {
            this.experimentsService.emitFilteredOverviewList(eList);
        }
    }


    saveVis(): void {
        this.showSpinner = false;
        this.experimentsService.dirty = false;
    }


    saveProject(saveSuccess: boolean): void {
        this.showSpinner = false;
        if(saveSuccess) {
            this.experimentsService.dirty = false;
        } else {
            this.experimentsService.dirty = true;
        }
    }


    saveManager() {
        this.showSpinner = true;
        if(this.tabs.selectedIndex === 2) {
            this.experimentsService.emitSaveManger("visibility");
        } else if (this.tabs.selectedIndex === 3) {
            this.experimentsService.emitSaveManger("project");
        }
    }


    ngOnDestroy(): void {
        this.overviewListSubscript.unsubscribe();
    }

}
