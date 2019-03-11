import {Component} from '@angular/core';
import {MatDialogRef} from "@angular/material";
import {OrganismService} from "../services/organism.service";
import {HttpParams} from "@angular/common/http";
import {DialogsService} from "./popup/dialogs.service";
import {ConstantsService} from "../services/constants.service";

@Component({
    selector: 'new-organism',
    template: `
        <h1 mat-dialog-title><img [src]="this.constantsService.ICON_ORGANISM" class="icon">New Species</h1>
        <div mat-dialog-content class="content">
            <div class="flex-container-col">
                <mat-form-field>
                    <input matInput [(ngModel)]="commonName" placeholder="Common Name">
                    <mat-hint align="end">Example: Human</mat-hint>
                </mat-form-field>
                <mat-form-field>
                    <input matInput [(ngModel)]="binomialName" placeholder="Binomial Name">
                    <mat-hint align="end">Example: Homo sapiens</mat-hint>
                </mat-form-field>
                <mat-form-field>
                    <input matInput [(ngModel)]="das2Name" placeholder="DAS2 Name">
                    <mat-hint align="end">Example: H_sapiens</mat-hint>
                </mat-form-field>
                <mat-checkbox [(ngModel)]="activeFlag">Active</mat-checkbox>
            </div>
        </div>
        <div mat-dialog-actions>
            <button mat-button *ngIf="!showSpinner && !(commonName === '') && !(binomialName === '') && !(das2Name === '')" (click)="save()">Save</button>
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

export class NewOrganismComponent {

    public commonName: string = "";
    public binomialName: string = "";
    public das2Name: string = "";
    public activeFlag: boolean = true;

    public showSpinner: boolean = false;

    constructor(private dialogRef: MatDialogRef<NewOrganismComponent>,
                private organismService: OrganismService,
                private dialogsService: DialogsService,
                public constantsService: ConstantsService) {
    }

    public save(): void {
        this.showSpinner = true;
        let params: HttpParams = new HttpParams()
            .set("organism", this.commonName)
            .set("binomialName", this.binomialName)
            .set("das2Name", this.das2Name)
            .set("isActive", this.activeFlag ? "Y" : "N");
        this.organismService.saveOrganismNew(params).subscribe((response: any) => {
            this.showSpinner = false;
            if (response && response.result && response.result === 'SUCCESS') {
                this.dialogRef.close(true);
            } else {
                let message: string = "";
                if (response && response.message) {
                    message = ": " + response.message;
                }
                this.dialogsService.confirm("An error occurred while saving organism" + message, null);
            }
        });
    }

}
