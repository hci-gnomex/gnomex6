
import {ChangeDetectionStrategy, Component, EventEmitter, OnDestroy, OnInit, Output} from "@angular/core";
import {FormGroup,FormBuilder,Validators } from "@angular/forms"
import {PrimaryTab} from "../../util/tabs/primary-tab.component"
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {URLSearchParams} from "@angular/http";
import {AnalysisService} from "../../services/analysis.service";
import {Subscription} from "rxjs";
import {distinctUntilChanged, first} from "rxjs/operators";
import {HttpParams} from "@angular/common/http";
import {IGnomexErrorResponse} from "../../util/interfaces/gnomex-error.response.model";
import {DialogsService} from "../../util/popup/dialogs.service";


@Component({

    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'analysis-group-tab',
    templateUrl: './analysis-group.component.html',
    styles:[`        
        .error-message{
            color: red;
        }
        
        
        
        
        

    `]
})
export class AnalysisGroupComponent implements OnInit,OnDestroy{
    public readonly name="group";
    @Output() saveSuccess = new EventEmitter();
    private projectBrowseForm: FormGroup;
    project:any;
    formInit:boolean = false;
    private saveManagerSubscription: Subscription;

    //[(ngModel)]="description"




    constructor(protected fb: FormBuilder,private analysisService:AnalysisService,
                private dialogService: DialogsService,
                private route:ActivatedRoute,private router:Router) {
    }

    ngOnInit(){
        this.projectBrowseForm = this.fb.group({
            name: ['', Validators.required],
            description: ['', Validators.maxLength(500)]
        });

        this.projectBrowseForm.valueChanges.subscribe(val =>{
            if(this.formInit){
                this.analysisService.dirty = true;
            }
        });

        this.route.data.forEach((data: any) => {  // need to update data when url changes
            this.formInit = false;
            if(data.analysisGroup){ // save new project from tree will make data null since nothing is happening on the route but its refreshing
                let ag = data['analysisGroup'];
                this.project= ag["AnalysisGroup"];
                this.projectBrowseForm.get("description").setValue(this.project["description"]);
                this.projectBrowseForm.get("name").setValue(this.project["name"]);
                this.formInit = true;
            }
        });
        // when save is selected in parent
        this.saveManagerSubscription = this.analysisService.getSaveMangerObservable()
            .subscribe(saveType =>{
                if(this.name === saveType){
                    this.save();
                }});
        this.projectBrowseForm.statusChanges.pipe(distinctUntilChanged())
            .subscribe(status =>{
                if(status === "VALID"){
                    this.analysisService.invalid = false;
                }else{
                    this.analysisService.invalid = true;
                }
            });


    }

    save(){

        let saveParams: HttpParams = new HttpParams();
        let getParams: HttpParams = new HttpParams();

        let idLab = this.route.snapshot.paramMap.get("idLab");
        let idAnalysisGroup = this.route.snapshot.paramMap.get("idAnalysisGroup");
        getParams = getParams.set("idLab",idLab);
        getParams = getParams.set("idAnalysisGroup",idAnalysisGroup);


        this.project.name = this.projectBrowseForm.controls['name'].value;
        this.project.description = this.projectBrowseForm.controls['description'].value;

        saveParams = saveParams.set("idLab", idLab);
        saveParams = saveParams.set("idAnalysisGroup",idAnalysisGroup);
        saveParams = saveParams.set("name",this.project.name);
        saveParams = saveParams.set("description", this.project.description);

        getParams = getParams.set("idAnalysisGroup",idAnalysisGroup);

        this.analysisService.saveAnalysisGroup(saveParams).pipe(first()).subscribe(response =>{
            this.analysisService.refreshAnalysisGroupList_fromBackend();
            this.saveSuccess.emit();
            this.formInit = false;

            this.analysisService.getAnalysisGroup(getParams).pipe(first()).subscribe(response =>{
                this.projectBrowseForm.get("name").setValue( response["AnalysisGroup"].name);
                this.projectBrowseForm.get("description").setValue( response["AnalysisGroup"].description);
            });
        }, (err:IGnomexErrorResponse) => {
            this.dialogService.alert(err.gError.message);
        });

    }

    ngOnDestroy(){
        this.saveManagerSubscription.unsubscribe();
    }

}
