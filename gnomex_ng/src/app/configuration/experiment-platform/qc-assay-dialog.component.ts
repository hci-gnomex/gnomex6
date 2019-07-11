import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef} from "@angular/material";
import {ConstantsService} from "../../services/constants.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ExperimentPlatformService} from "../../services/experiment-platform.service";
import {DictionaryService} from "../../services/dictionary.service";
import {DialogsService} from "../../util/popup/dialogs.service";
import {CellValueChangedEvent, GridApi} from "ag-grid-community";
import {GnomexService} from "../../services/gnomex.service";
import {PropertyService} from "../../services/property.service";
import {QcAssayChipTypeDialogComponent} from "./qc-assay-chip-type-dialog.component";
import * as _ from "lodash";
import {numberRange} from "../../util/validators/number-range-validator";
import {first} from "rxjs/operators";
import {ActionType} from "../../util/interfaces/generic-dialog-action.model";
import {BaseGenericContainerDialog} from "../../util/popup/base-generic-container-dialog";


@Component({
    template: `
        <div class="full-height full-width flex-container-col small-font double-padded">

            <div class="padded-outer flex-grow">
                <form class="full-height full-width padded-inner flex-container-col"  [formGroup]="formGroup">
                    <div  class="flex-container-row align-center spaced-children-margin" >
                        <mat-form-field class="medium-form-input">
                            <input matInput placeholder="QC Experiment Type" formControlName="application">
                            <mat-error  *ngIf="this.formGroup?.controls['application']?.hasError('required')">
                                Field is required
                            </mat-error>
                        </mat-form-field>
                        <mat-form-field class="short-input">
                            <input matInput placeholder="Sort Order" formControlName="sortOrder">
                            <mat-error  *ngIf="this.formGroup?.controls['sortOrder']?.hasError('numberRange')">
                               {{this.formGroup.get('sortOrder')?.errors.numberRange }}
                            </mat-error>
                        </mat-form-field>
                        <div>
                            <mat-checkbox  formControlName="hasChipTypes" > Has Assays </mat-checkbox>
                        </div>
                    </div>
                    <div class="flex-container-row spaced-children-margin"  *ngIf="!this.formGroup.get('hasChipTypes').value">
                        <mat-form-field class="flex-grow">
                            <span matPrefix>$ &nbsp;</span>
                            <input matInput placeholder="Internal Pricing" formControlName="unitPriceInternal">
                            <mat-error  *ngIf="this.formGroup?.controls['unitPriceInternal']?.hasError('pattern')">
                                Invalid dollar amount
                            </mat-error>
                        </mat-form-field>

                        <mat-form-field  class="flex-grow">
                            <span matPrefix>$ &nbsp;</span>
                            <input matInput placeholder="External Academic Pricing" formControlName="unitPriceExternalAcademic">
                            <mat-error  *ngIf="this.formGroup?.controls['unitPriceExternalAcademic']?.hasError('pattern')">
                                Invalid dollar amount
                            </mat-error>
                        </mat-form-field>
                        <mat-form-field  class="flex-grow">
                            <span matPrefix>$ &nbsp;</span>
                            <input matInput placeholder="External Commercial Pricing" formControlName="unitPriceExternalCommercial">
                            <mat-error  *ngIf="this.formGroup?.controls['unitPriceExternalCommercial']?.hasError('pattern')">
                                Invalid dollar amount
                            </mat-error>
                        </mat-form-field>
                    </div>

                    <div *ngIf="this.formGroup.get('hasChipTypes').value" class="flex-container-col flex-grow">
                        <div class="flex-container-row align-center">
                            <button  mat-button color="primary" type="button" (click)="addChip()">
                                <img [src]="this.constService.ICON_ADD"> Add
                            </button>
                            <button [disabled]="selectedAssay.length === 0" (click)="removeChip()" mat-button color="primary">
                                <img [src]="this.constService.ICON_DELETE"> Remove
                            </button>
                            <button mat-button [disabled]="selectedAssay.length === 0" color="primary" (click)="openAssayEditor()">
                                Edit QC Assay
                            </button>
                        </div>

                        <ag-grid-angular class="flex-grow full-width ag-theme-balham"
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
                </form>
            </div>

        </div>
    `,
    styles: [`
        .padded-outer{
            margin:0;
            padding:0;
        }
        .padded-inner{
            padding:0.3em;

        }
        .medium-form-input{
            width: 30em
        }
    `]
})
export class QcAssayDialogComponent extends BaseGenericContainerDialog implements OnInit{

    applyFn:any;
    formGroup:FormGroup;
    rowData:any;
    private expPlatform:any;
    private gridApi:GridApi;
    selectedAssay:any[] =[];
    chipTypeList:any[] = [];
    readonly currencyRegex = /^[0-9]+\.\d{2}$/;
    uncommitedChipTypeList:any[] = []; // for uncommited changes that user has made before final decision

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


    private columnDefs:any[] = [
        {
            headerName: "Name",
            field: "bioanalyzerChipType",
            editable: false,
            width: 300
        },

        {
            headerName: "Conc. Range",
            field: "concentrationRange",
            editable:false,
            width: 200
        },
        {
            headerName: "Max Sample Buf. Str.",
            field: "maxSampleBufferStrength",
            editable:false,
            width: 200
        },
        {
            headerName: "Wells",
            field: "sampleWellsPerChip",
            editable:false,
            width: 200
        },
        {
            headerName: "Pricing",
            field: "unitPriceDisplay",
            editable:false,
            width: 200
        },
        {
            headerName: "Sort Order",
            field: "sortOrder",
            valueParser: this.parseSortOrder,
            editable:false,
            width: 150
        }
    ];

    private compareApplications = (obj1:any,obj2:any) => {
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

    };



    constructor(private dialogRef: MatDialogRef<QcAssayDialogComponent>,
                public constService: ConstantsService,
                private fb: FormBuilder,
                private expPlatformService: ExperimentPlatformService,
                private gnomexService: GnomexService,
                private dictionaryService: DictionaryService,
                private dialogService: DialogsService,
                @Inject(MAT_DIALOG_DATA) private data) {
        super();
        if (this.data) {
            this.rowData = this.data.rowData;
            this.expPlatform = this.data.expPlatform;
            this.applyFn = this.data.applyFn;
        }
    }

    ngOnInit(){
        this.rowData.application = this.rowData.display;
        let canEntryPrice:boolean = this.expPlatform.canEnterPrices == 'Y';

        let tempChipTypes:any[] | any = null;
        if(this.rowData.ChipTypes) {
            tempChipTypes = this.rowData.ChipTypes;
            this.chipTypeList = (Array.isArray(tempChipTypes) ? tempChipTypes : [tempChipTypes.BioanalyzerChipType])
                .sort(this.compareApplications);
            this.uncommitedChipTypeList = _.cloneDeep(this.chipTypeList);
        }

        this.formGroup = this.fb.group({
            application: [this.rowData.application ? this.rowData.application : '',Validators.required],
            sortOrder: [this.rowData.sortOrder? this.rowData.sortOrder : '', numberRange(0,99) ],
            hasChipTypes: this.rowData.hasChipTypes ? this.rowData.hasChipTypes === 'Y' : false,
            unitPriceInternal: [
                {value:this.rowData.unitPriceInternal ? this.rowData.unitPriceInternal : '0.00', disabled:!canEntryPrice},
                Validators.pattern(this.currencyRegex)
            ],
            unitPriceExternalAcademic:[
                {value:this.rowData.unitPriceExternalAcademic ? this.rowData.unitPriceExternalAcademic : '0.00',disabled:!canEntryPrice},
                Validators.pattern(this.currencyRegex)
            ],
            unitPriceExternalCommercial: [
                {value:this.rowData.unitPriceExternalCommercial ? this.rowData.unitPriceExternalCommercial : '0.00',disabled:!canEntryPrice},
                Validators.pattern(this.currencyRegex)
            ],

        });

        let hideBufferStrength:string =
            this.gnomexService.getCoreFacilityProperty(this.expPlatform.idCoreFacility,PropertyService.PROPERTY_QC_ASSAY_HIDE_BUFFER_STRENGTH );
        let hideWellPerChip: string =
            this.gnomexService.getCoreFacilityProperty(this.expPlatform.idCoreFacility,PropertyService.PROPERTY_QC_ASSAY_HIDE_WELLS_PER_CHIP);
        if(hideBufferStrength && hideBufferStrength == 'Y'){
            this.columnDefs.splice(2,1);
        }
        if(hideWellPerChip && hideWellPerChip === 'Y'){
            this.columnDefs.splice(2,1);
        }

        this.formGroup.markAsPristine();
        this.primaryDisable = (action) => {return this.formGroup.invalid; };
        this.dirty = () => {return this.formGroup.dirty; };

    }

    removeChip(){
        let removeIndex:number  = this.uncommitedChipTypeList.indexOf(this.selectedAssay[0]);
        let display = this.selectedAssay[0].display;

        this.dialogService.confirm("Are you sure you want to remove assay \'" + display + "\'?", "Warning").pipe(first()).subscribe( action =>{
                if(action){
                    if(removeIndex > -1){
                        this.uncommitedChipTypeList.splice(removeIndex,1);
                        this.gridApi.setRowData(this.uncommitedChipTypeList);
                        this.selectedAssay = [];
                        this.formGroup.markAsDirty();
                    }
                }
            }
        );


    }
    addChip(){
        let newChipType = {
            isSelected : 'Y',
            codeBioanalyzerChipType:'NewBioanalyzerChipType',
            display:'',
            bioanalyzerChipType:'',
            concentrationRange:'',
            maxSampleBufferStrength:'',
            sampleWellsPerChip:'',
            codeApplication: this.rowData.codeApplication ,
            isActive: 'Y',
            canUpdate: 'Y'
        };
        this.uncommitedChipTypeList.splice(0,0,newChipType);
        this.gridApi.setRowData(this.uncommitedChipTypeList);
        this.selectedAssay = [newChipType];
        this.formGroup.markAsDirty();
        this.openAssayEditor();

    }

    private applyAssayFn = (assayFormGroup:FormGroup) =>{
        let internal: string = assayFormGroup.get('unitPriceInternal').value;
        let academic: string = assayFormGroup.get('unitPriceExternalAcademic').value;
        let commercial: string = assayFormGroup.get('unitPriceExternalCommercial').value;
        if(assayFormGroup.dirty){
            this.selectedAssay[0].isActive = 'Y';
            this.selectedAssay[0].bioanalyzerChipType = assayFormGroup.get('bioanalyzerChipType').value;
            this.selectedAssay[0].display = assayFormGroup.get('bioanalyzerChipType').value;
            this.selectedAssay[0].concentrationRange = assayFormGroup.get('concentrationRange').value;
            this.selectedAssay[0].sortOrder = assayFormGroup.get('sortOrder').value;
            this.selectedAssay[0].maxSampleBufferStrength = assayFormGroup.get('maxSampleBufferStrength').value;
            this.selectedAssay[0].sampleWellsPerChip = assayFormGroup.get('sampleWellsPerChip').value;
            this.selectedAssay[0].protocolDescription = assayFormGroup.get('protocolDescription').value;
            this.selectedAssay[0].unitPriceInternal = internal;
            this.selectedAssay[0].unitPriceExternalAcademic = academic;
            this.selectedAssay[0].unitPriceExternalCommercial = commercial;
            this.selectedAssay[0].unitPriceDisplay = internal +'/'+academic +'/' + commercial;

            this.formGroup.markAsDirty();
            this.uncommitedChipTypeList.sort(this.compareApplications);
            this.gridApi.setRowData(this.uncommitedChipTypeList);
        }

    };
    openAssayEditor(){
        if(this.selectedAssay.length > 0){
            let config: MatDialogConfig = new MatDialogConfig();
            config.data = {
                rowData: this.selectedAssay[0],
                applyFn: this.applyAssayFn,
                expPlatform: this.expPlatform
            };

            this.dialogService.genericDialogContainer(QcAssayChipTypeDialogComponent, "Edit QC Assay", null, config,
                {actions: [
                        {type: ActionType.PRIMARY, name: "Apply", internalAction: "applyChanges"},
                        {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                    ]});
        }

    }

    applyChanges(){
        this.applyFn(this.formGroup, this.uncommitedChipTypeList);
        this.dialogRef.close();
    }

    onCellValueChanged(event:CellValueChangedEvent){
        if(event.newValue != event.oldValue){
            this.formGroup.markAsDirty();
            if(event.column.getColId() === "sortOrder"){
                this.uncommitedChipTypeList.sort(this.compareApplications);
                this.gridApi.setRowData(this.uncommitedChipTypeList);
            }

        }
    }
    onGridReady(params:any){
        this.gridApi = params.api;
        this.gridApi.setColumnDefs(this.columnDefs);
        this.gridApi.setRowData(this.uncommitedChipTypeList);
        this.gridApi.sizeColumnsToFit();
    }
    onRowSelected(event:any){
        this.selectedAssay = this.gridApi.getSelectedRows();
    }
    onGridSizeChanged(event:any){

    }

}
