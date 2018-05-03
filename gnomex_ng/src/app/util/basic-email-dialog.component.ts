import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";

@Component({
    templateUrl: './basic-email-dialog.component.html',
    styles:[`
        mat-form-field.formField {
            width: 100%;
            margin: 0.25rem 0;
        }
        div.formField {
            width: 100%;
            margin: 0.25rem 0;
            display: flex;
            flex-direction: row;
        }
        img.icon {
            margin-right: 0.5rem;
        }
    `]
})
export class BasicEmailDialogComponent implements OnInit{

    public showSpinner: boolean = false;
    private emailGroup:FormGroup;



    constructor(private dialogRef: MatDialogRef<BasicEmailDialogComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private fb:FormBuilder,
                private secAdvisor:CreateSecurityAdvisorService) {

    }

    ngOnInit(){
        this.emailGroup = this.fb.group({
            subject:['',Validators.required],
            fromAddress:[this.secAdvisor.userEmail,[Validators.required,Validators.email]],
            body:['',Validators.required]

        });



    }

    send(data:any){
        this.showSpinner = true;
        this.data.saveFn(data);


    }
}