import {
    AfterViewInit,
    Component,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    ViewChild,
} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms"
import {ActivatedRoute} from "@angular/router";

import {AngularEditorComponent, AngularEditorConfig} from "@kolkov/angular-editor";
import {ConstantsService} from "../../services/constants.service";
import {GnomexService} from "../../services/gnomex.service";
import {PropertyService} from "../../services/property.service";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {ExperimentsService} from "../experiments.service";

export const EDITOR_HEIGHT = Object.freeze({
    HEIGHT_MAX: "50em",
    HEIGHT_BIGGER: "25em",
    HEIGHT_BIG: "15em",
    HEIGHT_MID: "14em",
    HEIGHT_SMALL: "10em",
    HEIGHT_MIN: "8em",
    HEIGHT_ZERO: "0"
});

export const FONT_FAMILY = [
    {class: "arial", name: "Arial"},
    {class: "courier-new", name: "Courier New"},
    {class: "georgia", name: "Georgia"},
    {class: "times-new-roman", name: "Times New Roman"},
];

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
            margin-top: 0.5rem;
        }

        .label-width {
            width: 8rem;
        }

        .field-width {
            width: 33rem;
        }
    `]

})
export class DescriptionTabComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
    
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
        height: "100%",
        minHeight: "5em",
        maxHeight: "100%",
        width: "100%",
        minWidth: "5em",
        enableToolbar: true,
        defaultFontName: "Arial",
        defaultFontSize: "2",
        fonts: FONT_FAMILY,
    };
    
    notesEditorConfig: AngularEditorConfig = {
        spellcheck: true,
        height: "100%",
        minHeight: "5em",
        maxHeight: "100%",
        width: "100%",
        minWidth: "5em",
        enableToolbar: true,
        defaultFontName: "Arial",
        defaultFontSize: "2",
        fonts: FONT_FAMILY,
    };
    
    projectDescEditorConfig: AngularEditorConfig = {
        spellcheck: true,
        height: "100%",
        minHeight: "5em",
        maxHeight: "100%",
        width: "100%",
        minWidth: "5em",
        enableToolbar: true,
        defaultFontName: "Arial",
        defaultFontSize: "2",
        fonts: FONT_FAMILY,
    };

    adminNotesEditorConfig: AngularEditorConfig = {
        spellcheck: true,
        height: "100%",
        minHeight: "5em",
        maxHeight: "100%",
        width: "100%",
        minWidth: "5em",
        enableToolbar: true,
        defaultFontName: "Arial",
        defaultFontSize: "2",
        fonts: FONT_FAMILY,
    };
    
    private experiment:any;
    private numEditors: number;
    private editorHeight: string = "";
    private editorMinorHeight: string = "";
    

    constructor(private fb: FormBuilder,
                public constantsService:ConstantsService,
                private secAdvisor: CreateSecurityAdvisorService,
                private gnomexService: GnomexService,
                private experimentService: ExperimentsService,
                private route:ActivatedRoute) {
    }


    ngOnInit(){
        this.descriptionForm = this.fb.group({
            expName: [{value: "", disabled: true}, Validators.maxLength(this.constantsService.MAX_LENGTH_200)],
            description: [{value: "", disabled: true}, Validators.maxLength(this.constantsService.MAX_LENGTH_5000)],
            projectDesc: [{value: "", disabled: true}, Validators.maxLength(this.constantsService.MAX_LENGTH_4000)],
            notesForCoreFacility: [{value: "", disabled: true}, Validators.maxLength(this.constantsService.MAX_LENGTH_5000)],
            adminNotes: [{value: "", disabled: true}, Validators.maxLength(this.constantsService.MAX_LENGTH_5000)],
        });
        
        this.route.data.forEach(data => {
            let exp = data.experiment;
            if(exp && exp.Request){
                this.experiment = exp.Request;
                this.descriptionForm.get("expName").setValue( this.experiment.name);
                this.descriptionForm.get("description").setValue( this.experiment.description);
    
                this.showNotesForCoreFacility = false;
                if(this.experiment.isExternal === "Y" && this.experiment.corePrepInstructions !== "") {
                    this.showNotesForCoreFacility = false;
                } else {
                    this.showNotesForCoreFacility = true;
                    this.descriptionForm.get("notesForCoreFacility").setValue( this.experiment.corePrepInstructions);
                }
    
                this.showProjectDesc = false;
                if(this.experiment.projectDescription && this.experiment.projectDescription !== "") {
                    this.showProjectDesc = true;
                    this.descriptionForm.get("projectDesc").setValue(this.experiment.projectDescription);
                }
    
                let showAdminNotesOnRequest = this.gnomexService.getCoreFacilityProperty(this.experiment.idCoreFacility, PropertyService.SHOW_ADMIN_NOTES_ON_REQUEST);
                this.showAdminNotes = this.secAdvisor.isAdmin && showAdminNotesOnRequest === "Y";
                if (this.showAdminNotes) {
                    this.descriptionForm.get("adminNotes").setValue( this.experiment.adminNotes);
                }
                
                this.numEditors = this.getShowEditors();
    
                setTimeout( () => {
                    this.updateForm();
                });
                
            }
    
        });
    }

    ngAfterViewInit(){
    }
    
    ngOnChanges(changes: SimpleChanges): void {
        if (this.experimentService.modeChangedExperiment && this.experiment && this.experimentService.modeChangedExperiment.number === this.experiment.number) {
            if (!changes["editMode"].isFirstChange()) {
                this.updateForm();
            }
        }
    }
    
    ngOnDestroy() {
        this.experimentService.modeChangedExperiment = undefined;
        this.experimentService.setEditMode(false);
    }
    
    updateForm() {
        this.getEditorHeight();
        
        if (this.editMode) {
            this.descriptionForm.get("expName").enable();
            this.descriptionForm.get("description").enable();
            this.descEditor.editorToolbar.showToolbar = true;
            this.descEditorConfig.editable = true;
            this.descEditorConfig.height = this.editorHeight;
            this.descEditorConfig.maxHeight = this.editorHeight;
            
            if(this.showProjectDesc) {
                this.descriptionForm.get("projectDesc").enable();
                this.projectDescEditor.editorToolbar.showToolbar = true;
                this.projectDescEditorConfig.editable = true;
                this.projectDescEditorConfig.height = this.editorMinorHeight;
                this.projectDescEditorConfig.maxHeight = this.editorMinorHeight;
            }
            if(this.showNotesForCoreFacility) {
                this.descriptionForm.get("notesForCoreFacility").enable();
                this.notesEditor.editorToolbar.showToolbar = true;
                this.notesEditorConfig.editable = true;
                this.notesEditorConfig.height = this.editorMinorHeight;
                this.notesEditorConfig.maxHeight = this.editorMinorHeight;
            }
            
            if(this.showAdminNotes) {
                this.descriptionForm.get("adminNotes").enable();
                this.adminNotesEditor.editorToolbar.showToolbar = true;
                this.adminNotesEditorConfig.editable = true;
                this.adminNotesEditorConfig.height = this.editorMinorHeight;
                this.adminNotesEditorConfig.maxHeight = this.editorMinorHeight;
            }
            
        } else {
            this.descriptionForm.get("expName").setValue( this.experiment.name);
            this.descriptionForm.get("description").setValue(this.experiment.description);
            
            this.descriptionForm.get("expName").disable();
            this.descriptionForm.get("description").disable();
            
            this.descEditor.editorToolbar.showToolbar = false;
            this.descEditorConfig.editable = false;
            this.descEditorConfig.height = this.editorHeight;
            this.descEditorConfig.maxHeight = this.editorHeight;
            
            if(this.showProjectDesc) {
                this.descriptionForm.get("projectDesc").setValue(this.experiment.projectDescription);
                this.descriptionForm.get("projectDesc").disable();
                this.projectDescEditor.editorToolbar.showToolbar = false;
                this.projectDescEditorConfig.editable = false;
                this.projectDescEditorConfig.height = this.editorMinorHeight;
                this.projectDescEditorConfig.maxHeight = this.editorMinorHeight;
            }
            
            if(this.showNotesForCoreFacility) {
                this.descriptionForm.get("notesForCoreFacility").setValue( this.experiment.corePrepInstructions);
                this.descriptionForm.get("notesForCoreFacility").disable();
                this.notesEditor.editorToolbar.showToolbar = false;
                this.notesEditorConfig.editable = false;
                this.notesEditorConfig.height = this.editorMinorHeight;
                this.notesEditorConfig.maxHeight = this.editorMinorHeight;
            }
            
            if(this.showAdminNotes) {
                this.descriptionForm.get("adminNotes").setValue(this.experiment.adminNotes);
                this.descriptionForm.get("adminNotes").disable();
                this.adminNotesEditor.editorToolbar.showToolbar = false;
                this.adminNotesEditorConfig.editable = false;
                this.adminNotesEditorConfig.height = this.editorMinorHeight;
                this.adminNotesEditorConfig.maxHeight = this.editorMinorHeight;
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
        this.editorHeight = "";
        this.editorMinorHeight = "";
        
        switch (this.numEditors) {
            case 1:
                this.editorHeight = EDITOR_HEIGHT.HEIGHT_MAX;
                this.editorMinorHeight = EDITOR_HEIGHT.HEIGHT_ZERO;
                break;
            case 2:
                this.editorHeight = this.editMode ? EDITOR_HEIGHT.HEIGHT_BIGGER : EDITOR_HEIGHT.HEIGHT_BIGGER;
                this.editorMinorHeight = this.editMode ? EDITOR_HEIGHT.HEIGHT_MID : EDITOR_HEIGHT.HEIGHT_BIGGER;
                break;
            case 3:
                this.editorHeight = this.editMode ? EDITOR_HEIGHT.HEIGHT_BIGGER : EDITOR_HEIGHT.HEIGHT_BIG;
                this.editorMinorHeight = this.editMode ? EDITOR_HEIGHT.HEIGHT_MIN : EDITOR_HEIGHT.HEIGHT_BIG;
                break;
            case 4:
                this.editorHeight = this.editMode ? EDITOR_HEIGHT.HEIGHT_BIGGER : EDITOR_HEIGHT.HEIGHT_MID;
                this.editorMinorHeight = this.editMode ? EDITOR_HEIGHT.HEIGHT_MIN : EDITOR_HEIGHT.HEIGHT_SMALL;
                break;
            default: //Do nothing
        }
    }

}
