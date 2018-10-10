import { Component, ComponentRef, OnDestroy, OnInit } from "@angular/core";
import {GridOptions} from "ag-grid/main";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {ConstantsService} from "../../services/constants.service";
import {ExperimentPlatformService} from "../../services/experiment-platform.service";
import {ExperimentPlatformTabComponent} from "./experiment-platform-tab.component";
import {EpSampleTypeTabComponent} from "./ep-sample-type-tab.component";
import {EpLibraryPrepTabComponent} from "./ep-library-prep-tab.component";
import {Subscription} from "rxjs";
import {DialogsService} from "../../util/popup/dialogs.service";
import {ConfigureAnnotationsComponent} from "../../util/configure-annotations.component";
import {MatDialog, MatDialogConfig,MatTabChangeEvent} from "@angular/material";
import {HttpParams} from "@angular/common/http";
import {IconTextRendererComponent} from "../../util/grid-renderers";
import {EpPipelineProtocolTabComponent} from "./ep-pipeline-protocol-tab.component";
import {EpIlluminaSeqTabComponent} from "./ep-illumina-seq-tab.component";
import {AddExperimentPlatformDialogComponent} from "./add-experiment-platform-dialog.component";
import {EpLibraryPrepQCTabComponent} from "./ep-library-prep-qc-tab.component";
import * as _ from "lodash";
import {EpPrepTypesTabComponent} from "./ep-prep-types-tab.component";
import {EpExperimentTypeTabComponent} from "./ep-experiment-type-tab.component";

@Component({
    templateUrl: './experiment-platform-overview.component.html',
    styles:[`
        .active-item {
            /*color: #636c72;*/
            background-color: #c8c8c8;
        }

        .mat-tab-group-border{
            border: 1px solid #e8e8e8;
        }

        .active-item:hover {
            border: .05rem solid #bfc4c4;
            background-color: #c8c8c8;
            cursor: pointer;
        }
    `]
})

export class ExperimentPlatformOverviewComponent implements OnInit, OnDestroy{

    public readonly rowSelection = "single";
    private rowData = [];
    private gridOpt:GridOptions = {};
    private selectRowIndex:number = -1 ;
    public  selectedPlatformList:any[] = [];
    public experimentPlatformTabs: any[] = [];
    public platformListSubscription: Subscription;
    private tabComponentRefList:ComponentRef<any>[] = [];
    public showSpinner:boolean = true;
    public removeSave:boolean = false;
    public tabIndex = 0;



    columnDefs = [
        {
            headerName: "Experiment Platform",
            editable: false,
            field: "display",
            cellRendererFramework : IconTextRendererComponent,
            width: 100
        }

    ];

    public tabComponentTemplate:any = {
        'ExperimentPlatformTabComponent': { name: 'Experiment Platform', component: ExperimentPlatformTabComponent, inputs: {} },
        'EpSampleTypeTabComponent': { name: 'Sample Type', component: EpSampleTypeTabComponent,inputs:{} },
        'EpLibraryPrepTabComponent': { name:'LibraryPrep', component: EpLibraryPrepTabComponent,inputs:{} },
        'ConfigureAnnotationsComponent': { name:'Property', component: ConfigureAnnotationsComponent, inputs:{} },
        'EpPipelineProtocolTabComponent': { name:'Pipeline Protocol',component:EpPipelineProtocolTabComponent },
        'EpIlluminaSeqTabComponent':{ name:'Illumina Seq', component:EpIlluminaSeqTabComponent },
        'EpLibraryPrepQCTabComponent': { name:'Lib Prep QC', component:EpLibraryPrepQCTabComponent },
        'EpPrepTypesTabComponent': { name:'Prep Types', component:EpPrepTypesTabComponent},
        'EpExperimentTypeTabComponent': {name:'Library Prep', component:EpExperimentTypeTabComponent}
    };

    constructor(private secAdvisor:CreateSecurityAdvisorService,
                private constService:ConstantsService,
                public expPlatformService: ExperimentPlatformService,
                private dialogService:DialogsService,private dialog:MatDialog){
    }

    ngOnInit():void{
        this.expPlatformService.getExperimentPlatformList_fromBackend(); // need

        this.platformListSubscription = this.expPlatformService.getExperimentPlatformListObservable()
            .subscribe(resp =>{
                if(resp){

                    this.showSpinner = false;
                    this.rowData = <Array<any>>resp; //(<Array<any>>resp).filter(exPlatform => exPlatform.isActive === 'Y' );
                }else if(resp && resp.message){
                    this.dialogService.alert(resp.message);
                }else{
                    this.dialogService.alert("An error has occurred getting ExperimentPlatformList");
                }
                this.expPlatformService.expPlatformOverviewForm.markAsPristine();
                this.expPlatformService.expPlatformOverviewForm.markAsUntouched();
            });

        this.expPlatformService.getExperimentPlatformTypeChangeObservable()
            .subscribe((expPlatform) =>{
                this.expPlatformService.setExperimentPlatformState(expPlatform);
                this.propagateTabChange();
                this.componentInit(expPlatform);

            });

    }

    componentCreated(event:ComponentRef<any>){
        this.tabComponentRefList.push(event);
        if(event.instance instanceof ConfigureAnnotationsComponent ){
            let propertyTab:ConfigureAnnotationsComponent = event.instance;
            propertyTab.experimentPlatformMode = true;
        }

        //this.expPlatformService.addExpPlatformFormMember()
    }


    onGridReady(event){
        this.gridOpt.api.sizeColumnsToFit();
        let start:number = 0;
        this.gridOpt.api.forEachNode(node=> {
            return node.rowIndex === start  ? node.setSelected(true) : -1;
        })
    }

    changeExperimentPlaform(exPlatform){
        if(exPlatform){


            this.expPlatformService.setExperimentPlatformState(exPlatform);
            this.expPlatformService.emitExperimentPlatform(exPlatform); // existing platform
            this.propagateTabChange();

            this.componentInit(exPlatform);


            //this.experimentPlatformTabs =
        }

    }

    selectedRow(event:any){
        this.selectedPlatformList = this.gridOpt.api.getSelectedRows();
        let exPlatform = null;
        if(this.selectedPlatformList.length > 0){
            exPlatform =  _.cloneDeep(this.selectedPlatformList[0]);
        }

        if( this.selectRowIndex != event.rowIndex && event.node.selected){
            console.log("Previous tab: " + this.selectRowIndex + " current Tab: " + event.rowIndex  );
            if(this.expPlatformService.expPlatformOverviewForm.dirty){
                this.dialogService.confirm("Warning","Your changes have not been saved.  Discard changes?").first().subscribe(answer =>{
                    if(!answer){
                        this.gridOpt.api.forEachNode(node=> {
                            return node.rowIndex === this.selectRowIndex  ? node.setSelected(true) : -1;
                        });
                        return;
                    }else{
                        this.selectRowIndex = event.rowIndex;
                        this.changeExperimentPlaform(exPlatform);
                    }
                })
            }else{
                this.selectRowIndex = event.rowIndex;
                this.changeExperimentPlaform(exPlatform);
            }



        }






    }

    private addedFn = ()=>{
        this.showSpinner = true;
    };

    addPlatform(event:any){

        let end:number = this.rowData.length - 1;
        let config: MatDialogConfig = new MatDialogConfig();

        config.data = {
            addFn: this.addedFn
        };
        config.panelClass = "no-padding-dialog";
        this.dialog.open(AddExperimentPlatformDialogComponent,config);

    }
    removePlatform(){
        let expPlatform = this.selectedPlatformList.length > 0 ? this.selectedPlatformList[0] : null;
        if(expPlatform){
            this.dialogService.confirm("Remove Platform ",
                "Are you sure you want to remove experiment platform " + expPlatform.display + "?")
                .first().subscribe((result:boolean) => {
                if(result){
                    this.showSpinner = true;
                    let params:HttpParams = new HttpParams().set("codeRequestCategory", expPlatform.codeRequestCategory);
                    this.expPlatformService.deleteExperimentPlatform(params).first()
                        .subscribe(resp => {
                            if(resp && resp.result === "SUCCESS"){
                                this.expPlatformService.getExperimentPlatformList_fromBackend();
                            }else if(resp && resp.message){
                                this.dialogService.alert(resp.message);
                            }
                        });
                    this.experimentPlatformTabs = [];
                }

            });

        }


    }


    propagateTabChange() { // programmatically reloading tabs
        let tabList: any[] = [];
        this.expPlatformService.getExperimentPlatformTabList().forEach(tabStr => {
            tabList.push(this.tabComponentTemplate[tabStr]);
        });
        this.tabIndex = 0;
        this.experimentPlatformTabs = tabList;
    }

    tabChanged(event:MatTabChangeEvent){ // user selected a new tab
        this.removeSave = false;
        if(event.tab){
            if(event.tab.textLabel  === "Property"){
                let propertyTabRef:ComponentRef<ConfigureAnnotationsComponent> =
                    this.tabComponentRefList.find(compRef => compRef.instance instanceof ConfigureAnnotationsComponent );
                propertyTabRef.instance.externallyResizeGrid();
                this.removeSave = true;
            }else if (event.tab.textLabel === "Sample Type"){
                let sampleTypeTabRef:ComponentRef<EpSampleTypeTabComponent> =
                    this.tabComponentRefList.find(compRef => compRef.instance instanceof EpSampleTypeTabComponent );
                sampleTypeTabRef.instance.externallyResizeGrid();
            }else if (event.tab.textLabel === "Library Prep"){
                let experimentTypeTabRef: ComponentRef<EpExperimentTypeTabComponent> =
                    this.tabComponentRefList.find(compRef => compRef.instance instanceof EpExperimentTypeTabComponent );
                experimentTypeTabRef.instance.externallyResizeGrid();
            }

        }
    }

    componentInit(expPlatform:any){
        setTimeout(() =>{
            let propertyTab:ComponentRef<ConfigureAnnotationsComponent> = null;
            let tempTabComponentRefList:ComponentRef<any>[] = [];
            for(let i = 0; i< this.tabComponentRefList.length; i++){
                let pt = this.experimentPlatformTabs.find(platTab => this.tabComponentRefList[i].instance instanceof platTab.component)
                if(pt){
                    tempTabComponentRefList.push(this.tabComponentRefList[i]);
                }else{
                    this.expPlatformService.initExpPlatformForm(this.tabComponentRefList[i].instance.constructor.name, true);
                }
            }
            this.tabComponentRefList = tempTabComponentRefList;

            for(let compRef of this.tabComponentRefList){
                let name = compRef.instance.constructor.name;
                if(compRef.instance.formGroup && !this.expPlatformService.findExpPlatformFormMember(name)){
                    this.expPlatformService.addExpPlatformFormMember(compRef.instance.formGroup,name);
                }
                if(compRef.instance instanceof ConfigureAnnotationsComponent ){
                    propertyTab = compRef;
                }
            }
            propertyTab.instance.setupExpPlatformMode(expPlatform);

        });
    }



    onSplitDragEnd(event:any){
        this.gridOpt.api.sizeColumnsToFit();
    }


    refresh(event:any){
        //this.rowData.find()
        let tempRowData:Array<any> = [];
        let rowItem: any = this.rowData[this.selectRowIndex];
        rowItem.idCoreFacility =event.idCoreFacility;
        rowItem.facilityName = event.facilityName;
        this.rowData = this.rowData.slice();

    }


    onCreate(event:any){

    }

    ngOnDestroy(){
        this.platformListSubscription.unsubscribe();
    }



}
