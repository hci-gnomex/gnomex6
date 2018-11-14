
//assets/page_add.png
import {Component, OnDestroy, OnInit} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {ExperimentPlatformService} from "../../services/experiment-platform.service";
import {DialogsService} from "../../util/popup/dialogs.service";
import {ConstantsService} from "../../services/constants.service";
import {Subscription} from "rxjs";
import {GridApi, RowSelectedEvent} from "ag-grid-community";

@Component({
    template: `
        <div class="full-height full-width flex-container-col">

            <div class="flex-grow flex-container-row"  >
                <button mat-button color="primary"
                        type="button"
                        (click)="addLibPrepQC()">
                    <img [src]="this.constService.ICON_ADD"> Add
                </button>
                <button [disabled]="!selectedRow"
                        (click)="removeLibPrepQC()"
                        mat-button color="primary"
                        type="button">
                    <img [src]="this.constService.ICON_DELETE"> Remove
                </button>
            </div>
            <div style="flex:7" class="full-width">
                <ag-grid-angular class="full-height full-width ag-theme-balham"
                                 [columnDefs]="columnDefs"
                                 [rowData]="this.rowData"
                                 (gridReady)="onGridReady($event)"
                                 (gridSizeChanged)="onGridSizeChanged($event)"
                                 (cellValueChanged)="onCellValueChanged($event)"
                                 [rowDeselection]="true"
                                 [rowSelection]="'single'"
                                 (rowSelected)="this.onRowSelected($event)"
                                 [stopEditingWhenGridLosesFocus]="true">
                </ag-grid-angular>

            </div>



        </div>
    `,
    styles:[`
    `]
})

export class EpLibraryPrepQCTabComponent implements OnInit, OnDestroy{
    public formGroup:FormGroup;
    private expPlatformSubscription: Subscription;
    public expPlatformNode:any;
    public selectedRow:any;
    public selectedRowIndex:number = -1;
    private gridApi:GridApi;
    public rowData:any[] =[];

    public columnDefs:any[] = [
        {
            headerName: "Lib Prep QC Protocol",
            field: "protocolDisplay",
            editable: true,
            width: 100
        }
    ];


    constructor(private fb:FormBuilder, private expPlatformService:ExperimentPlatformService,
                public constService:ConstantsService, private dialogService:DialogsService){
    }

    ngOnInit(){
        this.formGroup = this.fb.group({
            prepQCProtocols: []
        });
        this.expPlatformSubscription = this.expPlatformService.getExperimentPlatformObservable()
            .subscribe(data =>{
                if(data && data.prepQCProtocols){
                    this.expPlatformNode = data;
                    this.rowData = Array.isArray(data.prepQCProtocols) ? data.prepQCProtocols : [data.prepQCProtocols.LibraryPrepQCProtocol];
                    this.selectedRow = null;
                    this.formGroup.get('prepQCProtocols').setValue(this.rowData);
                    this.formGroup.markAsPristine();

                }
            });

    }

    onGridReady(params){
        this.gridApi = params.api;
    }
    onGridSizeChanged($event){
        this.gridApi.sizeColumnsToFit();
    }
    onCellValueChanged(event){
        if(event.oldValue !== event.newValue){
            this.formGroup.markAsDirty();
        }
    }

    onRowSelected(event:RowSelectedEvent){
        let selectedRow = this.gridApi.getSelectedRows();
        this.selectedRow = Array.isArray(selectedRow) && selectedRow.length > 0  ? selectedRow[0] : null;
        if(event.node.isSelected()){
            this.selectedRowIndex =  event.rowIndex // selectedRowIndex isn't correct when grid sorted
        }
    }

    addLibPrepQC(){
        this.rowData.splice(0,0,
            {
                protocolDisplay:'Enter Lib Prep QC Protocol here...',
                codeRequestCategory: this.expPlatformNode.codeRequestCategory,
                isNew: 'Y',
            });
        this.gridApi.setRowData(this.rowData);
        this.formGroup.markAsDirty();

    }
    removeLibPrepQC(){

        let experimentType:string = this.selectedRow.protocolDisplay? this.selectedRow.protocolDisplay :'';
        this.dialogService.confirm('Remove Lib Prep QC Protocol',
            'Are you sure you want to remove experiment type ' + "\'"+ experimentType +'\'?')
            .subscribe(action => {
                if(action){
                    let removeIndex:number = this.rowData.indexOf(this.selectedRow);
                    if(removeIndex > -1){
                        this.rowData.splice(removeIndex, 1);
                        this.gridApi.setRowData(this.rowData);
                        this.formGroup.markAsDirty();
                        this.selectedRow = null;
                    }
                }
            })

    }


    ngOnDestroy(){
        this.expPlatformSubscription.unsubscribe();
    }


}