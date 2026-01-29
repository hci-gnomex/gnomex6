
import {Component, OnInit, ViewChild,AfterViewInit} from "@angular/core";
import {FormGroup, FormBuilder, Validators, FormControl} from "@angular/forms"
import {PrimaryTab} from "../../../util/tabs/primary-tab.component"
import {ActivatedRoute} from "@angular/router";
import {CreateSecurityAdvisorService} from "../../../services/create-security-advisor.service";
import {GenomeBuildValidateService} from "../../../services/genome-build-validate.service";
import {Subscription} from "rxjs";
import {specialChars} from "../../../util/validators/special-characters.validator";
import {distinctUntilChanged} from "rxjs/operators";



@Component({
    selector: 'gb-detail',
    templateUrl:'./gb-detail-tab.component.html',
    styles: [`
        .form-field{
            margin-left: 1em;
            margin-right: 1em;
            font-size: 1.1rem;
            width:30%;
            resize:none;
        }
    `]

})
export class GBDetailTabComponent extends PrimaryTab implements OnInit{
    //Override
    name = "Detail";
    private formInit = false;
    private dirty = false;
    private genomeBuild: any;
    gbFormGroup:FormGroup;
    private isGuestMode:boolean;
    private validSubscription: Subscription;


    constructor(protected fb: FormBuilder,private route:ActivatedRoute,
                private secAdvisor: CreateSecurityAdvisorService,
                private gbValidateService :GenomeBuildValidateService ){
        super(fb);
    }
    ngOnInit():void{

        this.isGuestMode = this.secAdvisor.isGuest;

        this.gbFormGroup = this.fb.group({
            das2Name: [{value:'',disabled: this.isGuestMode},[Validators.maxLength(200), Validators.required, specialChars()]],
            genomeBuildName: [{value:'', disabled: this.isGuestMode},Validators.maxLength(200)],
            buildDate: [{value:new Date(),disabled:this.isGuestMode}],//this.genomeBuild.buildDate)],
            ucscName: [{value:'', disabled: this.isGuestMode},Validators.maxLength(200)],
            igvName: [{value:'', disabled: this.isGuestMode},Validators.maxLength(200)],
            coordURI: [{value:'', disabled: this.isGuestMode},[Validators.maxLength(2000)]],
            coordVersion: [{value:'', disabled: this.isGuestMode}, Validators.maxLength(50)],
            coordSource: [{value:'', disabled: this.isGuestMode}, Validators.maxLength(50)],
            coordTestRange: [{value:'', disabled: this.isGuestMode}, Validators.maxLength(100)],
            coordAuthority: [{value:'', disabled: this.isGuestMode}, Validators.maxLength(50)],
            isActive:[{value:false, disabled: this.isGuestMode}]

        });

        this.gbFormGroup.valueChanges.pipe(distinctUntilChanged())
            .subscribe(value =>{
                if(this.formInit){
                    this.dirty = true;
                    this.gbValidateService.dirtyNote = this.dirty;

                }
            });

        this.route.data.forEach(data =>{
            this.gbValidateService.resetValidation();
            this.formInit = false;
            this.dirty = false;

            if(data.genomeBuild){ // initial setting of values
                this.genomeBuild = data.genomeBuild;
                this.gbFormGroup.get('das2Name').setValue(this.genomeBuild.das2Name);
                this.gbFormGroup.get('genomeBuildName').setValue(this.genomeBuild.genomeBuildName);
                this.gbFormGroup.get('buildDate').setValue(new Date(this.genomeBuild.buildDate));
                this.gbFormGroup.get('ucscName').setValue(this.genomeBuild.ucscName);
                this.gbFormGroup.get('igvName').setValue(this.genomeBuild.igvName);
                this.gbFormGroup.get('coordURI').setValue(this.genomeBuild.coordURI);
                this.gbFormGroup.get('coordVersion').setValue(this.genomeBuild.coordVersion);
                this.gbFormGroup.get('coordSource').setValue(this.genomeBuild.coordSource);
                this.gbFormGroup.get('coordTestRange').setValue(this.genomeBuild.coordTestRange);
                this.gbFormGroup.get('coordAuthority').setValue(this.genomeBuild.coordAuthority);
                this.gbFormGroup.get('isActive').setValue(this.genomeBuild.isActive === 'Y');
                this.formInit = true;
            }
        });

        this.validSubscription = this.gbValidateService.getValidateGenomeBuildObservable() //  not a async call
            .subscribe(() =>{
                this.gbValidateService.detailsForm = this.gbFormGroup.value;
                if(this.gbFormGroup.invalid){
                    this.gbValidateService.errorMessageList.push("Error(s) on the detail tab.");
                }
            });

    }


}




