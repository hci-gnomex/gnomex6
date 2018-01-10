
import {Component,OnInit} from "@angular/core";
import {FormGroup,FormBuilder,Validators } from "@angular/forms"
import {PrimaryTab} from "../../util/tabs/primary-tab.component"
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {URLSearchParams} from "@angular/http";
import {AnalysisService} from "../../services/analysis.service";


@Component({
    templateUrl: './analysis-group.component.html',
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
        
        .group-field{
            margin: 1em 1em 1em 1em;
            font-size: 1.1rem;
            width:100%;
            resize:none;
        }
        
        
        
        

    `]
})
export class AnalysisGroupComponent extends PrimaryTab implements OnInit{
    name="Analysis Group";
    description:string="";
    projectName:string="";
    dirty:boolean =false;
    projectBrowseForm: FormGroup;
    project:any;
    formInit:boolean = false;

    //[(ngModel)]="description"




    constructor(protected fb: FormBuilder,private analysisService:AnalysisService,
                private route:ActivatedRoute,private router:Router) {
        super(fb);
    }

    ngOnInit(){
        this.projectBrowseForm = this.fb.group({
            name: ['', Validators.required],
            description: ['', Validators.maxLength(500)]
        });
        this.projectBrowseForm.valueChanges.distinctUntilChanged()
            .subscribe(value => {
                if(this.formInit){
                    this.dirty = true;
                }
            });

        this.route.data.forEach((data) => {  // need to update data when url changes
            this.dirty = false;
            this.formInit = false;
            if(data.analysisGroup){ // save new project from tree will make data null since nothing is happening on the route but its refreshing
                let ag = data['analysisGroup'];
                this.project= ag["AnalysisGroup"];
                this.projectBrowseForm.get("description").setValue(this.project["description"]);
                this.projectBrowseForm.get("name").setValue(this.project["name"]);
                this.formInit = true;
            }
        });


    }

    save(){

        let saveParams: URLSearchParams = new URLSearchParams();
        let getParams: URLSearchParams = new URLSearchParams();

        let idLab = this.route.snapshot.paramMap.get("idLab");
        let idAnalysisGroup = this.route.snapshot.paramMap.get("idAnalysisGroup");
        getParams.set("idLab",idLab);
        getParams.set("idAnalysisGroup",idAnalysisGroup);


        this.project.name = this.projectBrowseForm.controls['name'].value;
        this.project.description = this.projectBrowseForm.controls['description'].value;

        saveParams.set("idLab", idLab);
        saveParams.set("idAnalysisGroup",idAnalysisGroup);
        saveParams.set("name",this.project.name);
        saveParams.set("description", this.project.description);

        getParams.set("idAnalysisGroup",idAnalysisGroup);

        this.analysisService.saveAnalysisGroup(saveParams).first().subscribe(response =>{
            this.analysisService.refreshAnalysisGroupList_fromBackend();
            this.analysisService.getAnalysisGroup(getParams).first().subscribe(response =>{
                this.projectBrowseForm.get("name").setValue( response["AnalysisGroup"].name);
                this.projectBrowseForm.get("description").setValue( response["AnalysisGroup"].description);
                this.dirty = false;
            });
        });

    }

}
