import {Component, Inject, OnInit} from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import {ConstantsService} from "../../services/constants.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {numberRange} from "../../util/validators/number-range-validator";
import {BaseGenericContainerDialog} from "../../util/popup/base-generic-container-dialog";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";


@Component({
    templateUrl: "illumina-seq-dialog.component.html",
    styles: [`
        .medium-form-input{
            width: 20em;
            margin-right: 1em;
        }
    `]
})
export class IlluminaSeqDialogComponent extends BaseGenericContainerDialog implements OnInit{

    canEnterPrices: boolean = false;
    rowData:any;
    applyFn:any;
    formGroup:FormGroup;
    runOptions:any[] = [];
    cycleList:any[] = [];
    seqTypeRunList:any[] = [];
    showRunOptions:boolean = false;
    readonly currencyRegex = /^[0-9]+\.\d{2}$/;

    constructor(private dialogRef: MatDialogRef<IlluminaSeqDialogComponent>,
                public constService: ConstantsService,
                private fb: FormBuilder,
                @Inject(MAT_DIALOG_DATA) private data,
                public secAdvisor: CreateSecurityAdvisorService) {
        super();
        if (this.data && this.data.rowData) {
            this.rowData = this.data.rowData;
            this.applyFn = this.data.applyFn;
            this.runOptions = this.data.runOptions;
            this.cycleList = this.data.cycleList;
            this.seqTypeRunList = this.data.seqTypeRunList;
            this.canEnterPrices = this.data.canEnterPrices === "Y";
        }
    }

    ngOnInit(){

        this.formGroup =  this.fb.group({
            name: [this.rowData.name ? this.rowData.name : '', [Validators.required, Validators.maxLength(this.constService.MAX_LENGTH_100)]],
            isActive: this.rowData.isActive === 'Y',
            sortOrder: [this.rowData.sortOrder ? this.rowData.sortOrder : '', numberRange(0,99)],
            idNumberSequencingCycles: [this.rowData.idNumberSequencingCycles ? this.rowData.idNumberSequencingCycles : '', Validators.required],
            idSeqRunType: [this.rowData.idSeqRunType ? this.rowData.idSeqRunType : '', Validators.required],
            protocolDescription: this.rowData.protocolDescription ? this.rowData.protocolDescription : '',
            unitPriceInternal: [this.rowData.unitPriceInternal ? this.rowData.unitPriceInternal : '0.00', Validators.pattern(this.currencyRegex)],
            unitPriceExternalAcademic: [this.rowData.unitPriceExternalAcademic ? this.rowData.unitPriceExternalAcademic : '0.00', Validators.pattern(this.currencyRegex)],
            unitPriceExternalCommercial: [this.rowData.unitPriceExternalCommercial ? this.rowData.unitPriceExternalCommercial : '0.00', Validators.pattern(this.currencyRegex)],
        });
        if(this.runOptions.length > 0){
            this.showRunOptions = true;
            this.formGroup.addControl("isCustom",new FormControl(this.rowData.isCustom ? this.rowData.isCustom : '', Validators.required));
        }
        this.primaryDisable = (action) => {return this.formGroup.invalid; };

    }

    applyChanges(){
        this.applyFn(this.formGroup);
        this.dialogRef.close();
    }

}
