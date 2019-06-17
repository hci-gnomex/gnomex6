import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {OrganismService} from "../services/organism.service";
import {DataTrackService} from "../services/data-track.service";
import {HttpParams} from "@angular/common/http";
import {DialogsService} from "./popup/dialogs.service";
import {DictionaryService} from "../services/dictionary.service";
import {IGnomexErrorResponse} from "./interfaces/gnomex-error.response.model";
import {BaseGenericContainerDialog} from "./popup/base-generic-container-dialog";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {GDAction} from "./interfaces/generic-dialog-action.model";
import {ConstantsService} from "../services/constants.service";

@Component({
    selector: 'new-genome-build',
    template: `
        <form [formGroup]="genomeBuildForm" class="full-height full-width padded-inner flex-container-col">
            <div class="flex-container-row align-center padded">
                <label class="label label-width">Organism</label>
                <jqxComboBox class="dialogComboBox" [width]="450"
                             [placeHolder]="'...'" formControlName="idOrganism"
                             [source]="das2OrganismList" [displayMember]="'binomialName'"
                             [valueMember]="'idOrganism'"
                             (onSelect)="onOrganismSelect($event)"
                             (onUnselect)="onOrganismUnselect()">
                </jqxComboBox>
            </div>
            <div class="flex-container-row full-width align-center padded">
                <mat-form-field class="full-width padded">
                    <input matInput placeholder="Name" formControlName="name">
                    <mat-hint align="end">Example: H_sapiens_Mar_2006</mat-hint>
                </mat-form-field>
            </div>
            <div class="flex-container-row full-width align-center padded">
                <mat-form-field class="full-width padded">
                    <input matInput [matDatepicker]="buildDatepicker" placeholder="Build Date" (dateChange)="buildDateChange($event)" formControlName="buildDate">
                    <mat-datepicker-toggle matSuffix [for]="buildDatepicker"></mat-datepicker-toggle>
                    <mat-datepicker #buildDatepicker></mat-datepicker>
                </mat-form-field>
            </div>
            <div class="flex-container-row full-width align-center padded">
                <mat-checkbox formControlName="activeFlag">Active</mat-checkbox>
            </div>
        </form>
    `,
    styles: [`
        /*.content {*/
            /*height: 16em;*/
        /*}*/
        .label-width {
            width: 7em;
        }
    `]
})

export class NewGenomeBuildComponent extends BaseGenericContainerDialog {
    public genomeBuildForm: FormGroup;

    public idOrganism: string = "";
    public buildDate: string = "";

    public das2OrganismList: any[] = [];

    public primaryDisable: (action?: GDAction) => boolean;

    constructor(public dialogRef: MatDialogRef<NewGenomeBuildComponent>,
                private organismService: OrganismService,
                private dataTrackService: DataTrackService,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private dialogsService: DialogsService,
                private dictionaryService: DictionaryService,
                private fb: FormBuilder,
                private constantsService: ConstantsService) {

        super();
        this.organismService.getDas2OrganismList().subscribe((response: any[]) => {
            this.das2OrganismList = response;
        }, (err: IGnomexErrorResponse) => {
        });

        this.genomeBuildForm = this.fb.group({
            idOrganism: ["", Validators.required],
            name: ["", [Validators.required, Validators.maxLength(this.constantsService.MAX_LENGTH_500)]],
            buildDate: ["", Validators.required],
            activeFlag: [true]
        });

        this.genomeBuildForm.markAsPristine();

        this.primaryDisable = (action) => {
            return this.genomeBuildForm.invalid;
        };
    }

    public buildDateChange(event: any): void {
        if (event.value != null) {
            this.buildDate = event.value.toLocaleDateString();
        } else {
            this.buildDate = "";
        }
    }

    public onOrganismSelect(event: any): void {
        if (event.args !== undefined && event.args.item != null && event.args.item.value != null) {
            this.idOrganism = event.args.item.value;
        } else {
            this.resetOrganismSelection();
        }
    }

    public onOrganismUnselect(): void {
        this.resetOrganismSelection();
    }

    private resetOrganismSelection(): void {
        this.idOrganism = "";
    }

    public save(): void {
        this.dialogsService.startDefaultSpinnerDialog();
        let params: HttpParams = new HttpParams()
            .set("das2Name", this.genomeBuildForm.get("name").value)
            .set("genomeBuildName", this.genomeBuildForm.get("name").value)
            .set("buildDate", this.buildDate)
            .set("idOrganism", this.idOrganism)
            .set("isActive", this.genomeBuildForm.get("activeFlag").value ? "Y" : "N");
        this.dataTrackService.saveGenomeBuild(params).subscribe((response: any) => {
            if (response && response.idGenomeBuild) {
                this.dictionaryService.reloadAndRefresh(() => {
                    this.dataTrackService.refreshDatatracksList_fromBackend();
                }, null, DictionaryService.GENOME_BUILD);
                this.dialogRef.close(response.idGenomeBuild);
            }
            this.dialogsService.stopAllSpinnerDialogs();
        }, (err: IGnomexErrorResponse) => {
            this.dialogsService.stopAllSpinnerDialogs();
        });
    }

    public cancel(): void {
        this.dialogRef.close();
    }

}
