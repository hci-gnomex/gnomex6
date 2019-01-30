import {
    AfterViewInit,
    Component,
    Input,
    OnChanges,
    OnInit,
    ViewChild,
    SimpleChanges,
} from "@angular/core";
import {FormGroup,FormBuilder,Validators } from "@angular/forms"
import {ActivatedRoute} from "@angular/router";

import {AngularEditorComponent, AngularEditorConfig} from "@kolkov/angular-editor";
import {ConstantsService} from "../../services/constants.service";
import {GnomexService} from "../../services/gnomex.service";
import {PropertyService} from "../../services/property.service";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";

export const EDITOR_HEIGHT = Object.freeze({
    HEIGHT_600: "600px",
    HEIGHT_500: "500px",
    HEIGHT_400: "400px",
    HEIGHT_300: "300px",
    HEIGHT_200: "200px",
    HEIGHT_250: "250px",
    HEIGHT_150: "150px",
    HEIGHT_100: "100px",
    HEIGHT_50: "50px",
    HEIGHT_0: "0"
});

@Component({
    selector: "description-tab",
    templateUrl: "./description-tab.component.html",
    styles:[`

        :host /deep/ angular-editor#descEditor #editor,
        :host /deep/ angular-editor#notesEditor #editor,
        :host /deep/ angular-editor#projectDescEditor #editor,
        :host /deep/ angular-editor#adminNotesEditor #editor {
            resize: none;
        }
        
        :host /deep/ angular-editor#descEditor .angular-editor-button[title="Insert Image"] {
            display: none;
        }

        :host /deep/ angular-editor#notesEditor .angular-editor-button[title="Insert Image"],
        :host /deep/ angular-editor#notesEditor .angular-editor-button[title="Unlink"],
        :host /deep/ angular-editor#notesEditor .angular-editor-button[title="Horizontal Line"],
        :host /deep/ angular-editor#notesEditor #strikeThrough-notesEditor,
        :host /deep/ angular-editor#notesEditor #subscript-notesEditor,
        :host /deep/ angular-editor#notesEditor #superscript-notesEditor,
        :host /deep/ angular-editor#notesEditor #link-notesEditor,
        :host /deep/ angular-editor#notesEditor #underline-notesEditor,
        :host /deep/ angular-editor#notesEditor #justifyLeft-notesEditor,
        :host /deep/ angular-editor#notesEditor #justifyCenter-notesEditor,
        :host /deep/ angular-editor#notesEditor #justifyRight-notesEditor,
        :host /deep/ angular-editor#notesEditor #justifyFull-notesEditor,
        :host /deep/ angular-editor#notesEditor #foregroundColorPicker-notesEditor,
        :host /deep/ angular-editor#notesEditor #backgroundColorPicker-notesEditor,
        :host /deep/ angular-editor#notesEditor #toggleEditorMode-notesEditor,
        :host /deep/ angular-editor#notesEditor #customClassSelector-notesEditor {
            display: none;
        }
        
        :host /deep/ angular-editor#projectDescEditor .angular-editor-button[title="Insert Image"],
        :host /deep/ angular-editor#projectDescEditor .angular-editor-button[title="Unlink"],
        :host /deep/ angular-editor#projectDescEditor .angular-editor-button[title="Horizontal Line"],
        :host /deep/ angular-editor#projectDescEditor #strikeThrough-projectDescEditor,
        :host /deep/ angular-editor#projectDescEditor #subscript-projectDescEditor,
        :host /deep/ angular-editor#projectDescEditor #superscript-projectDescEditor,
        :host /deep/ angular-editor#projectDescEditor #link-projectDescEditor,
        :host /deep/ angular-editor#projectDescEditor #underline-projectDescEditor,
        :host /deep/ angular-editor#projectDescEditor #justifyLeft-projectDescEditor,
        :host /deep/ angular-editor#projectDescEditor #justifyCenter-projectDescEditor,
        :host /deep/ angular-editor#projectDescEditor #justifyRight-projectDescEditor,
        :host /deep/ angular-editor#projectDescEditor #justifyFull-projectDescEditor,
        :host /deep/ angular-editor#projectDescEditor #foregroundColorPicker-projectDescEditor,
        :host /deep/ angular-editor#projectDescEditor #backgroundColorPicker-projectDescEditor,
        :host /deep/ angular-editor#projectDescEditor #toggleEditorMode-projectDescEditor,
        :host /deep/ angular-editor#projectDescEditor #customClassSelector-projectDescEditor {
            display: none;
        }
        
        :host /deep/ angular-editor#adminNotesEditor .angular-editor-button[title="Insert Image"],
        :host /deep/ angular-editor#adminNotesEditor .angular-editor-button[title="Unlink"],
        :host /deep/ angular-editor#adminNotesEditor .angular-editor-button[title="Horizontal Line"],
        :host /deep/ angular-editor#adminNotesEditor #strikeThrough-adminNotesEditor,
        :host /deep/ angular-editor#adminNotesEditor #subscript-adminNotesEditor,
        :host /deep/ angular-editor#adminNotesEditor #superscript-adminNotesEditor,
        :host /deep/ angular-editor#adminNotesEditor #link-adminNotesEditor,
        :host /deep/ angular-editor#adminNotesEditor #underline-adminNotesEditor,
        :host /deep/ angular-editor#adminNotesEditor #justifyLeft-adminNotesEditor,
        :host /deep/ angular-editor#adminNotesEditor #justifyCenter-adminNotesEditor,
        :host /deep/ angular-editor#adminNotesEditor #justifyRight-adminNotesEditor,
        :host /deep/ angular-editor#adminNotesEditor #justifyFull-adminNotesEditor,
        :host /deep/ angular-editor#adminNotesEditor #foregroundColorPicker-adminNotesEditor,
        :host /deep/ angular-editor#adminNotesEditor #backgroundColorPicker-adminNotesEditor,
        :host /deep/ angular-editor#adminNotesEditor #toggleEditorMode-adminNotesEditor,
        :host /deep/ angular-editor#adminNotesEditor #customClassSelector-adminNotesEditor {
            display: none;
        }

        .gx-label{
            color: darkblue;
            margin: 0;
        }

        .label-width {
            width: 8rem;
        }

        .field-width {
            width: 33rem;
        }
    `]

})
export class DescriptionTabComponent implements OnInit, AfterViewInit, OnChanges {
    
    @Input() editMode: boolean;
    
    @ViewChild("descEditorRef") descEditor: AngularEditorComponent;
    @ViewChild("notesEditorRef") notesEditor: AngularEditorComponent;
    @ViewChild("projectDescEditorRef") projectDescEditor: AngularEditorComponent;
    @ViewChild("adminNotesEditorRef") adminNotesEditor: AngularEditorComponent;
    
    public showProjectDesc: boolean = false;
    public showNotesForCoreFacility: boolean = false;
    public showAdminNotes: boolean = false;
    
    descriptionForm:FormGroup;
    
    descEditorConfig: AngularEditorConfig = {
        spellcheck: true,
        height: "300px",
        minHeight: "5rem",
        maxHeight: "300px",
        width: "100%",
        minWidth: "5rem",
        enableToolbar: true,
        defaultFontName: "Arial",
        defaultFontSize: "7",
        fonts: [
            {class: "arial", name: "Arial"},
            {class: "times-new-roman", name: "Times New Roman"},
            {class: "courier-new", name: "Courier New"},
            {class: "georgia", name: "Georgia"},
        ],
    };
    
    notesEditorConfig: AngularEditorConfig = {
        spellcheck: true,
        height: "300px",
        minHeight: "5rem",
        maxHeight: "300px",
        width: "100%",
        minWidth: "5rem",
        enableToolbar: true,
        defaultFontName: "Arial",
        defaultFontSize: "7",
        fonts: [
            {class: "arial", name: "Arial"},
            {class: "times-new-roman", name: "Times New Roman"},
            {class: "courier-new", name: "Courier New"},
            {class: "georgia", name: "Georgia"},
        ],
    };
    
    projectDescEditorConfig: AngularEditorConfig = {
        spellcheck: true,
        height: "300px",
        minHeight: "5rem",
        maxHeight: "300px",
        width: "100%",
        minWidth: "5rem",
        enableToolbar: true,
        defaultFontName: "Arial",
        defaultFontSize: "7",
        fonts: [
            {class: "arial", name: "Arial"},
            {class: "times-new-roman", name: "Times New Roman"},
            {class: "courier-new", name: "Courier New"},
            {class: "georgia", name: "Georgia"},
        ],
    };

    adminNotesEditorConfig: AngularEditorConfig = {
        spellcheck: true,
        height: "300px",
        minHeight: "5rem",
        maxHeight: "300px",
        width: "100%",
        minWidth: "5rem",
        enableToolbar: true,
        defaultFontName: "Arial",
        defaultFontSize: "7",
        fonts: [
            {class: "arial", name: "Arial"},
            {class: "times-new-roman", name: "Times New Roman"},
            {class: "courier-new", name: "Courier New"},
            {class: "georgia", name: "Georgia"},
        ],
    };
    
    private experiment:any;
    public showEditors: number;
    private viewHeight: string = "";
    private viewMinorHeight: string = "";
    private editHeight: string = "";
    private editMinorHeight: string = "";
    


    constructor(private fb: FormBuilder,
                private constantsService:ConstantsService,
                private secAdvisor: CreateSecurityAdvisorService,
                private gnomexService: GnomexService,
                private route:ActivatedRoute) {
    }


    ngOnInit(){
        this.descriptionForm = this.fb.group({
            expName: [{value: "", disabled: true}, Validators.maxLength(200)],
            description: [{value: "", disabled: true}, Validators.maxLength(this.constantsService.MAX_CHARS)],
            projectDesc: [{value: "", disabled: true}, Validators.maxLength(this.constantsService.MAX_CHARS)],
            notesForCoreFacility: [{value: "", disabled: true}, Validators.maxLength(this.constantsService.MAX_CHARS)],
            adminNotes: [{value: "", disabled: true}, Validators.maxLength(this.constantsService.MAX_CHARS)],
        });
        
        this.route.data.forEach(data => {
            let exp = data.experiment;
            if(exp && exp.Request){
                this.experiment = exp.Request;
                this.descriptionForm.get("expName").setValue( this.experiment.name);
                this.descriptionForm.get("description").setValue( this.experiment.description);
                
                if(this.experiment.isExternal === "Y" && !this.experiment.corePrepInstructions) {
                    this.showNotesForCoreFacility = false;
                } else {
                    this.showNotesForCoreFacility = true;
                    this.descriptionForm.get("notesForCoreFacility").setValue( this.experiment.corePrepInstructions);
                }
    
                if(this.experiment.projectDescription) {
                    this.showProjectDesc = true;
                    this.descriptionForm.get("projectDesc").setValue(this.experiment.projectDescription);
                }
    
                let showAdminNotesOnRequest = this.gnomexService.getCoreFacilityProperty(this.experiment.idCoreFacility, PropertyService.SHOW_ADMIN_NOTES_ON_REQUEST);
                this.showAdminNotes = this.secAdvisor.isAdmin && showAdminNotesOnRequest === "Y";
                if (this.showAdminNotes) {
                    this.descriptionForm.get("adminNotes").setValue( this.experiment.adminNotes);
                }
                
                this.showEditors = this.getShowEditors();
                this.getEditorHeight();
            }
    
            setTimeout( () => {
                this.updateForm();
            });
        });
    }

    ngAfterViewInit(){
    }
    
    ngOnChanges(changes: SimpleChanges): void {
        if(!changes["editMode"].isFirstChange()) {
            this.updateForm();
        }
    }
    
    updateForm() {
        if (this.editMode) {
            this.descriptionForm.get("expName").enable();
            this.descriptionForm.get("description").enable();
            this.descEditor.editorToolbar.showToolbar = true;
            this.descEditorConfig.editable = true;
            this.descEditorConfig.maxHeight = this.editHeight;
            
            if(this.showProjectDesc) {
                this.descriptionForm.get("projectDesc").enable();
                this.projectDescEditor.editorToolbar.showToolbar = true;
                this.projectDescEditorConfig.editable = true;
                this.projectDescEditorConfig.maxHeight = this.editMinorHeight;
            }
            if(this.showNotesForCoreFacility) {
                this.descriptionForm.get("notesForCoreFacility").enable();
                this.notesEditor.editorToolbar.showToolbar = true;
                this.notesEditorConfig.editable = true;
                this.notesEditorConfig.maxHeight = this.editMinorHeight;
            }
            
            if(this.showAdminNotes) {
                this.descriptionForm.get("adminNotes").enable();
                this.adminNotesEditor.editorToolbar.showToolbar = true;
                this.adminNotesEditorConfig.editable = true;
                this.adminNotesEditorConfig.maxHeight = this.editMinorHeight;
            }
            
        } else {
            this.descriptionForm.get("expName").setValue( this.experiment.name);
            this.descriptionForm.get("description").setValue(this.experiment.description);
            
            this.descriptionForm.get("expName").disable();
            this.descriptionForm.get("description").disable();
            
            this.descEditor.editorToolbar.showToolbar = false;
            this.descEditorConfig.editable = false;
            this.descEditorConfig.maxHeight = this.viewHeight;
            
            if(this.showProjectDesc) {
                this.descriptionForm.get("projectDesc").setValue(this.experiment.projectDescription);
                this.descriptionForm.get("projectDesc").disable();
                this.projectDescEditor.editorToolbar.showToolbar = false;
                this.projectDescEditorConfig.editable = false;
                this.projectDescEditorConfig.maxHeight = this.viewMinorHeight;
            }
            
            if(this.showNotesForCoreFacility) {
                this.descriptionForm.get("notesForCoreFacility").setValue( this.experiment.corePrepInstructions);
                this.descriptionForm.get("notesForCoreFacility").disable();
                this.notesEditor.editorToolbar.showToolbar = false;
                this.notesEditorConfig.editable = false;
                this.notesEditorConfig.maxHeight = this.viewMinorHeight;
            }
            
            if(this.showAdminNotes) {
                this.descriptionForm.get("adminNotes").setValue(this.experiment.adminNotes);
                this.descriptionForm.get("adminNotes").disable();
                this.adminNotesEditor.editorToolbar.showToolbar = false;
                this.adminNotesEditorConfig.editable = false;
                this.adminNotesEditorConfig.maxHeight = this.viewMinorHeight;
            }
        }
    }
    
    getShowEditors(): number {
        let editorNum: number = 1;
        if (this.showNotesForCoreFacility) {
            editorNum ++;
        }
        if (this.showProjectDesc) {
            editorNum ++;
        }
        if (this.showAdminNotes) {
            editorNum ++;
        }
        return editorNum;
    }
    
    getEditorHeight(): void {
        this.viewHeight = "";
        this.viewMinorHeight = "";
        this.editHeight = "";
        this.editMinorHeight = "";
        
        switch (this.showEditors) {
            case 1:
                this.viewHeight = EDITOR_HEIGHT.HEIGHT_600;
                this.viewMinorHeight = EDITOR_HEIGHT.HEIGHT_0;
                this.editHeight = EDITOR_HEIGHT.HEIGHT_500;
                this.editMinorHeight = EDITOR_HEIGHT.HEIGHT_0;
                break;
            case 2:
                this.viewHeight = EDITOR_HEIGHT.HEIGHT_300;
                this.viewMinorHeight = EDITOR_HEIGHT.HEIGHT_300;
                this.editHeight = EDITOR_HEIGHT.HEIGHT_400;
                this.editMinorHeight = EDITOR_HEIGHT.HEIGHT_150;
                break;
            case 3:
                this.viewHeight = EDITOR_HEIGHT.HEIGHT_200;
                this.viewMinorHeight = EDITOR_HEIGHT.HEIGHT_200;
                this.editHeight = EDITOR_HEIGHT.HEIGHT_400;
                this.editMinorHeight = EDITOR_HEIGHT.HEIGHT_100;
                break;
            case 4:
                this.viewHeight = EDITOR_HEIGHT.HEIGHT_200;
                this.viewMinorHeight = EDITOR_HEIGHT.HEIGHT_100;
                this.editHeight = EDITOR_HEIGHT.HEIGHT_300;
                this.editMinorHeight = EDITOR_HEIGHT.HEIGHT_50;
                break;
            default: //Do nothing
        }
    }
}
