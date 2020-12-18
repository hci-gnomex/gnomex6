import {Component, OnDestroy, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ExperimentPlatformService} from "../../services/experiment-platform.service";
import {Subscription} from "rxjs";
import {CellValueChangedEvent, GridApi, NumberFilter} from "ag-grid-community";
import {CheckboxRenderer} from "../../util/grid-renderers/checkbox.renderer";
import {ConstantsService} from "../../services/constants.service";
import {DictionaryService} from "../../services/dictionary.service";
import {MatDialogConfig} from "@angular/material";
import {DialogsService} from "../../util/popup/dialogs.service";
import {QcAssayDialogComponent} from "./qc-assay-dialog.component";
import {ActionType} from "../../util/interfaces/generic-dialog-action.model";
import {TextAlignLeftMiddleRenderer} from "../../util/grid-renderers/text-align-left-middle.renderer";
import {TextAlignLeftMiddleEditor} from "../../util/grid-editors/text-align-left-middle.editor";

@Component({
    template: `
        <div class="full-height full-width flex-container-col">
            <div class="flex-grow flex-container-row align-center justify-space-between">
                <div>
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
                    <button mat-button style="margin-left: 3em;"
                            color="primary"
                            (click)="openQCEditor()"
                            [disabled]="selectedApp.length === 0"
                            type="button">
                        <img [src]="this.constService.ICON_TAG_BLUE_EDIT"> Edit QC Assay </button>
                    <mat-checkbox style="margin-left: 3em;" (change)="filterAppOptions($event)" [(ngModel)]="showInactive"> Show Inactive </mat-checkbox>
                </div>
                <div>
                    <button mat-button [hidden]="!this.isAnyFilterPresent" (click)="clearFilterModel()">Clear Filter</button>
                </div>

            </div>
            <label style="padding: 0.5em;"> * Gird data is sortable and filterable. To sort, click the column header(sortable for asc/desc/default). To filter or search, hover the column header right side and click the filter icon.</label>
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
                                 [enableFilter]="true"
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

export class EpExperimentTypeQcTabComponent implements OnInit, OnDestroy{
    public formGroup:FormGroup;
    public showInactive = false;
    private expPlatformSubscription: Subscription;
    private expPlatfromNode:any;
    private gridApi: GridApi;
    public selectedApp:any[]=[];
    private nextAppNumb:number=0;

    public rowData:any[]= [];
    private refinedAllApps: any[] = [];

    get isAnyFilterPresent(): boolean {
        return this.gridApi ? this.gridApi.isAnyFilterPresent() : false;
    }

    clearFilterModel(): void {
        if(this.gridApi && this.gridApi.isAnyFilterPresent()) {
            this.gridApi.setFilterModel(null);
            this.gridApi.setSortModel(null);
        }
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
            suppressFilter: true,
            editable: false,
            width: 75
        },
        {
            headerName: "Sort Order",
            field: "sortOrder",
            filter: NumberFilter,
            filterValueGetter: this.expPlatfromService.gridNumberFilterValueGetter,
            filterParams: {clearButton: true},
            valueParser: this.parseSortOrder,
            comparator: this.expPlatfromService.gridNumberComparator,
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellEditorFramework: TextAlignLeftMiddleEditor,
            validators: [Validators.pattern(/^\d{0,2}$/)],
            errorNameErrorMessageMap: [
                {errorName: "pattern", errorMessage: "Expects a number of 0-99"},
            ],
            editable:true,
            width: 100
        },
        {
            headerName: "Experiment Type",
            field: "display",
            filterParams: {clearButton: true},
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellEditorFramework: TextAlignLeftMiddleEditor,
            validators: [Validators.required, Validators.maxLength(100)],
            errorNameErrorMessageMap: [
                {errorName: "required", errorMessage: "Experiment Type required"},
                {errorName: "maxlength", errorMessage: "Maximum of 100 characters"}
            ],
            editable:true,
            width: 250
        },
        {
            headerName: "Has Assays",
            field: "hasChipTypes",
            suppressFilter: true,
            cellRendererFramework: CheckboxRenderer,
            checkboxEditable: true,
            editable:false,
            width: 75
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




    constructor(private fb: FormBuilder,
                private expPlatfromService: ExperimentPlatformService,
                public constService: ConstantsService,
                private dictionaryService: DictionaryService,
                private dialogService: DialogsService) {
    }

    ngOnInit(){
        this.formGroup = this.fb.group(
            {
                applications:[]
            });
    }


    onRowSelected(event){
        if(event.node.selected) {
            this.gridApi.selectIndex(event.rowIndex, false, null);
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
                let allApps = (Array.isArray(data.applications) ? data.applications : [data.applications.ApplicationTheme]);
                this.refinedAllApps = this.formatChipsForApps(allApps).filter(app => app.isActive === "Y").sort(this.compareApplications);
                this.showInactive = false;
                this.filterAppOptions();
                this.selectedApp = [];
            }

            this.gridApi.setColumnDefs(this.columnDefs);
            this.gridApi.setRowData(this.rowData);
            this.formGroup.get('applications').setValue(this.refinedAllApps);
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
            if(event.column.getColId() === "sortOrder" && !Number.isNaN(+event.newValue)){
                this.gridApi.setSortModel(null);
                this.gridApi.clearFocusedCell();
                this.rowData.sort(this.compareApplications);
                this.gridApi.setRowData(this.rowData);
                let rowIndex  = "" + this.rowData.indexOf(event.data);
                this.gridApi.getRowNode(rowIndex).setSelected(true);
            }
            if(event.column.getColId() === "display"){
                this.selectedApp[0].application = this.selectedApp[0].display;
            }
        }

    }

    formatChipsForApps(apps:any[]): any[]{
        for(let app of apps){
            if(app.ChipTypes){
                app.ChipTypes = Array.isArray(app.ChipTypes) ? app.ChipTypes : [app.ChipTypes.BioanalyzerChipType]
            }
        }
        return apps;
    }

    filterAppOptions(event?: any) {
        if(this.gridApi && this.gridApi.getSortModel() && this.gridApi.getSortModel().length > 0) {
            this.gridApi.setSortModel(null);
        }

        if(this.showInactive) {
            this.rowData = this.refinedAllApps.sort(this.compareApplications);
        } else {
            this.rowData = this.refinedAllApps.filter(app => app.isSelected === "Y").sort(this.compareApplications);
        }

        if(event && this.selectedApp.length > 0) {
            this.gridApi.setRowData(this.rowData);
            this.gridApi.clearFocusedCell();
            let rowIndex  = this.rowData.indexOf(this.selectedApp[0]);
            if(rowIndex >= 0) {
                this.gridApi.getRowNode("" + rowIndex).setSelected(true);
            } else {
                this.gridApi.deselectAll();
                this.selectedApp = [];
            }
        }
    }


    private applyQCAssayFn = (qcDialogForm:FormGroup,committedChipTypes:any[])=> {
        if(qcDialogForm.dirty){
            if(committedChipTypes){
                this.selectedApp[0].ChipTypes = committedChipTypes;
                if(qcDialogForm.get('hasChipTypes').value && committedChipTypes.length > 0){
                    this.selectedApp[0].hasChipTypes = 'Y';
                }else{
                    this.selectedApp[0].hasChipTypes = 'N';
                }
            }
            this.selectedApp[0].isActive = 'Y';
            this.selectedApp[0].application = qcDialogForm.get('application').value;
            this.selectedApp[0].display = qcDialogForm.get('application').value;
            this.selectedApp[0].sortOrder = qcDialogForm.get('sortOrder').value;
            if(this.expPlatfromNode.canEnterPrices === 'Y' && this.selectedApp[0].hasChipTypes != 'Y'){
                this.selectedApp[0].unitPriceInternal = qcDialogForm.get('unitPriceInternal').value;
                this.selectedApp[0].unitPriceExternalAcademic = qcDialogForm.get('unitPriceExternalAcademic').value;
                this.selectedApp[0].unitPriceExternalCommercial = qcDialogForm.get('unitPriceExternalCommercial').value;

            }
            this.formGroup.markAsDirty();
            this.gridApi.setRowData(this.rowData.sort(this.compareApplications));
            this.gridApi.clearFocusedCell();
            this.gridApi.setSortModel(null);
            let rowIndex  = "" + this.rowData.indexOf(this.selectedApp[0]);
            this.gridApi.getRowNode(rowIndex).setSelected(true);
        }

    };

    openQCEditor() {
        if(this.selectedApp.length > 0) {
            let config: MatDialogConfig = new MatDialogConfig();
            config.data = {
                rowData: this.selectedApp[0],
                applyFn: this.applyQCAssayFn,
                expPlatform: this.expPlatfromNode
            };
            config.height = "30em";
            config.width = "52em";

            this.dialogService.genericDialogContainer(QcAssayDialogComponent, "Edit QC Assay", null, config,
                {actions: [
                        {type: ActionType.PRIMARY, name: "Apply", internalAction: "applyChanges"},
                        {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                    ]});
        }
    }

    addApplication(){
        this.nextAppNumb++;
        let newApp = {
            isSelected: "Y",
            codeApplication: 'Application'+ this.nextAppNumb,
            display:'',
            idSeqLibProtocols:'',
            idLabelingProtocolDefault:'',
            idHybProtocolDefault:'',
            idScanProtocolDefault:'',
            idFeatureExtractionProtocolDefault: '',
            isActive:'Y',
            hasChipTypes:'Y',
            canUpdate:'Y',
            ChipTypes:[]
        };

        this.refinedAllApps.splice(0, 0, newApp);
        this.filterAppOptions();
        this.gridApi.setRowData(this.rowData);
        this.gridApi.clearFocusedCell();
        this.gridApi.forEachNode(node => node.rowIndex ? 0 : node.setSelected(true, true, true));
        this.selectedApp = [newApp];
        this.openQCEditor();

    }

    removeApplication(){
        let app = this.selectedApp[0];
        this.dialogService.confirm("Are you sure you want to remove experiment type \'"
            + app.display + "\'?", "Warning").subscribe(result =>{
            if(result){
                let i:number = this.refinedAllApps.indexOf(app);
                if(i > -1 ){
                    this.refinedAllApps.splice(i, 1);
                    this.filterAppOptions();
                    this.gridApi.setRowData(this.rowData);
                    this.formGroup.markAsDirty();
                    this.selectedApp = [];
                }

            }
        });

    }

    ngOnDestroy(){
        this.expPlatformSubscription.unsubscribe();
    }

}
