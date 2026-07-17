import {Component, Inject, OnInit} from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import {FormControl, Validators} from "@angular/forms";
import {ConstantsService} from "../services/constants.service";
import {BaseGenericContainerDialog} from "./popup/base-generic-container-dialog";

@Component({
    template: `
        <div class="full-height full-width flex-container-col padded" role="dialog" aria-label="Download terms and conditions">
            <div class="full-height padding-small-force no-margin-force flex-container-col-force justify-space-between align-center">
                <div id="terms-content" role="document">
                    {{ this.terms }}
                </div>
                <mat-form-field class="full-width">
                    <input matInput placeholder="Email Address" [formControl]="this.emailFC"
                           aria-label="Email address"
                           aria-required="true"
                           aria-describedby="terms-content">
                </mat-form-field>
            </div>
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
export class GuestTermsDialogComponent extends BaseGenericContainerDialog implements OnInit {

    public terms: string = "";
    public emailFC: FormControl;

    constructor(private dialogRef: MatDialogRef<GuestTermsDialogComponent>,
                public constantsService: ConstantsService,
                @Inject(MAT_DIALOG_DATA) private data: any) {
        super();
    }

    ngOnInit() {
        this.emailFC = new FormControl("", [Validators.required, Validators.email]);
        this.terms = this.data.terms;
        this.primaryDisable = (action) => this.emailFC.invalid;
    }

    public accept(): void {
        this.dialogRef.close(this.emailFC.value);
    }

}
