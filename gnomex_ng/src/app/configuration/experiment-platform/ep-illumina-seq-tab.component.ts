import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {ExperimentPlatformService} from "../../services/experiment-platform.service";
import {Subscription} from "rxjs";
import {CellValueChangedEvent, GridApi} from "ag-grid";
import {CheckboxRenderer} from "../../util/grid-renderers/checkbox.renderer";
import {SelectEditor} from "../../util/grid-editors/select.editor";
import {ConstantsService} from "../../services/constants.service";
import {SelectRenderer} from "../../util/grid-renderers/select.renderer";
import {DictionaryService} from "../../services/dictionary.service";
import {MatDialog, MatDialogConfig} from "@angular/material";
import {SampleTypeDetailDialogComponent} from "./sample-type-detail-dialog.component";
import {IlluminaSeqDialogComponent} from "./illumina-seq-dialog.component";
import {DialogsService} from "../../util/popup/dialogs.service";

//assets/page_add.png

@Component({
    template: `
        <div class="full-height full-width flex-container-col">
            <div class="flex-grow flex-container-row" style="align-items:center;"  >
                <button mat-button color="primary"
                        type="button"
                        (click)="addSampleType()">
                    <img [src]="this.constService.ICON_ADD"> Add
                </button>
                <button [disabled]="selectedSeqOpt.length === 0"
                        (click)="removeSeqOption()"
                        mat-button color="primary"
                        type="button">
                    <img [src]="this.constService.ICON_DELETE"> Remove
                </button>
                <button mat-button
                        color="primary"
                        (click)="openSeqEditor()"
                        [disabled]="selectedSeqOpt.length === 0"
                        type="button"> Edit Sequencing Options </button>

                <mat-checkbox (change)="filterSeqOptions($event)" [(ngModel)]="showInactive"> Show Inactive </mat-checkbox>

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
                                 (rowSelected)="this.onSeqOptionsRowSelected($event)"
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

export class EpIlluminaSeqTabComponent implements OnInit, OnDestroy{
    public formGroup:FormGroup;
    private expPlatform1Subscription: Subscription;
    private expPlatform2Subscription: Subscription;
    private expPlatfromNode:any;
    private gridApi: GridApi;
    public seqOptionsList:any[] = [];
    public showInactive = false;
    public selectedSeqOpt:any[]=[];
    private selectedSeqOptIndex:number = -1;

    public rowData:any[]= [];
    private  _runOptions:any[] = [{value:'Y',display:"Rapid Run Mode"},{value:'N',display:"High Output Run Mode"}];


    private  _seqCycleList:any[];
    private _seqTypeRunList:any[];
    get seqCycleList():any[]{
        if(!this._seqCycleList){
            this._seqCycleList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.NUMBER_SEQUENCING_CYCLES);
        }
        return this._seqCycleList;
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


    private readonly runModeColumn = {
        headerName: "Run Mode",
        field: "isCustom",
        cellRendererFramework: SelectRenderer,
        cellEditorFramework: SelectEditor,
        selectOptions: this._runOptions,
        selectOptionsDisplayField: "display",
        selectOptionsValueField: "value",

        editable:true,
        width: 200
    };



    public columnDefs: any[] = [
        {
            headerName: "Active",
            field: "isActive",
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
            headerName: "Name",
            field: "name",
            editable:true,
            width: 250
        },
        {
            headerName: "Cycles",
            field: "idNumberSequencingCycles",
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: SelectEditor,
            selectOptions: this.seqCycleList,
            selectOptionsDisplayField: "display",
            selectOptionsValueField: "value",
            editable:true,
            width: 200
        },
        {
            headerName: "Type",
            field: "idSeqRunType",
            cellRendererFramework: SelectRenderer,
            cellEditorFramework: SelectEditor,
            selectOptions: this.seqTypeRunList,
            selectOptionsDisplayField: "display",
            selectOptionsValueField: "value",
            editable:true,
            width: 200
        }

    ];

    private sortSeqOptions(obj1:any, obj2:any) {
        if (obj1 == null && obj2 == null) {
            return 0;
        } else if (obj1 == null) {
            return 1;
        } else if (obj2 == null) {
            return -1;
        } else {
            let a1:string = obj1.isCustom;
            let a2:string = obj2.isCustom;
            if (a1 < a2) {
                return -1;
            } else if (a1 > a2) {
                return 1;
            } else {
                let s1:number = +obj1.sortOrder;
                let s2:number = +obj2.sortOrder;
                if (s1 < s2) {
                    return -1;
                } else if (s1 > s2) {
                    return 1;
                } else {
                    let n1:string = obj1.name;
                    let n2:string = obj2.name;
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






    constructor(private fb:FormBuilder,private expPlatfromService:ExperimentPlatformService,
                public constService:ConstantsService,private dictionaryService:DictionaryService,
                private dialog: MatDialog,private dialogService:DialogsService){
    }

    ngOnInit(){
        this.formGroup = this.fb.group({seqOptions:[]});
        this.expPlatform1Subscription = this.expPlatfromService.getExperimentPlatformObservable()
            .subscribe(data =>{
                if(data &&( data.sequencingOptions || data.NumberSequencingCycles) ){
                    this.expPlatfromNode = data;
                    this.seqOptionsList = Array.isArray(data.sequencingOptions) ? data.sequencingOptions : [data.NumberSequencingCycles];
                    this.showInactive = false;
                    this.selectedSeqOpt = [];

                }
            });

    }

    filterSeqOptions(event){
        if(this.showInactive){
            this.rowData = this.seqOptionsList.sort(this.sortSeqOptions);
            this.gridApi.setRowData(this.rowData);
        }else{
            let activeSeqOptList = this.seqOptionsList.filter(seqOpt => seqOpt.isActive === 'Y' );
            this.rowData = activeSeqOptList.sort(this.sortSeqOptions);
            this.gridApi.setRowData(this.rowData);
        }
    }


    onSeqOptionsRowSelected(event){
        if(event.node.selected){
            this.selectedSeqOptIndex = event.rowIndex;
        }
        this.selectedSeqOpt = this.gridApi.getSelectedRows();
    }

    onGridReady(params:any){
        this.gridApi= params.api;
        //if hiseq, extra column is added for it
        this.expPlatform2Subscription = this.expPlatfromService.getExperimentPlatformObservable().subscribe(data =>{
            let tempColDefs:any[] =[];
            this.filterSeqOptions(null);
            if(this.expPlatfromService.isHiSeq){
                tempColDefs = this.columnDefs.slice();
                tempColDefs.splice(1,0, this.runModeColumn);
                this.gridApi.setColumnDefs(tempColDefs);
            }else {
                this.gridApi.setColumnDefs(this.columnDefs);
            }
            this.gridApi.sizeColumnsToFit();
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
                this.rowData.sort(this.sortSeqOptions);
                this.gridApi.setRowData(this.rowData);
            }
        }

    }

    private applySeqOptionsFn = (dialogFormGroup:FormGroup)=> {
        let seqOpt = this.selectedSeqOpt[0];

        if(dialogFormGroup.dirty){
            seqOpt.name = dialogFormGroup.get('name').value;
            seqOpt.isActive = dialogFormGroup.get('isActive').value ? 'Y': 'N';
            seqOpt.sortOrder= dialogFormGroup.get('sortOrder').value;
            seqOpt.idNumberSequencingCycles = dialogFormGroup.get('idNumberSequencingCycles').value;
            seqOpt.idSeqRunType = dialogFormGroup.get('idSeqRunType').value;
            seqOpt.protocolDescription = dialogFormGroup.get('protocolDescription').value;
            seqOpt.unitPriceInternal = dialogFormGroup.get('unitPriceInternal').value;
            seqOpt.unitPriceExternalAcademic = dialogFormGroup.get('unitPriceExternalAcademic').value;
            seqOpt.unitPriceExternalCommercial = dialogFormGroup.get('unitPriceExternalCommercial').value;
            this.filterSeqOptions(null);
            this.formGroup.markAsDirty();
        }

    };
    openSeqEditor(){
        let config: MatDialogConfig = new MatDialogConfig();
        if(this.selectedSeqOpt.length > 0){
            config.data = {
                rowData: this.selectedSeqOpt[0],
                applyFn: this.applySeqOptionsFn,
                runOptions: this.expPlatfromService.isHiSeq ? this._runOptions :  [],
                cycleList: this.seqCycleList,
                seqTypeRunList: this.seqTypeRunList
            };
            config.panelClass = "no-padding-dialog";
            this.dialog.open(IlluminaSeqDialogComponent,config);

        }



    }
    addProtocol(){
        let newSeqOpt = {
            idNumberSequencingCyclesAllowed: "NumberSequencingCyclesAllowed",
            codeRequestCategory: this.expPlatfromNode.codeRequestCategory,
            idNumberSequencingCycles:'',
            idSeqRunType:'',
            isCustom:'N',
            name:'',
            isActive:'Y',
            sortOrder:'0',
        };
        this.seqOptionsList.push(newSeqOpt);
        this.openSeqEditor()

    }
    removeSeqOption(){
        let seqOpt = this.selectedSeqOpt[0];
        this.dialogService.confirm("Remove Illumina Seq Option","Are you sure you want to remove the sequencing option named "
            + seqOpt.name + "?" ).subscribe(result =>{
            if(result){
                let i:number = this.seqOptionsList.indexOf(seqOpt);
                this.seqOptionsList.splice(i,1);
                this.filterSeqOptions(null);
                this.formGroup.markAsDirty();
                this.selectedSeqOpt = [];
            }
        });

    }




    ngOnDestroy(){
        this.expPlatform1Subscription.unsubscribe();
        this.expPlatform2Subscription.unsubscribe();
    }


}
