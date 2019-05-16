import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {FormControl, Validators} from "@angular/forms";
import {ConstantsService} from "../services/constants.service";

@Component({
    template: `
        <div class="full-height full-width flex-container-col">
            <div mat-dialog-title class="no-margin-force no-padding">
                <div class="dialog-header-colors padded">
                    Download Terms
                </div>
            </div>
            <div mat-dialog-content class="full-height padding-small-force no-margin-force flex-container-col-force justify-space-between align-center">
                <div>
                    {{ this.terms }}
                </div>
                <mat-form-field class="full-width">
                    <input matInput placeholder="Email Address" [formControl]="this.emailFC">
                </mat-form-field>
            </div>
            <mat-dialog-actions class="justify-flex-end no-margin-force">
                <button mat-button [disabled]="this.emailFC.invalid" (click)="this.accept()"><img [src]="this.constantsService.ICON_ACCEPT" class="icon">Accept</button>
                <button mat-button mat-dialog-close><img [src]="this.constantsService.ICON_DECLINE" class="icon">Decline</button>
            </mat-dialog-actions>
        </div>
    `,
    styles:[`
        .padding-small-force {
            padding: 1em !important;
        }
        .no-margin-force {
            margin: 0 !important;
        }
        .flex-container-col-force {
            display: flex !important;
            flex-direction: column;
        }
    `]
})
export class GuestTermsDialogComponent implements OnInit {

    public terms: string = "";
    public emailFC: FormControl;

    constructor(private dialogRef: MatDialogRef<GuestTermsDialogComponent>,
                public constantsService: ConstantsService,
                @Inject(MAT_DIALOG_DATA) private data: any) {
    }

    ngOnInit() {
        this.emailFC = new FormControl("", [Validators.required, Validators.email]);
        this.terms = this.data.terms;
    }

    public accept(): void {
        this.dialogRef.close(this.emailFC.value);
    }

}
