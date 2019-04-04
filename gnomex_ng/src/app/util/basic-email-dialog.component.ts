import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {ConstantsService} from "../services/constants.service";

@Component({
    templateUrl: "./basic-email-dialog.component.html",
    styles: [`
        mat-form-field.formField {
            width: 100%;
            margin: 0.25rem 0;
        }

        .no-margin {
            margin: 0;
        }

        .no-padding {
            padding: 0;
        }
    `]
})
export class BasicEmailDialogComponent implements OnInit {

    public showSpinner: boolean = false;
    public emailTitle: string = "";
    public emailGroup: FormGroup;
    public subjectText: string = "";
    private parentComponent: string = "";


    constructor(private dialogRef: MatDialogRef<BasicEmailDialogComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private fb: FormBuilder,
                private secAdvisor: CreateSecurityAdvisorService,
                public constService: ConstantsService) {

        this.emailTitle = data.title;
        this.parentComponent = data.parentComponent;
        this.subjectText = data.subjectText;

    }

    ngOnInit() {
        this.emailGroup = this.fb.group({
            subject: ["", Validators.required],
            fromAddress: [this.secAdvisor.userEmail, [Validators.required, Validators.email]],
            body: ["", Validators.required],

        });

        if(this.parentComponent && this.parentComponent === "Experiment") {
            this.emailGroup.get("subject").setValue(this.subjectText);
            this.emailGroup.get("subject").disable();
        }

    }

    send(data: any) {
        this.showSpinner = true;

        data.value.subject = this.emailGroup.get("subject").value;
        data.value.fromAddress = this.emailGroup.get("fromAddress").value;
        data.value.body = this.emailGroup.get("body").value;
        this.data.saveFn(data.value);
    }
}
