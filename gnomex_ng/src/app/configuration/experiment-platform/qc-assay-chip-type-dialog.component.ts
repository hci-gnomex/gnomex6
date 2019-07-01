import {Component, Inject, OnInit} from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from "@angular/material";
import {ConstantsService} from "../../services/constants.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ExperimentPlatformService} from "../../services/experiment-platform.service";
import {DictionaryService} from "../../services/dictionary.service";
import {DialogsService} from "../../util/popup/dialogs.service";
import {GnomexService} from "../../services/gnomex.service";
import {PropertyService} from "../../services/property.service";
import {numberRange} from "../../util/validators/number-range-validator";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {BaseGenericContainerDialog} from "../../util/popup/base-generic-container-dialog";


@Component({
    template: `
        <div class="full-height full-width flex-container-col small-font double-padded-left-right">
            <div class="flex-grow">
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
                    <div *ngIf="!this.canEnterPrice || this.createSecurityAdvisorService.isSuperAdmin">
                        <context-help name="ExperimentPlatformQCPricingHelp" [isEditMode]="this.createSecurityAdvisorService.isSuperAdmin" label="Why can't I edit prices?" popupTitle="Pricing Help" tooltipPosition="right"></context-help>
                    </div>
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
        </div>
    `,
    styles: [`
        .padded-inner{
            padding:0.3em;
        }
        .medium-form-input{
            width: 30em
        }
    `]
})
export class QcAssayChipTypeDialogComponent extends BaseGenericContainerDialog implements OnInit{

    applyFn:any;
    formGroup:FormGroup;
    rowData:any;
    expPlatform:any;
    hideBufferStrength:boolean = true;
    hideWellPerChip:boolean = true;
    readonly currencyRegex = /^[0-9]+\.\d{2}$/;

    public canEnterPrice: boolean = false;


    constructor(private dialogRef: MatDialogRef<QcAssayChipTypeDialogComponent>,
                public constService:ConstantsService, private fb: FormBuilder,
                private expPlatformService: ExperimentPlatformService,
                private gnomexService: GnomexService,
                private dialog: MatDialog,
                private dictionaryService: DictionaryService,
                private dialogService:DialogsService,
                @Inject(MAT_DIALOG_DATA) private data,
                public createSecurityAdvisorService: CreateSecurityAdvisorService) {
        super();
        if (this.data) {
            this.rowData = this.data.rowData;
            this.applyFn = this.data.applyFn;
            this.expPlatform =this.data.expPlatform;
        }
    }

    ngOnInit(){
        this.canEnterPrice = this.expPlatform.canEnterPrices == 'Y';
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
                {value:this.rowData.unitPriceInternal ? this.rowData.unitPriceInternal : '0.00', disabled: !this.canEnterPrice},
                Validators.pattern(this.currencyRegex)
            ],
            unitPriceExternalAcademic:[
                {value:this.rowData.unitPriceExternalAcademic ? this.rowData.unitPriceExternalAcademic : '0.00', disabled: !this.canEnterPrice},
                Validators.pattern(this.currencyRegex)
            ],
            unitPriceExternalCommercial: [
                {value:this.rowData.unitPriceExternalCommercial ? this.rowData.unitPriceExternalCommercial : '0.00', disabled: !this.canEnterPrice},
                Validators.pattern(this.currencyRegex)
            ],
            protocolDescription: this.rowData.protocolDescription ? this.rowData.protocolDescription : '',
        });

        this.formGroup.markAsPristine();
        this.primaryDisable = (action) => {return this.formGroup.invalid; };
        this.dirty = () => {return this.formGroup.dirty; };
    }

    applyChanges(){
        this.applyFn(this.formGroup);
        this.dialogRef.close();
    }

}
