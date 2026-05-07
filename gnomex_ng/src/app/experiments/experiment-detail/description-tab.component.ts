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
import { HttpClientModule} from '@angular/common/http';
import {AngularEditorComponent, AngularEditorConfig} from "@kolkov/angular-editor";
import {ConstantsService} from "../../services/constants.service";
import {GnomexService} from "../../services/gnomex.service";
import {PropertyService} from "../../services/property.service";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {ExperimentsService} from "../experiments.service";

export const EDITOR_HEIGHT = Object.freeze({
    HEIGHT_MAX: "48em",
    HEIGHT_BIGGER: "22em",
    HEIGHT_BIG: "14em",
    HEIGHT_MID: "11em",
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
    styleUrls: ["./description-tab.component.scss"]

})
export class DescriptionTabComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {

    @Input() editMode: boolean;

    @ViewChild("descEditorRef", {static: false}) descEditor: AngularEditorComponent;
    @ViewChild("notesEditorRef", {static: false}) notesEditor: AngularEditorComponent;
    @ViewChild("projectDescEditorRef", {static: false}) projectDescEditor: AngularEditorComponent;
    @ViewChild("adminNotesEditorRef", {static: false}) adminNotesEditor: AngularEditorComponent;

    private _showProjectDesc: boolean = false;
    public showCorePrepInstructions: boolean = false;
    public showAdminNotes: boolean = false;
    public get showProjectDesc(): boolean {
        return this._showProjectDesc && !this.editMode;
    }

    descriptionForm:FormGroup;

    descEditorConfig: AngularEditorConfig = {
        spellcheck: true,
        height: "100%",
        minHeight: "5em",
        maxHeight: "100%",
        width: "100%",
        minWidth: "5em",
        enableToolbar: false,
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
        enableToolbar: false,
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
        showToolbar: false,
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
        enableToolbar: false,
        defaultFontName: "Arial",
        defaultFontSize: "2",
        fonts: FONT_FAMILY,
    };

    private experiment:any;
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
            name: ["", Validators.maxLength(this.constantsService.MAX_LENGTH_200)],
            description: [{value: "", disabled: true}, Validators.maxLength(this.constantsService.MAX_LENGTH_5000)],
            projectDescription: [{value: "", disabled: true}],
            corePrepInstructions: [{value: "", disabled: true}, Validators.maxLength(this.constantsService.MAX_LENGTH_5000)],
            adminNotes: [{value: "", disabled: true}, Validators.maxLength(this.constantsService.MAX_LENGTH_5000)],
        });
        this.experimentService.addExperimentOverviewFormMember(this.descriptionForm, this.constructor.name);

        this.route.data.forEach(data => {
            let exp = data.experiment;
            if(exp && exp.Request){
                this.experiment = exp.Request;
                this.descriptionForm.get("name").setValue( this.experiment.name);
                this.descriptionForm.get("description").setValue( this.experiment.description);

                this.showCorePrepInstructions = false;
                if(this.experiment.isExternal === "Y" && this.experiment.corePrepInstructions === "") {
                    this.showCorePrepInstructions = false;
                } else {
                    this.showCorePrepInstructions = true;
                    this.descriptionForm.get("corePrepInstructions").setValue( this.experiment.corePrepInstructions);
                }

                this._showProjectDesc = false;
                if(this.experiment.projectDescription && this.experiment.projectDescription !== "") {
                    this._showProjectDesc = true;
                    this.descriptionForm.get("projectDescription").setValue(this.experiment.projectDescription);
                }

                let showAdminNotesOnRequest = this.gnomexService.getCoreFacilityProperty(this.experiment.idCoreFacility, PropertyService.SHOW_ADMIN_NOTES_ON_REQUEST);
                this.showAdminNotes = this.secAdvisor.isAdmin && showAdminNotesOnRequest === "Y";
                if (this.showAdminNotes) {
                    this.descriptionForm.get("adminNotes").setValue( this.experiment.adminNotes);
                }


            }

        });
    }

    ngAfterViewInit() {
      setTimeout( () => {
        this.updateForm();
      });
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
            this.descriptionForm.get("description").enable();
            this.descEditor.editorToolbar.showToolbar = true;
            this.descEditorConfig.editable = true;
            this.descEditorConfig.height = this.editorHeight;
            this.descEditorConfig.maxHeight = this.editorHeight;

            if(this.showCorePrepInstructions) {
                this.descriptionForm.get("corePrepInstructions").enable();
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
            this.descriptionForm.get("name").setValue( this.experiment.name);
            this.descriptionForm.get("description").setValue(this.experiment.description);

            this.descriptionForm.get("description").disable();

            this.descEditor.editorToolbar.showToolbar = false;
            this.descEditorConfig.editable = false;
            this.descEditorConfig.height = this.editorHeight;
            this.descEditorConfig.maxHeight = this.editorHeight;

            if(this._showProjectDesc) {
                this.projectDescEditorConfig.height = this.editorMinorHeight;
                this.projectDescEditorConfig.maxHeight = this.editorMinorHeight;
            }

            if(this.showCorePrepInstructions) {
                this.descriptionForm.get("corePrepInstructions").setValue( this.experiment.corePrepInstructions);
                this.descriptionForm.get("corePrepInstructions").disable();
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
        } // else if editMode
    }

    private getShowEditors(): number {
        let editorNum: number = 1;
        if (this.showCorePrepInstructions) {
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

    private getEditorHeight(): void {
        this.editorHeight = "";
        this.editorMinorHeight = "";

        let numEditors: number = this.getShowEditors();
        switch (numEditors) {
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
