import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {OrganismService} from "../services/organism.service";
import {HttpParams} from "@angular/common/http";
import {DialogsService} from "./popup/dialogs.service";
import {ConstantsService} from "../services/constants.service";
import {IGnomexErrorResponse} from "./interfaces/gnomex-error.response.model";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {BaseGenericContainerDialog} from "./popup/base-generic-container-dialog";
import {GDAction} from "./interfaces/generic-dialog-action.model";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {DictionaryService} from "../services/dictionary.service";
import {DataTrackService} from "../services/data-track.service";

@Component({
    selector: "new-organism",
    template: `
        <form [formGroup]="organismForm" class="full-height full-width flex-container-col double-padded-left-right">
            <div class="flex-container-row full-width align-center padded">
                <mat-form-field class="full-width padded">
                    <input matInput placeholder="Common Name" formControlName="commonName">
                    <mat-hint align="end">Example: Human</mat-hint>
                    <mat-error *ngIf="organismForm.get('commonName').hasError('required')">
                        Common Name is required
                    </mat-error>
                    <mat-error *ngIf="organismForm.get('commonName').hasError('maxlength')">
                        Common Name exceeded the 50 character limit
                    </mat-error>
                </mat-form-field>
            </div>
            <div class="flex-container-row full-width align-center padded">
                <mat-form-field class="full-width padded">
                    <input matInput placeholder="Binomial Name" formControlName="binomialName">
                    <mat-hint align="end">Example: Homo sapiens</mat-hint>
                    <mat-error *ngIf="organismForm.get('binomialName').hasError('required')">
                        Binomial Name is required
                    </mat-error>
                    <mat-error *ngIf="organismForm.get('binomialName').hasError('maxlength')">
                        Binomial Name exceeded the 200 character limit
                    </mat-error>
                </mat-form-field>
            </div>
            <div class="flex-container-row full-width align-center padded">
                <mat-form-field class="full-width padded">
                    <input matInput placeholder="DAS2 Name" formControlName="das2Name">
                    <mat-hint align="end">Example: H_sapiens</mat-hint>
                    <mat-error *ngIf="organismForm.get('das2Name').hasError('required')">
                        DAS2 Name is required
                    </mat-error>
                    <mat-error *ngIf="organismForm.get('das2Name').hasError('maxlength')">
                        DAS2 Name exceeded the 200 character limit
                    </mat-error>
                </mat-form-field>
            </div>
            <div class="flex-container-row align-center padded">
                <mat-checkbox formControlName="activeFlag">Active</mat-checkbox>
            </div>
        </form>
    `,
    styles: [``]
})

export class NewOrganismComponent extends BaseGenericContainerDialog implements OnInit {

    public organismForm: FormGroup;
    public primaryDisable: (action?: GDAction) => boolean;


    constructor(private dialogRef: MatDialogRef<NewOrganismComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private organismService: OrganismService,
                private dialogsService: DialogsService,
                private secAdvisor: CreateSecurityAdvisorService,
                public constantsService: ConstantsService,
                private dictionaryService: DictionaryService,
                private dataTrackService: DataTrackService,
                private fb: FormBuilder) {
        super();
    }

    ngOnInit(): void {
        this.organismForm = this.fb.group({
            commonName: ["", [Validators.required, Validators.maxLength(50)]],
            binomialName: ["", [Validators.required, Validators.maxLength(this.constantsService.MAX_LENGTH_200)]],
            das2Name: ["", [Validators.required, Validators.maxLength(this.constantsService.MAX_LENGTH_200)]],
            activeFlag: [true]
        });

        this.organismForm.markAsPristine();
        this.primaryDisable = (action) => {
            return this.organismForm.invalid;
        };
    }


    public save(): void {
        this.dialogsService.addSpinnerWorkItem();
        let params: HttpParams = new HttpParams()
            .set("organism", this.organismForm.get("commonName").value)
            .set("binomialName", this.organismForm.get("binomialName").value)
            .set("das2Name", this.organismForm.get("das2Name").value)
            .set("isActive", this.organismForm.get("das2Name").value ? "Y" : "N")
            .set("idAppUser", ""+this.secAdvisor.idAppUser);
        this.organismService.saveOrganismNew(params).subscribe((response: any) => {
            if (response && response.result && response.result === "SUCCESS" && response.idOrganism) {
                this.dictionaryService.reloadAndRefresh(() => {
                    this.dialogsService.removeSpinnerWorkItem();
                    this.dialogRef.close(response.idOrganism);
                    this.dataTrackService.refreshDatatracksList_fromBackend();
                }, () => {
                    this.dialogsService.stopAllSpinnerDialogs();
                }, DictionaryService.ORGANISM);
            } else {
                this.dialogsService.stopAllSpinnerDialogs();
            }
        }, (err: IGnomexErrorResponse) => {
            this.dialogsService.stopAllSpinnerDialogs();
        });
    }

}
