import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ExperimentPlatformService} from "../../services/experiment-platform.service";
import {Subscription} from "rxjs";
import {GridApi} from "ag-grid-community";
import {CheckboxRenderer} from "../../util/grid-renderers/checkbox.renderer";
import {ConstantsService} from "../../services/constants.service";
import {DialogsService} from "../../util/popup/dialogs.service";
import {DictionaryService} from "../../services/dictionary.service";

@Component({
    template: `

        <div class="flex-container-col" style="height: calc(100% - 1em); width: calc(100% - 1em); padding: 0.5em;">
            <div class="flex-grow" >Pipeline protocols for core facility: {{coreFacilityHeader}} </div>
            <div class="flex-grow flex-container-row justify-space-between">
                <div class="flex-container-row">
                    <button mat-button color="primary"
                            type="button"
                            (click)="addProtocol()">
                        <img [src]="this.constService.ICON_ADD"> Add
                    </button>
                    <button [disabled]="selectedProtocolRow.length === 0"
                            (click)="removeProtocol()"
                            mat-button color="primary"
                            type="button">
                        <img [src]="this.constService.ICON_DELETE"> Remove
                    </button>
                </div>
                <div>
                    <button mat-button [hidden]="!this.isAnyFilterPresent" (click)="clearFilterModel()">Clear Filter</button>
                </div>
            </div>
            <label style="padding: 0.5em;"> * Gird data is sortable and filterable. To sort, click the column header(sortable for asc/desc/default). To filter or search, hover the column header right side and click the filter icon.</label>
            <div style="flex:7" class="full-width">
                <ag-grid-angular class="full-height full-width ag-theme-balham"
                                 [columnDefs]="columnDefs"
                                 [rowData]="this.pipelineRowData"
                                 (gridReady)="onGridReady($event)"
                                 (gridSizeChanged)="onGridSizeChanged($event)"
                                 [rowDeselection]="true"
                                 [rowSelection]="'single'"
                                 [enableSorting]="true"
                                 [enableFilter]="true"
                                 [singleClickEdit]="true"
                                 (rowSelected)="this.onProtocolRowSelected($event)"
                                 [stopEditingWhenGridLosesFocus]="true">
                </ag-grid-angular>

            </div>
            <div style="flex:5; margin-top: 1em;" class="full-width flex-container-col">
                <div>
                    <mat-form-field  class="medium-form-input">
                        <input id="protocolInput" matInput (change)="updateGridForProtocol($event)" [(ngModel)]="protocol" [disabled]="this.disableControl" placeholder="Protocol" maxlength="50">
                    </mat-form-field>
                    <label class="label"> (Maximum of 50 characters)</label>
                </div>
                <mat-form-field >
                    <textarea matInput (change)="updateGridForDescription($event)"
                              placeholder="Description"
                              [(ngModel)]="description"
                              [disabled]="this.disableControl"
                              matTextareaAutosize matAutosizeMinRows="3" matAutosizeMaxRows="3">
                    </textarea>
                </mat-form-field>
                <mat-checkbox (change)="updateGridForCheckbox($event)" [(ngModel)]="isDefault" [disabled]="this.disableControl"> Default </mat-checkbox>
            </div>



        </div>
    `,
    styles:[`
        mat-form-field.medium-form-input{
            width: 40em;
        }
    `]
})

export class EpPipelineProtocolTabComponent implements OnInit, OnDestroy{
    public formGroup:FormGroup;
    private expPlatfromNode:any;
    public coreFacilityHeader:string;
    private expPlatformSubscription: Subscription;
    private gridApi:GridApi;
    public pipelineRowData:any[] = [];
    public selectedProtocolRow:any=[];
    public selectRowIndex:number = -1;
    public protocol:string = '';
    public description: string = '';
    public isDefault:boolean = false;
    public disableControl:boolean = true;


    public columnDefs:any[] =[
        {
            headerName: "Default",
            field: "isDefault",
            cellRendererFramework: CheckboxRenderer,
            checkboxEditable: false,
            suppressFilter: true,
            editable: false,
            width: 50
        },
        {
            headerName: "Pipeline Protocol",
            field: "protocol",
            filterParams: {clearButton: true},
            editable: false,
            width: 400
        },

    ];

    get isAnyFilterPresent(): boolean {
        return this.gridApi ? this.gridApi.isAnyFilterPresent() : false;
    }

    clearFilterModel(): void {
        if(this.gridApi && this.gridApi.isAnyFilterPresent()) {
            this.gridApi.setFilterModel(null);
            this.gridApi.setSortModel(null);
        }
    }

    constructor(private fb:FormBuilder,private expPlatformService:ExperimentPlatformService,
                public constService:ConstantsService,private dialogService:DialogsService,
                private dictionaryService:DictionaryService){
    }

    ngOnInit(){
        this.formGroup = this.fb.group({
            pipelineProtocols: [],
        });

        this.expPlatformSubscription = this.expPlatformService.getExperimentPlatformObservable()
            .subscribe(data =>{
                if(data && data.pipelineProtocols){
                    this.expPlatfromNode = data;
                    this.coreFacilityHeader = this.dictionaryService.getEntryDisplay(DictionaryService.CORE_FACILITY,data.idCoreFacility);
                    this.pipelineRowData = Array.isArray(data.pipelineProtocols) ? data.pipelineProtocols :
                        [data.pipelineProtocols.PipelineProtocol];
                    this.clearProtocolInfo();
                    this.selectedProtocolRow = [];
                    this.formGroup.get('pipelineProtocols').setValue(this.pipelineRowData);
                    this.formGroup.markAsPristine();

                }
        });

    }
    onGridReady(params:any){
        this.gridApi= params.api;
    }

    onGridSizeChanged(event){
        if(this.gridApi){
            this.gridApi.sizeColumnsToFit();
        }
    }

    onProtocolRowSelected(event:any){

        this.selectedProtocolRow = this.gridApi.getSelectedRows();
        if(this.selectedProtocolRow.length > 0 && event.node.selected){
            this.selectRowIndex = event.rowIndex;
            let protocolObj = this.selectedProtocolRow[0];
            this.protocol = protocolObj.protocol;
            this.description = protocolObj.description;
            this.isDefault = protocolObj.isDefault === 'Y'? true : false;
            this.disableControl = false;
        }else if(this.selectedProtocolRow.length === 0) {
            this.clearProtocolInfo();
        }
    }

    clearProtocolInfo():void{
        this.protocol = '';
        this.description = '';
        this.isDefault = false;
        this.disableControl = true;
        this.formGroup.markAsPristine();
    }

    updateGridForProtocol(event){
        this.pipelineRowData[this.selectRowIndex].protocol = this.protocol;
        this.gridApi.setRowData(this.pipelineRowData);
        this.formGroup.markAsDirty();
    }
    updateGridForDescription(event){
        this.pipelineRowData[this.selectRowIndex].description = this.description;
        this.gridApi.setRowData(this.pipelineRowData);
        this.formGroup.markAsDirty();
    }
    updateGridForCheckbox(event){
        for(let pipeline of this.pipelineRowData){
            pipeline.isDefault = 'N'
        }
        this.pipelineRowData[this.selectRowIndex].isDefault = this.isDefault ? 'Y' : 'N';
        this.gridApi.setRowData(this.pipelineRowData);
        this.formGroup.markAsDirty();

    }
    addProtocol(){
        let rowObj ={
            protocol:'', description:'',
            idCoreFacility:this.expPlatfromNode.idCoreFacility,
            isNew:'Y', isDefault:'N'
        };
        this.pipelineRowData.splice(0,0,rowObj);
        this.gridApi.setRowData(this.pipelineRowData);
        this.formGroup.markAsDirty();
        this.gridApi.clearFocusedCell();
        let rowIndex = this.pipelineRowData.indexOf(rowObj);
        this.gridApi.getRowNode("" + rowIndex).setSelected(true);
        document.getElementById("protocolInput").focus();
    }
    removeProtocol(){
        this.dialogService.confirm("Are you sure you want to remove pipeline protocol "
            + this.selectedProtocolRow[0].protocol + "?", "Remove protocol").subscribe(result =>{
                let removeIndex:number = this.pipelineRowData.indexOf(this.selectedProtocolRow[0]);
                if(result && removeIndex > -1){
                    this.pipelineRowData.splice(removeIndex,1);
                    this.gridApi.setRowData(this.pipelineRowData);
                    this.disableControl = true;
                    this.selectedProtocolRow = [];
                    this.clearProtocolInfo();
                    this.formGroup.markAsDirty();
                }
        });

    }



    ngOnDestroy(){
        this.expPlatformSubscription.unsubscribe();
    }
}
