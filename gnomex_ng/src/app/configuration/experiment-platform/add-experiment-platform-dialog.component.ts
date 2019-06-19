import {AfterViewInit, Component, Inject, OnInit, ViewChild} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import {ConstantsService} from "../../services/constants.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {numberRange} from "../../util/validators/number-range-validator";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {DictionaryService} from "../../services/dictionary.service";
import {ExperimentPlatformService} from "../../services/experiment-platform.service";
import {HttpParams} from "@angular/common/http";
import {DialogsService} from "../../util/popup/dialogs.service";
import {first} from "rxjs/operators";



@Component({
    template: `

        <div mat-dialog-title class="padded-outer">
            <div class="dialog-header-colors padded-inner">
                Add Experiment Plaform
            </div>
        </div>
        <div mat-dialog-content style="margin: 0; padding: 0;">

            <form [formGroup]="this.formGroup" style="padding:1em;" class="full-height full-width flex-container-col">

                <mat-form-field>
                    <input class="flex-grow" matInput placeholder="Name" formControlName="name">
                    <mat-error *ngIf="this.formGroup?.get('name')?.hasError('required')">
                        This field is required
                    </mat-error>
                </mat-form-field>


                <mat-form-field class="short-input">
                    <input matInput placeholder="Code" formControlName="code">
                </mat-form-field>

                <custom-combo-box class="medium-form-input" placeholder="Type"
                                  displayField="display" [options]="typeList"
                                  [formControlName]="'type'">
                </custom-combo-box>
                <custom-combo-box class="medium-form-input" placeholder="Core Facility"
                                  displayField="display" [options]="coreFacilityList"
                                  [formControlName]="'idCoreFacility'" valueField="value">
                </custom-combo-box>

            </form>

        </div>
        <div class="padded-outer" mat-dialog-actions align="end">
            <div class="padded-inner">
                <button mat-button [disabled]="formGroup.invalid" (click)="saveChanges()">
                    <img class="icon" [src]="constService.ICON_SAVE" > Save
                </button>
                <button mat-button mat-dialog-close color="accent" > Cancel </button>
            </div>
        </div>


    `,
    styles: [`

        .padded-outer{
            margin:0;
            padding:0;
        }
        .padded-inner{
            padding:0.3em;

        }
        mat-form-field.medium-form-input{
            width: 20em;
            margin-right: 1em;
        }




    `]
})
export class AddExperimentPlatformDialogComponent implements OnInit{

    addFn:any;
    formGroup:FormGroup;
    typeList:any[] = [];
    coreFacilityList:any[]=[];
    icon:string='';

    constructor(private dialogRef: MatDialogRef<AddExperimentPlatformDialogComponent>,
                public constService:ConstantsService,private fb:FormBuilder,
                private dictionaryService: DictionaryService,
                private secAdvisor: CreateSecurityAdvisorService,
                private expPlatformService: ExperimentPlatformService,
                private dialogService:DialogsService,
                @Inject(MAT_DIALOG_DATA) private data) {
        this.addFn = this.data.addFn;
    }

    ngOnInit(){

        this.coreFacilityList = this.secAdvisor.coreFacilitiesICanManage;
        this.typeList =  this.dictionaryService.getEntriesExcludeBlank(DictionaryService.REQUEST_CATEGORY_TYPE);

        this.formGroup =  this.fb.group({
            name: ['',Validators.required],
            code: '',
            type: ['', Validators.required],
            idCoreFacility: ['', Validators.required],

        });


    }

    private makeRequest():void {
        let idAppUser:string = this.secAdvisor.hasPermission(CreateSecurityAdvisorService.CAN_WRITE_DICTIONARIES) ? '' : '' +this.secAdvisor.idAppUser;
        let params = new HttpParams()
            .set('idCoreFacility',this.formGroup.get('idCoreFacility').value)
            .set("isActive", 'Y')
            .set("isInternal",'Y')
            .set("isExternal",'Y')
            .set("isClinicalResearch",'N')
            .set("isOwnerOnly",'N')
            .set("requestCategory",this.formGroup.get('name').value)
            .set("newCodeRequestCategory",this.formGroup.get('code').value)
            .set("idAppUser", idAppUser)
            .set("type", this.formGroup.get("type").value.value )
            .set('icon',this.formGroup.get("type").value.defaultIcon);


        this.expPlatformService.saveExperimentPlatform(params).pipe(first()).subscribe(resp =>{
            console.log(resp);
            if(resp){ // response is the code request category if successful
                if(resp.message){ // had a known error
                    this.dialogService.alert(resp.message);
                }else{
                    this.expPlatformService.getExperimentPlatformList_fromBackend();
                    this.addFn();
                    this.dialogRef.close();
                }


            }else{
                this.dialogService.alert("An error occured please contact GNomEx Support");
            }
        });

    }


    saveChanges(){
        if(!this.formGroup.get('code').value){
            this.dialogService.confirm("Code Request Category",
                "If you do not provide a code request category, the system will provide one for you.  Is this okay?")
                .subscribe( (answer:boolean) =>{
                    if(answer){
                        this.makeRequest();
                    }
                });
        }else{
            this.makeRequest();
        }

    }






}