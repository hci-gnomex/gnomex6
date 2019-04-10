
import {Component, EventEmitter, OnDestroy, OnInit, Output} from "@angular/core";
import {FormGroup,FormBuilder,Validators } from "@angular/forms"
import {PrimaryTab} from "../../util/tabs/primary-tab.component"
import {ExperimentsService} from "../experiments.service";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {URLSearchParams} from "@angular/http";
import {Subscription} from "rxjs";
import {distinctUntilChanged, first} from "rxjs/operators";
import {HttpParams} from "@angular/common/http";
import {IGnomexErrorResponse} from "../../util/interfaces/gnomex-error.response.model";
import {DialogsService} from "../../util/popup/dialogs.service";


@Component({
    selector: "project-tab",
    templateUrl: './project-browse.component.html',
    styles:[`
      
        .dirtyWithSave{

            display: flex;
            justify-content: space-between;
            margin-left: auto;
            margin-top: 1em;
            margin-bottom:1em;
            padding-left: 1em;
        }
        .error-message{
            color: red;
        }
        .project-field{
            margin: 1em 1em 1em 1em;
            width:100%;
            resize:none;
        }
        
        
        
        

    `]
})
export class ProjectBrowseTab extends PrimaryTab implements OnInit, OnDestroy{
    name="project";
    @Output() saveSuccess = new EventEmitter();
    projectBrowseForm: FormGroup;
    project:any;
    formInit:boolean = false;
    private saveManagerSubscription: Subscription;




    constructor(protected fb: FormBuilder,private experimentsService:ExperimentsService,
                private route:ActivatedRoute,private router:Router,
                private dialogService: DialogsService) {
        super(fb);
    }

    ngOnInit(){
        this.projectBrowseForm = this.fb.group({
            projectName: ['', Validators.required],
            description: ['', Validators.maxLength(500)]
        });
        this.projectBrowseForm.valueChanges.pipe(distinctUntilChanged())
            .subscribe(value => {
                if(this.formInit){
                    this.experimentsService.dirty = true;
                }
            });

        this.route.data.forEach((data) => {  // need to update data when url changes
            this.formInit = false;
            if(data.project){ // save new project from tree will make data null since nothing is happening on the route but its refreshing
                let p = data['project'];
                this.project= p["Project"];
                this.projectBrowseForm.get("description").setValue(this.project["description"]);
                this.projectBrowseForm.get("projectName").setValue(this.project["name"]);
                this.formInit = true;
            }
        });
        // when save is selected in parent
        this.saveManagerSubscription = this.experimentsService.getSaveMangerObservable()
            .subscribe(saveType =>{
                if(this.name === saveType){
                    this.save();
                }});
        this.projectBrowseForm.statusChanges.pipe(distinctUntilChanged())
            .subscribe(status =>{
                if(status === "VALID"){
                    this.experimentsService.invalid = false;
                }else{
                    this.experimentsService.invalid = true;
                }
            });


    }

    save(){

        let saveParams: HttpParams = new HttpParams();
        let getParams: HttpParams = new HttpParams();


        let idLab = this.route.snapshot.paramMap.get("idLab");
        let idProject = this.route.snapshot.paramMap.get("idProject");
        getParams = getParams.set("idLab",idLab);
        getParams = getParams.set("idProject",idProject);


        this.project.name = this.projectBrowseForm.controls['projectName'].value;
        this.project.description = this.projectBrowseForm.controls['description'].value;
        let stringifiedProject = JSON.stringify(this.project);
        saveParams = saveParams.set("projectXMLString", stringifiedProject);
        saveParams = saveParams.set("parseEntries", "Y");

        this.experimentsService.saveProject(saveParams).pipe(first()).subscribe(response =>{
            this.experimentsService.refreshProjectRequestList_fromBackend();
            this.saveSuccess.emit();
            this.formInit = false;

            this.experimentsService.getProject(getParams).pipe(first()).subscribe(response =>{
                this.projectBrowseForm.get("projectName").setValue( response["Project"].name);
                this.projectBrowseForm.get("description").setValue( response["Project"].description);
            }, (err:IGnomexErrorResponse) => {
                this.dialogService.alert(err.gError.message);
            });
        },(err:IGnomexErrorResponse) => {
            this.dialogService.alert(err.gError.message);
        });

    }

    ngOnDestroy(){
        this.saveManagerSubscription.unsubscribe();
    }

}
