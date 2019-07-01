import {Component, ComponentRef, OnDestroy, OnInit} from "@angular/core";
import {GridOptions} from "ag-grid-community/main";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {ConstantsService} from "../../services/constants.service";
import {ExperimentPlatformService} from "../../services/experiment-platform.service";
import {ExperimentPlatformTabComponent} from "./experiment-platform-tab.component";
import {EpSampleTypeTabComponent} from "./ep-sample-type-tab.component";
import {Subscription} from "rxjs";
import {DialogsService} from "../../util/popup/dialogs.service";
import {ConfigureAnnotationsComponent} from "../../util/configure-annotations.component";
import {MatDialog, MatDialogConfig, MatTabChangeEvent} from "@angular/material";
import {HttpParams} from "@angular/common/http";
import {IconTextRendererComponent} from "../../util/grid-renderers";
import {EpPipelineProtocolTabComponent} from "./ep-pipeline-protocol-tab.component";
import {EpIlluminaSeqTabComponent} from "./ep-illumina-seq-tab.component";
import {AddExperimentPlatformDialogComponent} from "./add-experiment-platform-dialog.component";
import {EpLibraryPrepQCTabComponent} from "./ep-library-prep-qc-tab.component";
import * as _ from "lodash";
import {EpPrepTypesTabComponent} from "./ep-prep-types-tab.component";
import {EpExperimentTypeTabComponent} from "./ep-experiment-type-tab.component";
import {EpExperimentTypeIlluminaTabComponent} from "./ep-experiment-type-illumina-tab.component";
import {EpExperimentTypeQcTabComponent} from "./ep-experiment-type-qc-tab.component";
import {FormGroup} from "@angular/forms";
import {DictionaryService} from "../../services/dictionary.service";
import {first} from "rxjs/operators";
import {IGnomexErrorResponse} from "../../util/interfaces/gnomex-error.response.model";
import {ActionType} from "../../util/interfaces/generic-dialog-action.model";

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
    public showInactive:boolean = false;
    private allExpPlatorms:any[] = [];
    private selectedExpPlatformexPlatform : any;



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
        'ConfigureAnnotationsComponent': { name:'Property', component: ConfigureAnnotationsComponent, inputs:{} },
        'EpPipelineProtocolTabComponent': { name:'Pipeline Protocol',component:EpPipelineProtocolTabComponent },
        'EpIlluminaSeqTabComponent':{ name:'Illumina Seq', component:EpIlluminaSeqTabComponent },
        'EpLibraryPrepQCTabComponent': { name:'Lib Prep QC', component:EpLibraryPrepQCTabComponent },
        'EpPrepTypesTabComponent': { name:'Prep Types', component:EpPrepTypesTabComponent},
        'EpExperimentTypeTabComponent': {name:'Library Prep', component:EpExperimentTypeTabComponent},
        'EpExperimentTypeIlluminaTabComponent':{name:'Library Prep', component:EpExperimentTypeIlluminaTabComponent},
        'EpExperimentTypeQcTabComponent':{name:'QC Assay', component:EpExperimentTypeQcTabComponent}
    };

    constructor(private secAdvisor:CreateSecurityAdvisorService,
                private constService:ConstantsService,
                public expPlatformService: ExperimentPlatformService,
                private dialogService:DialogsService,private dialog:MatDialog,
                private dictionaryService: DictionaryService
    ){
    }

    ngOnInit():void{
        this.expPlatformService.getExperimentPlatformList_fromBackend(); // need
        this.expPlatformService.getExperimentPlatformTypeChangeObservable()
            .subscribe((expPlatform) =>{
                this.experimentPlatformTabs = [];
                this.expPlatformService.clearOutExpPlatformForm();
                this.expPlatformService.setExperimentPlatformState(expPlatform);
                this.propagateTabChange();

            });

    }




    onGridReady(event){
        this.gridOpt.api.sizeColumnsToFit();
        this.platformListSubscription = this.expPlatformService.getExperimentPlatformListObservable()
            .subscribe(resp =>{
                if(resp){

                    this.allExpPlatorms = <Array<any>>resp; //(<Array<any>>resp).filter(exPlatform => exPlatform.isActive === 'Y' );
                    this.filterExperimentPlatform();
                    for(let row of this.allExpPlatorms){
                        this.constService.getTreeIcon(row,'RequestCategory');
                    }
                    if(this.selectRowIndex > -1){
                        this.gridOpt.api.forEachNode(node=> {
                            return node.rowIndex === this.selectRowIndex  ? node.setSelected(true) : -1;
                        });
                    }
                }
                this.expPlatformService.expPlatformOverviewForm.markAsPristine();
                this.expPlatformService.expPlatformOverviewForm.markAsUntouched();
                this.showSpinner = false;
            }, (err:IGnomexErrorResponse) => {
                this.showSpinner = false;
            });
    }

    changeExperimentPlaform(exPlatform){
        if(exPlatform){


            this.expPlatformService.setExperimentPlatformState(exPlatform);
            //this.expPlatformService.emitExperimentPlatform(expPlatform); // existing platform
            this.experimentPlatformTabs = [];
            this.expPlatformService.clearOutExpPlatformForm();
            this.propagateTabChange(exPlatform);
        }

    }

    selectedRow(event:any){
        this.selectedPlatformList = this.gridOpt.api.getSelectedRows();

        if( this.selectRowIndex != event.rowIndex && event.node.selected){
            if(this.selectedPlatformList.length > 0){
                this.selectedExpPlatformexPlatform =  _.cloneDeep(this.selectedPlatformList[0]);
            }
            //console.log("Previous tab: " + this.selectRowIndex + " current Tab: " + event.rowIndex  );
            if(this.expPlatformService.expPlatformOverviewForm.dirty){
                this.dialogService.confirm("Warning","Your changes have not been saved.  Discard changes?").pipe(first()).subscribe(answer =>{
                    if(!answer){
                        this.gridOpt.api.forEachNode(node=> {
                            return node.rowIndex === this.selectRowIndex  ? node.setSelected(true) : -1;
                        });
                        return;
                    }else{
                        this.selectRowIndex = event.rowIndex;
                        this.changeExperimentPlaform(this.selectedExpPlatformexPlatform);
                    }
                })
            }else{
                this.selectRowIndex = event.rowIndex;
                this.changeExperimentPlaform(this.selectedExpPlatformexPlatform);
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
        config.autoFocus = false;
        this.dialogService.genericDialogContainer(AddExperimentPlatformDialogComponent, "Add Experiment Platform", null, config,
            {actions: [
                    {type: ActionType.PRIMARY, icon: this.constService.ICON_SAVE, name: "Save", internalAction: "saveChanges"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                ]});

    }
    removePlatform(){
        let expPlatform = this.selectedPlatformList.length > 0 ? this.selectedPlatformList[0] : null;
        if(expPlatform){
            this.dialogService.confirm("Remove Platform ",
                "Are you sure you want to remove experiment platform " + expPlatform.display + "?")
                .pipe(first()).subscribe((result:boolean) => {
                if(result){
                    this.showSpinner = true;
                    let params:HttpParams = new HttpParams().set("codeRequestCategory", expPlatform.codeRequestCategory);
                    this.expPlatformService.deleteExperimentPlatform(params).pipe(first())
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
    componentCreated(event:ComponentRef<any>){
        this.tabComponentRefList.push(event);

        if(event.instance instanceof ConfigureAnnotationsComponent ){
            let propertyTab:ConfigureAnnotationsComponent = event.instance;
            propertyTab.experimentPlatformMode = true;
        }
        setTimeout(()=>{
            let name = event.instance.constructor.name;
            if(!(event.instance instanceof ConfigureAnnotationsComponent) ){
                this.expPlatformService.addExpPlatformFormMember(event.instance.formGroup,name);
            }else {
                let propertyTab:ConfigureAnnotationsComponent = event.instance;
                propertyTab.setupExpPlatformMode(this.selectedExpPlatformexPlatform);
            }
        });

    }


    propagateTabChange(expPlatform?:any) { // programmatically reloading tabs
        setTimeout(() =>{
            if(expPlatform){
                this.expPlatformService.emitExperimentPlatform(expPlatform); // existing platform
            }
            let tabList: any[] = [];
            this.expPlatformService.getExperimentPlatformTabList().forEach(tabStr => {
                tabList.push(this.tabComponentTemplate[tabStr]);
            });
            this.tabIndex = 0;
            this.experimentPlatformTabs = tabList;

        });
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
                let experimentTypeTabRef: ComponentRef<EpExperimentTypeTabComponent> | ComponentRef<EpExperimentTypeIlluminaTabComponent> =
                    this.tabComponentRefList.find(compRef => compRef.instance instanceof EpExperimentTypeTabComponent
                        || compRef.instance instanceof EpExperimentTypeIlluminaTabComponent );
                experimentTypeTabRef.instance.externallyResizeGrid();
            }

        }
    }

    filterExperimentPlatform(){
        if(this.showInactive){
            this.rowData = this.allExpPlatorms;
            this.gridOpt.api.setRowData( this.rowData)// = this.allExpPlatorms;
        }else{
            this.rowData = this.allExpPlatorms.filter(expPlat => expPlat.isActive === 'Y' );
            this.gridOpt.api.setRowData(this.rowData);
        }

    }



    onSplitDragEnd(event:any){
        this.gridOpt.api.sizeColumnsToFit();
    }


    refresh(event:any){

    }

    getRequestCategoryList(apps:any[]): any[]{
        let rcAppList:any[] = [];
        apps.forEach(app =>{
            let rcList =  Array.isArray(app.RequestCategoryApplication)? app.RequestCategoryApplication : [app.RequestCategoryApplication];
            for(let rc of rcList){
                rcAppList.push({
                    isSelected: rc.isSelected,
                    codeRequestCategory: rc.codeRequestCategory,
                    codeApplication: app.codeApplication,
                    appIsActive: app.isActive,
                    requestCategoryIsActive: rc.isActive
                });
            }
        });
        return rcAppList;

    }


    save(){
        this.showSpinner = true;
        let expPlatformForm:FormGroup = this.expPlatformService.expPlatformOverviewForm;
        let applications = null;
        let rcApplications = null;
        let sampleTypes: any[] = [];
        let sequencingOptionsForm: FormGroup = null;
        let prepQCProtocolsForm: FormGroup = null;
        let pipelineProtocolsForm: FormGroup = null;
        let prepTypesForm: FormGroup = null;

        let params:HttpParams = new HttpParams();
        params = params.set('isClinicalResearch',this.selectedPlatformList[0].isClinicalResearch)
            .set("codeRequestCategory", this.selectedPlatformList[0].codeRequestCategory)
            .set("isOwnerOnly", this.selectedPlatformList[0].isOwnerOnly);

        let experimentPlatformTabForm:FormGroup = <FormGroup>expPlatformForm.get('ExperimentPlatformTabComponent');
        Object.keys(experimentPlatformTabForm.controls).forEach( key => {
            let control = experimentPlatformTabForm.get(key).value;
            if(typeof control == "boolean"){
                let decisionStr = control ? 'Y' : 'N';
                params = params.set(key,decisionStr);
            }else if(control){
                params = params.set(key,control);
            }
        });


        if(this.expPlatformService.isIllumina && !this.expPlatformService.isNanoString){
            applications = expPlatformForm.get('EpExperimentTypeIlluminaTabComponent.applications').value;
            params = params.set("applicationsJSONString",JSON.stringify(applications));
        }else if(this.expPlatformService.isQC){
            applications = expPlatformForm.get('EpExperimentTypeQcTabComponent.applications').value;
            params = params.set("applicationsJSONString",JSON.stringify(applications))
        }else if(!this.expPlatformService.isNanoString){
            applications = expPlatformForm.get('EpExperimentTypeTabComponent.applications').value;
            params = params.set("applicationsJSONString",JSON.stringify(applications));
        }

        if(this.expPlatformService.isIllumina || this.expPlatformService.isSequenom){
            rcApplications =this.getRequestCategoryList(applications);
            params = params.set("requestCategoryApplicationJSONString",JSON.stringify(rcApplications));
        }

        sampleTypes = expPlatformForm.get('EpSampleTypeTabComponent.sampleTypes').value;
        if(sampleTypes && sampleTypes.length > 0){
            params = params.set('sampleTypesJSONString', JSON.stringify(sampleTypes));
        }
        sequencingOptionsForm = <FormGroup>expPlatformForm.get('EpIlluminaSeqTabComponent');
        if(sequencingOptionsForm){
            let seqOptions = sequencingOptionsForm.get('sequencingOptions').value;
            params = params.set('sequencingOptionsJSONString', JSON.stringify(seqOptions));
        }
        prepQCProtocolsForm = <FormGroup>expPlatformForm.get('EpLibraryPrepQCTabComponent');
        if(prepQCProtocolsForm){
            let prepQCProtocols = prepQCProtocolsForm.get('prepQCProtocols').value;
            params = params.set('prepQCProtocolsJSONString', JSON.stringify(prepQCProtocols));
        }
        pipelineProtocolsForm = <FormGroup>expPlatformForm.get('EpPipelineProtocolTabComponent');
        if(pipelineProtocolsForm){
            let pipelineProtocols = pipelineProtocolsForm.get('pipelineProtocols').value;
            params = params.set('pipelineProtocolsJSONString',JSON.stringify(pipelineProtocols));
        }
        prepTypesForm = <FormGroup>expPlatformForm.get('EpPrepTypesTabComponent');
        if(prepTypesForm){
            let prepTypes = prepTypesForm.get('prepTypes').value;
            params = params.set('prepTypesJSONString',JSON.stringify(prepTypes));
        }
        params = params.set("noJSONToXMLConversionNeeded", "Y");


        //let params:HttpParams = new HttpParams().set("applicationsXMLString",JSON.stringify(application));
        //let params: FormData = new FormData();
        //formData.append("applicationsXMLString",JSON.stringify(application));

        this.expPlatformService.saveExperimentPlatform(params).pipe(first()).subscribe( resp => {
            if(resp && resp.result && resp.result === "SUCCESS" ){
                this.expPlatformService.getExperimentPlatformList_fromBackend();
                this.dictionaryService.reloadAndRefresh();
            }else if(resp && resp.message){
                this.dialogService.alert(resp.message);
                this.showSpinner = false;
                //this.expPlatformService.getExperimentPlatformList_fromBackend();
            }else{
                this.dialogService.alert("Unknown Error occurred please contact GNomEx Support.");
                this.showSpinner = false;
            }
        })
    }

    ngOnDestroy(){
        this.platformListSubscription.unsubscribe();
        this.expPlatformService.clearOutExpPlatformForm();
    }



}
