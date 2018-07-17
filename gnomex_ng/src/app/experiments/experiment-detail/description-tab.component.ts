/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {AfterViewInit, Component, Input, OnInit, ViewChild} from "@angular/core";
import {FormGroup,FormBuilder,Validators } from "@angular/forms"
import {PrimaryTab} from "../../util/tabs/primary-tab.component"
import {ExperimentViewService} from "../../services/experiment-view.service";
import {jqxEditorComponent} from "../../../assets/jqwidgets-ts/angular_jqxeditor";
import {ActivatedRoute} from "@angular/router";




@Component({
    selector: "description-tab",
    templateUrl: "./description-tab.component.html",
    styles:[`textarea { resize: none; } `]

})
export class DescriptionTab implements OnInit, AfterViewInit {
    public static readonly tbarSettings:string = "bold italic underline | left center right";
    @ViewChild('editorReference') myEditor: jqxEditorComponent;
    public toolbarSettings:string;

    private experiment:any;
    descriptionForm:FormGroup;
    private _showEditor:boolean = false;
    private _edit:boolean = false;

    private description:string = '';


    @Input() set edit(val:boolean){
        this._edit = val;
        if(this.descriptionForm){
            if(this._edit){
                this.descriptionForm.get("expName").enable();
                this.descriptionForm.get("notesForCore").enable();
                this.toolbarSettings = DescriptionTab.tbarSettings;
            }else{
                this.descriptionForm.get("expName").enable();
                this.descriptionForm.get("notesForCore").enable();
                this.toolbarSettings = '';
            }
        }
    }
    get edit():boolean{
        return this._edit;
    }


    @Input() set showEditor(val:boolean){ // mat-tab removes tab when changing to another tab
        this._showEditor = val;
        if(this.myEditor){
            if(val){
                this.myEditor.val(this.description);
            }else{
                this.description = this.myEditor.val();
            }

        }else{
            setTimeout(()=>{
                if(this.myEditor){
                    if(val){
                        this.myEditor.val(this.description);
                    }else{
                        this.description = this.myEditor.val();
                    }
                }
            });

        }


    }

    get showEditor():boolean{
        return this._showEditor;
    }


    constructor(private fb: FormBuilder,private expViewRules:ExperimentViewService,
                private route:ActivatedRoute) {
    }


    ngOnInit(){
        this.descriptionForm = this.fb.group({
            expName: '',
            notesForCore:['',Validators.maxLength(500)],
        });
        this.toolbarSettings = DescriptionTab.tbarSettings;
        this.route.data.forEach(data => {
            let exp = data.experiment;
            if(exp && exp.Request){
                this.experiment = exp.Request;
                this.descriptionForm.get("expName").setValue( this.experiment.name);
                this.descriptionForm.get("notesForCore").setValue( this.experiment.notes);
                this.description =  this.experiment.description;
                if(this.showEditor){
                    this.myEditor.val(this.description);
                }

                // default is view mode
                this.descriptionForm.get("expName").disable();
                this.descriptionForm.get("notesForCore").disable();
                this.toolbarSettings = "";


            }
        });



    }

    ngAfterViewInit(){
    }


}
