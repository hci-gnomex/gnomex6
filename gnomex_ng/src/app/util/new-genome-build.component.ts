import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {OrganismService} from "../services/organism.service";
import {DataTrackService} from "../services/data-track.service";
import {ITreeNode} from "angular-tree-component/dist/defs/api";
import {HttpParams} from "@angular/common/http";
import {DialogsService} from "./popup/dialogs.service";
import {DictionaryService} from "../services/dictionary.service";

@Component({
    selector: 'new-genome-build',
    template: `
        <h6 mat-dialog-title>New Genome Build</h6>
        <div mat-dialog-content class="content">
            <div class="flex-container-col">
                <div class="dialogDiv">
                    <label>Organism</label>
                    <jqxComboBox class="dialogComboBox" [width]="'100%'" [height]="30" [placeHolder]="'...'"
                                 [source]="das2OrganismList" [displayMember]="'binomialName'" [valueMember]="'idOrganism'"
                                 (onSelect)="onOrganismSelect($event)" (onUnselect)="onOrganismUnselect()">
                    </jqxComboBox>
                </div>
                <mat-form-field class="dialogFormField">
                    <input matInput [(ngModel)]="name" placeholder="Name">
                    <mat-hint align="end">Example: H_sapiens_Mar_2006</mat-hint>
                </mat-form-field>
                <mat-form-field class="dialogFormField">
                    <input matInput [matDatepicker]="buildDatepicker" placeholder="Build Date" (dateChange)="buildDateChange($event)">
                    <mat-datepicker-toggle matSuffix [for]="buildDatepicker"></mat-datepicker-toggle>
                    <mat-datepicker #buildDatepicker></mat-datepicker>
                </mat-form-field>
                <mat-checkbox [(ngModel)]="activeFlag">Active</mat-checkbox>
            </div>
        </div>
        <div mat-dialog-actions>
            <button mat-button *ngIf="!showSpinner" [disabled]="!idOrganism && !name && !buildDate" (click)="save()">Save</button>
            <button mat-button *ngIf="!showSpinner" mat-dialog-close>Cancel</button>
            <mat-spinner *ngIf="showSpinner" strokeWidth="3" [diameter]="30"></mat-spinner>
        </div>
    `,
    styles: [`
        .content {
            height: 16em;
        }
    `]
})

export class NewGenomeBuildComponent {
    private selectedItem: ITreeNode;

    public idOrganism: string = "";
    public name: string = "";
    public buildDate: string = "";
    public activeFlag: boolean = true;

    public das2OrganismList: any[] = [];

    public showSpinner: boolean = false;

    constructor(public dialogRef: MatDialogRef<NewGenomeBuildComponent>,
                private organismService: OrganismService,
                private dataTrackService: DataTrackService,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private dialogsService: DialogsService,
                private dictionaryService: DictionaryService) {
        if (this.data) {
            this.selectedItem = data.selectedItem;
        }
        this.organismService.getDas2OrganismList().subscribe((response: any[]) => {
            this.das2OrganismList = response;
        });
    }

    public buildDateChange(event: any): void {
        if (event.value != null) {
            this.buildDate = event.value.toLocaleDateString();
        } else {
            this.buildDate = "";
        }
    }

    public onOrganismSelect(event: any): void {
        if (event.args != undefined && event.args.item != null && event.args.item.value != null) {
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
        this.showSpinner = true;
        let params: HttpParams = new HttpParams()
            .set("das2Name", this.name)
            .set("genomeBuildName", this.name)
            .set("buildDate", this.buildDate)
            .set("idOrganism", this.idOrganism)
            .set("isActive", this.activeFlag ? "Y" : "N");
        this.dataTrackService.saveGenomeBuild(params).subscribe((response: any) => {
            this.showSpinner = false;
            if (response && response.idGenomeBuild) {
                if (this.data && this.selectedItem) {
                    this.dictionaryService.reloadAndRefresh(() => {
                        this.dataTrackService.refreshDatatracksList_fromBackend();
                    }, null, DictionaryService.GENOME_BUILD);
                }
                this.dialogRef.close(true);
            } else {
                let message: string = "";
                if (response && response.message) {
                    message = ": " + response.message;
                }
                this.dialogsService.confirm("An error occurred while saving genome build" + message, null);
            }
        });
    }

}
