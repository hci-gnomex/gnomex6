import {Component, OnDestroy, OnInit} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {ExperimentPlatformService} from "../../services/experiment-platform.service";
import {Subscription} from "rxjs";
import {CellValueChangedEvent, GridApi} from "ag-grid-community";
import {CheckboxRenderer} from "../../util/grid-renderers/checkbox.renderer";
import {SelectEditor} from "../../util/grid-editors/select.editor";
import {ConstantsService} from "../../services/constants.service";
import {SelectRenderer} from "../../util/grid-renderers/select.renderer";
import {DictionaryService} from "../../services/dictionary.service";
import {MatDialogConfig} from "@angular/material";
import {DialogsService} from "../../util/popup/dialogs.service";
import {LibraryPrepDialogComponent} from "./library-prep-dialog.component";
import {GnomexService} from "../../services/gnomex.service";
import {ActionType} from "../../util/interfaces/generic-dialog-action.model";

//assets/page_add.png

@Component({
    template: `
        <div class="full-height full-width flex-container-col">
            <div class="flex-grow flex-container-row" style="align-items:center;"  >
                <button mat-button color="primary"
                        type="button"
                        (click)="addApplication()">
                    <img [src]="this.constService.ICON_ADD"> Add
                </button>
                <button [disabled]="selectedApp.length === 0"
                        (click)="removeApplication()"
                        mat-button color="primary"
                        type="button">
                    <img [src]="this.constService.ICON_DELETE"> Remove
                </button>
                <button mat-button
                        color="primary"
                        (click)="openLibPrepEditor()"
                        [disabled]="selectedApp.length === 0"
                        type="button"> Edit Library Prep </button>

                <mat-checkbox (change)="filterAppOptions($event)" [(ngModel)]="showInactive">Show Inactive</mat-checkbox>

            </div>
            <div style="flex:9" class="full-width">
                <ag-grid-angular class="full-height full-width ag-theme-balham"
                                 [columnDefs]="columnDefs"
                                 (cellValueChanged)="onCellValueChanged($event)"
                                 [enableColResize]="true"
                                 [rowData]="rowData"
                                 (gridReady)="onGridReady($event)"
                                 (gridSizeChanged)="onGridSizeChanged($event)"
                                 [rowDeselection]="true"
                                 [enableSorting]="true"
                                 [rowSelection]="'single'"
                                 (rowSelected)="this.onRowSelected($event)"
                                 [singleClickEdit]="true"
                                 [stopEditingWhenGridLosesFocus]="true">
                </ag-grid-angular>

            </div>



        </div>
    `,
    styles:[`
        .padded-checkbox{
            padding-top: 1.25rem;
        }
    `]
})

export class EpExperimentTypeIlluminaTabComponent implements OnInit, OnDestroy{
    public formGroup:FormGroup;
    public showInactive = false;
    private expPlatformSubscription: Subscription;
    private expPlatfromNode:any;
    private gridApi: GridApi;
    private unrefinedApps: any[] = [];
    public appList:any[] = [];
    public selectedApp:any[]=[];
    private selectedAppIndex:number = -1;
    private nextAppNumb:number=0;

    public rowData:any[]= [];
    private  _appThemeCol:any[];
    private _seqTypeRunList:any[];
    get appThemeCol():any[]{
        if(!this._appThemeCol){
            this._appThemeCol = this.dictionaryService.getEntries(DictionaryService.APPLICATION_THEME);
        }
        return this._appThemeCol;
    };
    get seqTypeRunList():any[]{
        if(!this._seqTypeRunList) {
            this._seqTypeRunList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.SEQ_RUN_TYPE);
        }
        return this._seqTypeRunList;
    }


    private parseSortOrder(params){
        if(Number.isNaN(Number.parseInt(params.newValue))){
            return '';
        }
        let newVal:number = +params.newValue;
        if(newVal < 0 || newVal > 99){
            return '';
        }
        return params.newValue;
    }



    public columnDefs: any[] = [
        {
            headerName: "Active",
            field: "isSelected",
            cellRendererFramework: CheckboxRenderer,
            checkboxEditable: true,
            editable: false,
            width: 100
        },
        {
            headerName: "Sort Order",
            field: "sortOrder",
            valueParser: this.parseSortOrder,
            editable:true,
            width: 100
        },
        {
            headerName: "Sequencing Experiment Type Theme",
            field: "idApplicationTheme",
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: SelectEditor,
            selectOptions: this.appThemeCol,
            selectOptionsDisplayField: "display",
            selectOptionsValueField: "value",
            editable:true,
            width: 250
        },
        {
            headerName: "Sequencing Experiment Type",
            field: "display",
            editable:true,
            width: 300
        }


    ];

    private compareApplications(obj1:any, obj2:any) {
        if (obj1 == null && obj2 == null) {
            return 0;
        } else if (obj1 == null) {
            return 1;
        } else if (obj2 == null) {
            return -1;
        } else {
            let ts1:number = +obj1.applicationThemeSortOrder;
            let ts2:number = +obj2.applicationThemeSortOrder;
            if (ts1 < ts2) {
                return -1;
            } else if (ts1 > ts2) {
                return 1;
            } else {
                var t1:string = obj1.applicationThemeDisplay;
                var t2:string = obj2.applicationThemeDisplay;
                if (t1 < t2) {
                    return -1;
                } else if (t1 > t2) {
                    return 1;
                } else {
                    let s1:number = +obj1.sortOrder;
                    let s2:number = +obj2.sortOrder;
                    if (s1 < s2) {
                        return -1;
                    } else if (s1 > s2) {
                        return 1;
                    } else {
                        let n1:string = obj1.display;
                        let n2:string = obj2.display;
                        if (n1 < n2) {
                            return -1;
                        } else if (n1 > n2) {
                            return 1;
                        } else {
                            return 0;
                        }
                    }
                }
            }
        }
    }






    constructor(private fb: FormBuilder,
                private expPlatfromService: ExperimentPlatformService,
                public constService: ConstantsService,
                private dictionaryService: DictionaryService,
                private dialogService: DialogsService,
                private gnomexService: GnomexService) {
    }

    ngOnInit(){
        this.formGroup = this.fb.group(
            {
                applications:[]
            });
    }


    onRowSelected(event){
        if(event.node.selected){
            this.selectedAppIndex = event.rowIndex;
            this.gridApi.selectIndex(this.selectedAppIndex, false, null);
        }
        this.selectedApp = this.gridApi.getSelectedRows();
    }

    externallyResizeGrid(){
        this.gridApi.sizeColumnsToFit();
    }

    onGridReady(params:any){
        this.gridApi= params.api;
        //if hiseq, extra column is added for it
        this.expPlatformSubscription = this.expPlatfromService.getExperimentPlatformObservable().subscribe(data =>{
            if(data && data.applications ){
                this.nextAppNumb = 0;
                this.expPlatfromNode = data;
                this.unrefinedApps = (Array.isArray(data.applications) ? data.applications : [data.applications.ApplicationTheme]);
                this.appList = this.flattenApplication(this.unrefinedApps).filter(app => app.isActive === "Y").sort(this.compareApplications); //FIXME: This needs to be fixed if it's required to show the apps that are not active in database.
                this.showInactive = false;
                this.filterAppOptions();
                this.selectedApp = [];
                let sampleBatch = { headerName: "Samples Per Batch", field: "samplesPerBatch", editable:true, width: 200};
                if(this.expPlatfromService.isNanoString) {
                    this.columnDefs.push(sampleBatch);
                }

            }

            this.gridApi.setColumnDefs(this.columnDefs);
            this.gridApi.setRowData(this.rowData);
            this.formGroup.get('applications').setValue(this.appList);
            this.formGroup.markAsPristine();

        });

    }
    onGridSizeChanged(event){
        if(this.gridApi){
            this.gridApi.sizeColumnsToFit();
        }
    }
    onCellValueChanged(event:CellValueChangedEvent):void {
        if(event.oldValue !== event.newValue){
            this.formGroup.markAsDirty();
            if(event.column.getColId() === "sortOrder"){
                this.rowData.sort(this.compareApplications);
                this.gridApi.setRowData(this.rowData);
            }
            if(event.column.getColId() === "display"){
                this.selectedApp[0].application = this.selectedApp[0].display
            }
        }

    }

    filterAppOptions(event?: any) {
        // This is to filter the data that is executive(selected), but not to filter the data that is active in database.
        if(this.showInactive) {
            this.rowData = this.appList;
        } else {
            this.rowData = this.appList.filter(app => app.isSelected === "Y");
        }
    }

    private applyLibPrepFn = (libPrepDialogForm:FormGroup)=> {
        if(libPrepDialogForm.dirty){
            let app = this.selectedApp[0];
            app.application =  libPrepDialogForm.get('application').value;
            app.display =  libPrepDialogForm.get('application').value;
            app.sortOrder =  libPrepDialogForm.get('sortOrder').value;
            app.idApplicationTheme =  libPrepDialogForm.get('idApplicationTheme').value;
            app.idBarcodeSchemeA =  libPrepDialogForm.get('idBarcodeSchemeA').value;
            app.idBarcodeSchemeB =  libPrepDialogForm.get('idBarcodeSchemeB').value;
            app.onlyForLabPrepped =  libPrepDialogForm.get('onlyForLabPrepped').value;
            app.unitPriceInternal =  libPrepDialogForm.get('unitPriceInternal').value;
            app.unitPriceExternalAcademic =  libPrepDialogForm.get('unitPriceExternalAcademic').value;
            app.unitPriceExternalCommercial =  libPrepDialogForm.get('unitPriceExternalCommercial').value;
            app.hasCaptureLibDesign =  libPrepDialogForm.get('hasCaptureLibDesign').value ? "Y" : "N";
            app.idSeqLibProtocols =  libPrepDialogForm.get('idSeqLibProtocols').value;
            app.coreSteps =  libPrepDialogForm.get('coreSteps').value;
            app.coreStepsNoLibPrep =  libPrepDialogForm.get('coreStepsNoLibPrep').value;

            Object.keys(libPrepDialogForm.controls).forEach(key =>{
                let reqCategoryAppList: any[] = [];
                if(app.RequestCategoryApplication){
                    // saving back to app incase  only one object is returned and breaks pointer to parent by reassign to new array
                    reqCategoryAppList =  Array.isArray(app.RequestCategoryApplication) ? app.RequestCategoryApplication : [app.RequestCategoryApplication];
                    app.RequestCategoryApplication = reqCategoryAppList;

                    let rca = reqCategoryAppList.find(reqCatApp => reqCatApp.value === key );
                    if(rca){
                        rca.isSelected = libPrepDialogForm.controls[key].value ? 'Y' : 'N';
                    }
                }
            });
            this.filterAppOptions();
            this.gridApi.setRowData(this.rowData);
            this.formGroup.markAsDirty();
        }
    };

    openLibPrepEditor(){
        if(this.selectedApp.length > 0){
            let config: MatDialogConfig = new MatDialogConfig();
            config.data = {
                rowData: this.selectedApp[0],
                applyFn: this.applyLibPrepFn,
                appThemeList: this.appThemeCol,
                expPlatformNode: this.expPlatfromNode
            };

            this.dialogService.genericDialogContainer(LibraryPrepDialogComponent, "Edit Library Prep", null, config,
                {actions: [
                        {type: ActionType.PRIMARY, name: "Apply", internalAction: "applyLibPrepChanges"},
                        {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                    ]});

        }
    }

    addApplication(){
        let rcAppList:any[] = [];
        this.nextAppNumb++;
        let newApp = {
            isSelected: "Y",
            codeApplication: 'Application'+ this.nextAppNumb,
            display:'enter experiment type here...',
            idSeqLibProtocols:'',
            idLabelingProtocolDefault:'',
            idHybProtocolDefault:'',
            idScanProtocolDefault:'',
            idFeatureExtractionProtocolDefault: '',
            isActive:'Y',
            canUpdate:'Y',
            RequestCategoryApplication: []
        };

        let rcList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.REQUEST_CATEGORY);
        for(let rc of rcList ){
            let rcType = this.gnomexService.requestCategoryTypeMap.get(rc.type);
            if(this.expPlatfromNode.idCoreFacility === rc.idCoreFacility){
                if((this.expPlatfromService.isIllumina && rcType.isIllumina === 'Y')
                    || (!this.expPlatfromService.isIllumina && rc.codeRequestCategory === this.expPlatfromNode.codeRequestCategory )){
                    let rcApp = Object.assign({}, rc);
                    rcApp.isSelected = rcApp.isActive;
                    rcAppList.push(rcApp);
                }
            }
        }
        newApp.RequestCategoryApplication = rcAppList;
        this.appList.splice(0, 0, newApp);
        this.filterAppOptions();
        this.gridApi.setRowData(this.rowData);
        this.formGroup.markAsDirty();
        this.gridApi.forEachNode(node => node.rowIndex ? 0 : node.setSelected(true, true));
        this.selectedApp = [newApp];
        this.openLibPrepEditor();

    }

    removeApplication(){
        let app = this.selectedApp[0];
        this.dialogService.confirm("Are you sure you want to remove experiment type "
            + app.display + "?", "Warning").subscribe(result =>{
            if(result){
                let i:number = this.appList.indexOf(app);
                if(i > -1 ){
                    this.appList.splice(i, 1);
                    this.filterAppOptions();
                    this.gridApi.setRowData(this.rowData);
                    this.formGroup.markAsDirty();
                }

            }
        });

    }

    flattenApplication(appThemes: any[]): any[]{
        let flatApps:any[] =[];
        appThemes.forEach(appObj => {
            if(appObj.Application){
                let app = Array.isArray(appObj.Application) ? appObj.Application : [appObj.Application];
                app.forEach(a => {
                    flatApps.push(a);
                });
            }
        });
        return flatApps;
    }

    ngOnDestroy(){
        this.expPlatformSubscription.unsubscribe();
    }


}
