import {Component, OnDestroy, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ExperimentPlatformService} from "../../services/experiment-platform.service";
import {Subscription} from "rxjs";
import {CellValueChangedEvent, GridApi} from "ag-grid-community";
import {CheckboxRenderer} from "../../util/grid-renderers/checkbox.renderer";
import {SelectEditor} from "../../util/grid-editors/select.editor";
import {ConstantsService} from "../../services/constants.service";
import {SelectRenderer} from "../../util/grid-renderers/select.renderer";
import {DictionaryService} from "../../services/dictionary.service";
import {MatDialogConfig} from "@angular/material";
import {IlluminaSeqDialogComponent} from "./illumina-seq-dialog.component";
import {DialogsService} from "../../util/popup/dialogs.service";
import {ActionType} from "../../util/interfaces/generic-dialog-action.model";
import {TextAlignLeftMiddleRenderer} from "../../util/grid-renderers/text-align-left-middle.renderer";
import {TextAlignLeftMiddleEditor} from "../../util/grid-editors/text-align-left-middle.editor";

//assets/page_add.png

@Component({
    template: `
        <div class="full-height full-width flex-container-col">
            <div class="flex-grow flex-container-row" style="align-items:center;"  >
                <button mat-button color="primary"
                        type="button"
                        (click)="addSeqOption()">
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
        validators: [Validators.required],
        errorNameErrorMessageMap: [{errorName: "required", errorMessage: "Run Mode required"}],
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
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellEditorFramework: TextAlignLeftMiddleEditor,
            validators: [Validators.min(0), Validators.max(99), Validators.pattern(/^\d{0,2}$/)],
            errorNameErrorMessageMap: [{errorName: "numberRange", errorMessage: "Requires a number of 0-99"}],
            editable:true,
            width: 100
        },
        {
            headerName: "Name",
            field: "name",
            cellRendererFramework: TextAlignLeftMiddleRenderer,
            cellEditorFramework: TextAlignLeftMiddleEditor,
            validators: [Validators.required, Validators.maxLength(this.constService.MAX_LENGTH_100)],
            errorNameErrorMessageMap: [
                { errorName: 'required', errorMessage: 'Name required' },
                { errorName: 'maxlength',  errorMessage: "Maximum of " + this.constService.MAX_LENGTH_100 + " characters"}
            ],
            editable: true,
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
            validators: [Validators.required],
            errorNameErrorMessageMap: [{errorName: "required", errorMessage: "Cycles required"}],
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
            validators: [Validators.required],
            errorNameErrorMessageMap: [{errorName: "required", errorMessage: "Type required"}],
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






    constructor(private fb: FormBuilder,
                private expPlatfromService: ExperimentPlatformService,
                public constService: ConstantsService,
                private dictionaryService: DictionaryService,
                private dialogService: DialogsService) {
    }

    ngOnInit(){
        this.formGroup = this.fb.group({sequencingOptions:[]});
        this.expPlatform1Subscription = this.expPlatfromService.getExperimentPlatformObservable()
            .subscribe(data =>{
                if(data && data.sequencingOptions ){
                    this.expPlatfromNode = data;
                    this.seqOptionsList = Array.isArray(data.sequencingOptions) ? data.sequencingOptions :
                        [data.sequencingOptions.NumberSequencingCyclesAllowed];
                    this.seqOptionsList.sort(this.sortSeqOptions);
                    this.showInactive = false;
                    this.selectedSeqOpt = [];
                    this.formGroup.get('sequencingOptions').setValue(this.seqOptionsList);
                    this.formGroup.markAsPristine();

                }
            });

    }

    filterSeqOptions(event?: any){
        if(event) {
            this.selectedSeqOpt = [];
            this.gridApi.clearFocusedCell();
        }

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
            this.gridApi.selectIndex(this.selectedSeqOptIndex, false, null);
        }
        this.selectedSeqOpt = this.gridApi.getSelectedRows();
    }

    onGridReady(params:any){
        this.gridApi= params.api;
        //if hiseq, extra column is added for it
        this.expPlatform2Subscription = this.expPlatfromService.getExperimentPlatformObservable().subscribe(data =>{
            let tempColDefs:any[] =[];
            this.filterSeqOptions();
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
                let rowIndex  = "" + this.rowData.indexOf(event.data);
                this.gridApi.getRowNode(rowIndex).setSelected(true);
                this.gridApi.setFocusedCell(this.gridApi.getRowNode(rowIndex).rowIndex, "sortOrder");
            }
        }

    }

    private applySeqOptionsFn = (dialogFormGroup:FormGroup)=> {
        let seqOpt = this.selectedSeqOpt[0];

        if(dialogFormGroup.dirty){
            seqOpt.name = dialogFormGroup.get('name').value;
            seqOpt.isActive = dialogFormGroup.get('isActive').value ? 'Y': 'N';
            seqOpt.sortOrder = dialogFormGroup.get('sortOrder').value;
            seqOpt.idNumberSequencingCycles = dialogFormGroup.get('idNumberSequencingCycles').value;
            seqOpt.idSeqRunType = dialogFormGroup.get('idSeqRunType').value;
            seqOpt.protocolDescription = dialogFormGroup.get('protocolDescription').value;
            seqOpt.unitPriceInternal = dialogFormGroup.get('unitPriceInternal').value;
            seqOpt.unitPriceExternalAcademic = dialogFormGroup.get('unitPriceExternalAcademic').value;
            seqOpt.unitPriceExternalCommercial = dialogFormGroup.get('unitPriceExternalCommercial').value;
            if(this.expPlatfromService.isHiSeq) {
                seqOpt.isCustom = dialogFormGroup.get('isCustom').value;
            }
            this.gridApi.setRowData(this.rowData.sort(this.sortSeqOptions));
            this.formGroup.markAsDirty();

            this.gridApi.clearFocusedCell();
            this.selectedSeqOpt = [];
            let rowIndex: number = this.rowData.indexOf(seqOpt);
            if(rowIndex >= 0) {
                this.gridApi.getRowNode("" + rowIndex).setSelected(true);
            }
        }

    };
    openSeqEditor(){
        if(this.selectedSeqOpt.length > 0){
            let config: MatDialogConfig = new MatDialogConfig();
            config.data = {
                rowData: this.selectedSeqOpt[0],
                applyFn: this.applySeqOptionsFn,
                runOptions: this.expPlatfromService.isHiSeq ? this._runOptions :  [],
                cycleList: this.seqCycleList,
                seqTypeRunList: this.seqTypeRunList,
                canEnterPrices: this.expPlatfromNode.canEnterPrices
            };

            this.dialogService.genericDialogContainer(IlluminaSeqDialogComponent, "Edit Sequencing Option", null, config,
                {actions: [
                        {type: ActionType.PRIMARY, icon: this.constService.ICON_SAVE, name: "Apply", internalAction: "applyChanges"},
                        {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                    ]});

        }

    }
    addSeqOption(){
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
        this.seqOptionsList.splice(0, 0, newSeqOpt);
        this.filterSeqOptions();
        this.selectedSeqOpt = [newSeqOpt];
        this.gridApi.clearFocusedCell();
        this.gridApi.forEachNode(node => node.rowIndex ? 0 : node.setSelected(true, true));
        this.openSeqEditor();

    }
    removeSeqOption(){
        let seqOpt = this.selectedSeqOpt[0];
        this.dialogService.confirm("Are you sure you want to remove the sequencing option named "
            + seqOpt.name + "?", "Remove Illumina Seq Option").subscribe(result =>{
            if(result){
                let i:number = this.seqOptionsList.indexOf(seqOpt);
                this.seqOptionsList.splice(i,1);
                this.filterSeqOptions();
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
