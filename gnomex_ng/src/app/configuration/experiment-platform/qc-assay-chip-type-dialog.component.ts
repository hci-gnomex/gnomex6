import {Component, Inject, OnInit} from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig, MatDialog} from "@angular/material";
import {ConstantsService} from "../../services/constants.service";
import {FormBuilder,FormGroup, Validators} from "@angular/forms";
import {ExperimentPlatformService} from "../../services/experiment-platform.service";
import {DictionaryService} from "../../services/dictionary.service";
import {DialogsService} from "../../util/popup/dialogs.service";
import {GridApi, CellValueChangedEvent} from "ag-grid";
import {GnomexService} from "../../services/gnomex.service";
import {PropertyService} from "../../services/property.service";
import {numberRange} from "../../util/validators/number-range-validator";


@Component({
    template: `
        <div class="full-height full-width flex-container-col" style="font-size: small">
            <div mat-dialog-title class="padded-outer">
                <div class="dialog-header-colors padded-inner">
                    Edit QC Assay
                </div>
            </div>
            <div class="padded-outer flex-grow" mat-dialog-content>
                <form class="full-height full-width padded-inner flex-container-col"  [formGroup]="formGroup">
                    <div class="flex-container-row spaced-children-margin">
                        <mat-form-field class="medium-form-input">
                            <input matInput placeholder="Assay Name" formControlName="bioanalyzerChipType">
                            <mat-error  *ngIf="this.formGroup?.controls['bioanalyzerChipType']?.hasError('required')">
                                Field is required
                            </mat-error>
                        </mat-form-field>
                        <mat-form-field class="short-input">
                            <input matInput placeholder="Concentration" formControlName="concentrationRange">
                        </mat-form-field>
                        <mat-form-field class="short-input">
                            <input matInput placeholder="Sort Order" formControlName="sortOrder">
                            <mat-error  *ngIf="this.formGroup?.controls['sortOrder']?.hasError('numberRange')">
                                {{this.formGroup.get('sortOrder').errors.numberRange }}
                            </mat-error>
                        </mat-form-field>
                    </div>
                    
                    <div class="flex-container-row spaced-children-margin">
                        <mat-form-field *ngIf="!hideBufferStrength" class="medium-form-input">
                            <input matInput placeholder="Max Sample Buffer Strength" formControlName="maxSampleBufferStrength">
                        </mat-form-field>
                        <mat-form-field *ngIf="!hideWellPerChip" class="medium-form-input">
                            <input matInput placeholder="Sample Wells Per Chip" formControlName="sampleWellsPerChip">
                            <mat-error  *ngIf="this.formGroup?.controls['sampleWellsPerChip']?.hasError('numberRange')">
                                {{this.formGroup.get('sampleWellsPerChip').errors.numberRange }}
                            </mat-error>
                        </mat-form-field>
                    </div>
                    
                    <!-- billing  -->
                    <div class="flex-container-row spaced-children-margin" >
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
                    <mat-form-field>
                        <textarea matInput placeholder="Protocol Description" formControlName="protocolDescription" matTextareaAutosize matAutosizeMinRows="15" matAutosizeMaxRows="15">
                        </textarea>
                    </mat-form-field>
                    
                    

                </form>
            </div>
            <div class="padded-outer" style="justify-content: flex-end;"  mat-dialog-actions>
                <div class="padded-inner flex-container-row" style="align-items:center" >
                    <div class="flex-grow">
                        <save-footer [actionType]="applyText"
                                     (saveClicked)="applyChanges()"
                                     [disableSave]="formGroup.invalid"
                                     [dirty]="formGroup.dirty" >
                        </save-footer>
                    </div>
                    <button mat-button  mat-dialog-close> Cancel  </button>
                </div>
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
        .fixed-content-height{
            height: 400px;
        }




    `]
})
export class QcAssayChipTypeDialogComponent implements OnInit{

    applyFn:any;
    applyText:string = "Apply";
    formGroup:FormGroup;
    rowData:any;
    expPlatform:any;
    hideBufferStrength:boolean = true;
    hideWellPerChip:boolean = true;
    readonly currencyRegex = /^[0-9]+\.\d{2}$/;


    constructor(private dialogRef: MatDialogRef<QcAssayChipTypeDialogComponent>,
                public constService:ConstantsService, private fb: FormBuilder,
                private expPlatformService: ExperimentPlatformService,
                private gnomexService: GnomexService,
                private dialog: MatDialog,
                private dictionaryService: DictionaryService,
                private dialogService:DialogsService,
                @Inject(MAT_DIALOG_DATA) private data) {
        if (this.data) {
            this.rowData = this.data.rowData;
            this.applyFn = this.data.applyFn;
            this.expPlatform =this.data.expPlatform;
        }
    }

    ngOnInit(){
        let canEntryPrice:boolean = this.expPlatform.canEnterPrices == 'Y';
        this.hideBufferStrength  =
            this.gnomexService.getCoreFacilityProperty(this.expPlatform.idCoreFacility,PropertyService.PROPERTY_QC_ASSAY_HIDE_BUFFER_STRENGTH ) === 'Y';
        this.hideWellPerChip =
            this.gnomexService.getCoreFacilityProperty(this.expPlatform.idCoreFacility,PropertyService.PROPERTY_QC_ASSAY_HIDE_WELLS_PER_CHIP) === 'Y';

        this.formGroup = this.fb.group({
            bioanalyzerChipType: [this.rowData.bioanalyzerChipType ? this.rowData.bioanalyzerChipType : '',Validators.required],
            concentrationRange: this.rowData.concentrationRange ? this.rowData.concentrationRange : '',
            sortOrder: [this.rowData.sortOrder ? this.rowData.sortOrder : '', numberRange(0,99) ],
            maxSampleBufferStrength: this.rowData.maxSampleBufferStrength ? this.rowData.maxSampleBufferStrength : '',
            sampleWellsPerChip: [this.rowData.sampleWellsPerChip ? this.rowData.sampleWellsPerChip : '', numberRange(0,99) ],
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
            protocolDescription: this.rowData.protocolDescription ? this.rowData.protocolDescription : '',


        });


    }



    applyChanges(){
        this.applyFn(this.formGroup);
        this.dialogRef.close();
    }


}