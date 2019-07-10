import {Component, Inject, OnInit} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import {ConstantsService} from "../../services/constants.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {DictionaryService} from "../../services/dictionary.service";
import {ExperimentPlatformService} from "../../services/experiment-platform.service";
import {HttpParams} from "@angular/common/http";
import {DialogsService} from "../../util/popup/dialogs.service";
import {first} from "rxjs/operators";
import {BaseGenericContainerDialog} from "../../util/popup/base-generic-container-dialog";



@Component({
    template: `
        <div class="full-height full-width flex-container-col">

            <form [formGroup]="this.formGroup" style="padding:1em;">

                <mat-form-field class="full-width">
                    <input class="flex-grow" matInput placeholder="Name" formControlName="name">
                    <mat-error *ngIf="this.formGroup?.get('name')?.hasError('required')">
                        This field is required
                    </mat-error>
                </mat-form-field>


                <mat-form-field style="width: 50%;">
                    <input matInput placeholder="Code" formControlName="code">
                </mat-form-field>

                <custom-combo-box placeholder="Type"
                                  displayField="display" [options]="typeList"
                                  [formControlName]="'type'">
                </custom-combo-box>
                <custom-combo-box placeholder="Core Facility"
                                  displayField="display" [options]="coreFacilityList"
                                  [formControlName]="'idCoreFacility'" valueField="value">
                </custom-combo-box>

            </form>

        </div>
    `,
    styles: [``]
})
export class AddExperimentPlatformDialogComponent extends BaseGenericContainerDialog implements OnInit{

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
        super();
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

        this.primaryDisable = (action) => {
            return this.formGroup.invalid;
        };
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
                    this.dialogService.error(resp.message);
                }else{
                    this.expPlatformService.getExperimentPlatformList_fromBackend();
                    this.addFn();
                    this.dialogRef.close();
                }


            }else{
                this.dialogService.error("An error occured please contact GNomEx Support");
            }
        });

    }


    saveChanges(){
        if(!this.formGroup.get('code').value){
            this.dialogService.confirm("If you do not provide a code request category, the system will provide one for you.  Is this okay?", "Code Request Category")
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
