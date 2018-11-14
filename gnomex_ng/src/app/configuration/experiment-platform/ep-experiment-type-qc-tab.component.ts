import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {ExperimentPlatformService} from "../../services/experiment-platform.service";
import {Subscription} from "rxjs";
import {CellValueChangedEvent, GridApi} from "ag-grid-community";
import {CheckboxRenderer} from "../../util/grid-renderers/checkbox.renderer";
import {ConstantsService} from "../../services/constants.service";
import {DictionaryService} from "../../services/dictionary.service";
import {MatDialog, MatDialogConfig} from "@angular/material";
import {DialogsService} from "../../util/popup/dialogs.service";
import {GnomexService} from "../../services/gnomex.service";
import {QcAssayDialogComponent} from "./qc-assay-dialog.component";

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
                        (click)="openQCEditor()"
                        [disabled]="selectedApp.length === 0"
                        type="button"> Edit QC Assay </button>

            </div>
            <div style="flex:9" class="full-width">
                <ag-grid-angular class="full-height full-width ag-theme-balham"
                                 [columnDefs]="columnDefs"
                                 (cellValueChanged)="onCellValueChanged($event)"
                                 [enableColResize]="true"
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

export class EpExperimentTypeQcTabComponent implements OnInit, OnDestroy{
    public formGroup:FormGroup;
    private expPlatformSubscription: Subscription;
    private expPlatfromNode:any;
    private gridApi: GridApi;
    public selectedApp:any[]=[];
    private nextAppNumb:number=0;

    public rowData:any[]= [];


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
            width: 75
        },
        {
            headerName: "Sort Order",
            field: "sortOrder",
            valueParser: this.parseSortOrder,
            editable:true,
            width: 100
        },
        {
            headerName: "Experiment Type",
            field: "display",
            editable:true,
            width: 250
        },
        {
            headerName: "Has Assays",
            field: "hasChipTypes",
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




    constructor(private fb:FormBuilder,private expPlatfromService:ExperimentPlatformService,
                public constService:ConstantsService,private dictionaryService:DictionaryService,
                private dialog: MatDialog,private dialogService:DialogsService,
                private gnomexService:GnomexService){
    }

    ngOnInit(){
        this.formGroup = this.fb.group(
            {
                applications:[]
            });
    }


    onRowSelected(event){
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
                this.rowData = allApps.filter(app => app.isActive === 'Y').sort(this.compareApplications);
                this.selectedApp = [];
            }

            this.gridApi.setColumnDefs(this.columnDefs);
            this.gridApi.setRowData(this.rowData);
            this.formGroup.get('applications').setValue(this.rowData);
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
                this.gridApi.setRowData(this.rowData);
            }
            if(event.column.getColId() === "display"){
                this.selectedApp[0].application = this.selectedApp[0].display
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
            this.rowData.sort(this.compareApplications);
            this.gridApi.setRowData(this.rowData);
        }

    };

    openQCEditor(){
        let config: MatDialogConfig = new MatDialogConfig();
        if(this.selectedApp.length > 0){
            config.data = {
                rowData: this.selectedApp[0],
                applyFn: this.applyQCAssayFn,
                expPlatform: this.expPlatfromNode
            };
            config.height="30em";
            config.width="50em";
            config.panelClass = "no-padding-dialog";
            this.dialog.open(QcAssayDialogComponent,config);
        }
    }
    addApplication(){
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
            hasChipTypes:'Y',
            canUpdate:'Y',
            ChipTypes:[]
        };

        this.rowData.splice(0,0,newApp);
        this.gridApi.setRowData(this.rowData);
        this.selectedApp = [newApp];
        this.openQCEditor();

    }
    removeApplication(){
        let app = this.selectedApp[0];
        this.dialogService.confirm("Warn","Are you sure you want to remove experiment type \'"
            + app.display + "\'?" ).subscribe(result =>{
            if(result){
                let i:number = this.rowData.indexOf(app);
                if(i > -1 ){
                    this.rowData.splice(i,1);
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
