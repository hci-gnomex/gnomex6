
import {Component, OnInit, ViewChild,AfterViewInit} from "@angular/core";
import {FormGroup,FormBuilder,Validators } from "@angular/forms"
import {PrimaryTab} from "../../util/tabs/primary-tab.component"
import {DataTrackService} from "../../services/data-track.service";
import {ActivatedRoute} from "@angular/router";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {URLSearchParams} from "@angular/http";
import {specialChars} from "../../util/validators/special-characters.validator";



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
            <save-footer [disableSave]="orgFormGroup.invalid || secAdvisor.isGuest" 
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
export class DatatracksOrganismComponent extends PrimaryTab implements OnInit{
    //Override

    public showSpinner:boolean = false;
    public dirty= false;
    private orgFormGroup: FormGroup;
    private idOrganism:string;


    constructor(protected fb: FormBuilder,private dtService: DataTrackService,
                private route: ActivatedRoute,private secAdvisor: CreateSecurityAdvisorService){
        super(fb);
    }


    ngOnInit():void{ // Note this hook runs once if route changes to another organism you don't recreate component


       this.orgFormGroup=  this.fb.group({
           commonName:[{value:''  , disabled: this.secAdvisor.isGuest}, Validators.maxLength(100)],
           binomialName:[{value:''  , disabled: this.secAdvisor.isGuest}, Validators.maxLength(200)],
           name:[{value:'',disabled: this.secAdvisor.isGuest},[Validators.maxLength(200), Validators.required, specialChars()]],
           NCBITaxID:[{value:''  , disabled: this.secAdvisor.isGuest}, Validators.maxLength(45)],
           isActive:[{value:false  , disabled: this.secAdvisor.isGuest}]

       });
        this.route.paramMap.forEach(params =>{
            let commonName = this.dtService.datatrackListTreeNode.commonName;
            let binomialName = this.dtService.datatrackListTreeNode.binomialName;
            let name = this.dtService.datatrackListTreeNode.name;
            let NCBITaxID =this.dtService.datatrackListTreeNode.NCBITaxID;
            let isActive : boolean = this.dtService.datatrackListTreeNode.isActive  === 'Y';
            this.orgFormGroup.get("commonName").setValue(commonName);
            this.orgFormGroup.get("binomialName").setValue(binomialName);
            this.orgFormGroup.get("name").setValue(name);
            this.orgFormGroup.get("NCBITaxID").setValue(NCBITaxID);
            this.orgFormGroup.get("isActive").setValue(isActive);
            this.orgFormGroup.markAsPristine();


        });


    }

    save():void{
        this.showSpinner = true;

        let params:URLSearchParams = new URLSearchParams();
        let isActiveStr = this.orgFormGroup.get("isActive").value ? 'Y': 'N';
        let idOrganism = this.dtService.datatrackListTreeNode.idOrganism;


        params.set('das2Name',this.orgFormGroup.get("name").value);
        params.set('isActive',isActiveStr);
        params.set('binomialName',this.orgFormGroup.get("binomialName").value);
        params.set('organism',this.orgFormGroup.get("commonName").value);
        params.set('idOrganism',idOrganism);


        this.dtService.saveOrganism(params).subscribe(resp =>{
                this.showSpinner = false;
                this.orgFormGroup.markAsPristine();
                this.dtService.getDatatracksList_fromBackend(this.dtService.previousURLParams);
            })


    }
}




