
import {Component,OnInit} from "@angular/core";
import {FormGroup,FormBuilder,Validators } from "@angular/forms"
import {PrimaryTab} from "../../util/tabs/primary-tab.component"
import {ExperimentsService} from "../experiments.service";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {URLSearchParams} from "@angular/http";


@Component({
    templateUrl: './project-browse.component.html',
    styles:[`
        div div textarea {
            resize: none;
            height: 100%;
            width: 100%;
        }
        .diryWithSave{

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
        
        
        
        

    `]
})
export class ProjectBrowseTab extends PrimaryTab implements OnInit{
    name="Project";
    description:string="";
    projectName:string="";
    dirty:boolean =false;
    projectBrowseForm: FormGroup;
    project:any;
    formInit:boolean = false;

    //[(ngModel)]="description"




    constructor(protected fb: FormBuilder,private experimentsService:ExperimentsService,
                private route:ActivatedRoute,private router:Router) {
        super(fb);
    }

    ngOnInit(){
        this.projectBrowseForm = this.fb.group({
            projectName: ['', Validators.required],
            description: ['', Validators.maxLength(5000)]
        });
        this.projectBrowseForm.valueChanges.distinctUntilChanged()
            .subscribe(value => {
                if(this.formInit){
                    this.dirty = true;
                }
            });

        this.route.data.forEach((data) => {  // need to update data when url changes
            if(data.project){ // save new project from tree will make data null since nothing is happening on the route but its refreshing
                let p = data['project'];
                this.project= p["Project"];
                this.projectBrowseForm.get("description").setValue(this.project["description"]);
                this.projectBrowseForm.get("projectName").setValue(this.project["name"]);
                this.formInit = true;
            }
        });


    }

    save(){

        let saveParams: URLSearchParams = new URLSearchParams();
        let getParams: URLSearchParams = new URLSearchParams();


        let idLab = this.route.snapshot.paramMap.get("idLab");
        let idProject = this.route.snapshot.paramMap.get("idProject");
        getParams.set("idLab",idLab);
        getParams.set("idProject",idProject);


        this.project.name = this.projectBrowseForm.controls['projectName'].value;
        this.project.description = this.projectBrowseForm.controls['description'].value;
        let stringifiedProject = JSON.stringify(this.project);
        saveParams.set("projectXMLString", stringifiedProject);
        saveParams.set("parseEntries", "Y");

        this.experimentsService.saveProject(saveParams).first().subscribe(response =>{
            this.experimentsService.refreshProjectRequestList_fromBackend();
            this.experimentsService.getProject(getParams).first().subscribe(response =>{
                this.projectBrowseForm.get("projectName").setValue( response["Project"].name);
                this.projectBrowseForm.get("description").setValue( response["Project"].description);
                this.dirty = false;
            });
        });

    }

}
