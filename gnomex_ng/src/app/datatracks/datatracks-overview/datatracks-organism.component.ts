import {Component, OnDestroy, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DataTrackService} from "../../services/data-track.service";
import {ActivatedRoute} from "@angular/router";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {URLSearchParams} from "@angular/http";
import {specialChars} from "../../util/validators/special-characters.validator";
import {HttpParams} from "@angular/common/http";
import {IGnomexErrorResponse} from "../../util/interfaces/gnomex-error.response.model";
import {DialogsService} from "../../util/popup/dialogs.service";
import {Subscription} from "rxjs";


@Component({

    template: `
        <form class="body-footer-form" (ngSubmit)="save()" [formGroup]="orgFormGroup" >
            <div style="width:100%;">
                <p>
                    <mat-form-field >
                        <input  matInput
                                formControlName="commonName"
                                type="text"
                                placeholder="Common Name"/>
                        <mat-error *ngIf="orgFormGroup.get('commonName').hasError('maxlength')">
                            Your field exceeds 100 characters
                        </mat-error>

                    </mat-form-field>
                </p>
                <p>
                    <mat-form-field >
                        <input  matInput
                                formControlName="binomialName"
                                type="text"
                                placeholder="Binomial Name"/>
                        <mat-error *ngIf="orgFormGroup.get('binomialName').hasError('maxlength')">
                            Your field exceeds 200 characters
                        </mat-error>

                    </mat-form-field>
                </p>
                <p>
                    <mat-form-field >
                        <input  matInput
                                formControlName="name"
                                type="text"
                                placeholder="DAS2 Name"/>
                        <mat-error *ngIf="orgFormGroup.get('name').hasError('specialChars')">
                            DAS2 Name cannot have spaces or special characters
                        </mat-error>
                        <mat-error *ngIf="orgFormGroup.get('name').hasError('maxlength')">
                            Your field exceeds 200 characters
                        </mat-error>

                    </mat-form-field>

                </p>
                <p>
                    <mat-form-field >
                        <input  matInput
                                formControlName="NCBITaxID"
                                type="text"
                                placeholder="NCBI taxonomy ID"/>
                        <mat-error *ngIf="orgFormGroup.get('NCBITaxID').hasError('maxlength')">
                            Your field exceeds 45 characters
                        </mat-error>
                    </mat-form-field>
                </p>
                <p>
                    <mat-checkbox matInput class="example-margin" formControlName="isActive">Active </mat-checkbox>
                </p>

            </div>
            <save-footer [disableSave]="orgFormGroup.invalid || secAdvisor.isGuest || !canWrite"
                         [showSpinner]="showSpinner"
                         [dirty]="orgFormGroup.dirty">
            </save-footer>

        </form>

    `,
    styles: [`
        .body-footer-form{
            display:flex;
            flex-direction: column;
            height:100%;
            width:100%;
            justify-content: space-between;
        }
    `]
})
export class DatatracksOrganismComponent implements OnInit, OnDestroy {
    //Override

    public showSpinner: boolean = false;
    public dirty = false;
    public orgFormGroup: FormGroup;
    public canWrite: boolean = false;
    private datatracksTreeNodeSubscription: Subscription;


    constructor(private fb: FormBuilder, private dtService: DataTrackService,
                private route: ActivatedRoute, public secAdvisor: CreateSecurityAdvisorService,
                private dialogService: DialogsService) {
    }


    ngOnInit(): void { // Note this hook runs once if route changes to another organism you don't recreate component


       this.orgFormGroup =  this.fb.group({
           commonName: [{value: ""  , disabled: this.secAdvisor.isGuest}, Validators.maxLength(100)],
           binomialName: [{value: ""  , disabled: this.secAdvisor.isGuest}, Validators.maxLength(200)],
           name: [{value: "", disabled: this.secAdvisor.isGuest}, [Validators.maxLength(200), Validators.required, specialChars()]],
           NCBITaxID: [{value: ""  , disabled: this.secAdvisor.isGuest}, Validators.maxLength(45)],
           isActive: [{value: false  , disabled: this.secAdvisor.isGuest}]

       });
      this.datatracksTreeNodeSubscription =  this.dtService.datatrackListTreeNodeSubject.subscribe((data)=>{
           if(data){
               let commonName = data.commonName;
               let binomialName = data.binomialName;
               let name = data.name;
               let NCBITaxID = data.NCBITaxID;
               let isActive : boolean = data.isActive  === "Y";
               this.orgFormGroup.get("commonName").setValue(commonName);
               this.orgFormGroup.get("binomialName").setValue(binomialName);
               this.orgFormGroup.get("name").setValue(name);
               this.orgFormGroup.get("NCBITaxID").setValue(NCBITaxID);
               this.orgFormGroup.get("isActive").setValue(isActive);
               this.orgFormGroup.markAsPristine();
               this.canWrite = data.canWrite === "Y";
           }
       });

    }

    save(): void {
        this.showSpinner = true;


        let isActiveStr = this.orgFormGroup.get("isActive").value ? 'Y': 'N';
        let idOrganism = this.dtService.datatrackListTreeNode.idOrganism;

        let params:HttpParams = new HttpParams()
            .set('das2Name',this.orgFormGroup.get("name").value)
            .set('isActive',isActiveStr)
            .set('binomialName',this.orgFormGroup.get("binomialName").value)
            .set('organism',this.orgFormGroup.get("commonName").value)
            .set('idOrganism',idOrganism);


        this.dtService.saveOrganism(params).subscribe(resp =>{
            this.showSpinner = false;
            this.orgFormGroup.markAsPristine();
            this.dtService.activeNodeToSelect = {
                attribute: "idOrganism",
                value: resp.idOrganism
            };
            this.dtService.getDatatracksList_fromBackend(this.dtService.previousURLParams);
        },(err:IGnomexErrorResponse) => {
            this.showSpinner = false;
        });


    }

    ngOnDestroy(): void {
        this.datatracksTreeNodeSubscription.unsubscribe();
    }
}




