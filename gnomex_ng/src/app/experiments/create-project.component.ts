import {AfterViewInit, Component, Inject, OnInit, ViewChild} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

import {ExperimentsService} from "./experiments.service";
import {UserPreferencesService} from "../services/user-preferences.service";
import {jqxComboBoxComponent} from "../../assets/jqwidgets-ts/angular_jqxcombobox";
import {HttpParams} from "@angular/common/http";
import {DialogsService} from "../util/popup/dialogs.service";

@Component({
    selector: "create-project-dialog",
    templateUrl: "create-project-dialog.html",
    styles: [`
        .inlineComboBox {
            display: inline-block;
        }
        div.inlineDiv {
            display: inline-block;
            margin: 0.3rem 0.8rem 0.3rem 0.8rem;
        }

    `]
})

export class CreateProjectComponent implements OnInit, AfterViewInit {
    @ViewChild("yesButton") yesButton;
    @ViewChild("labComboBox") labComboBox: jqxComboBoxComponent;

    public createProjectForm: FormGroup;
    public newProjectId: string = "";
    public showSpinner: boolean = false;
    public labList: any[];
    private items: any[];
    private readonly selectedLab: any;
    private idLabString: string;
    private projectDescription: string;
    private selectedProjectLabItem: any;



    constructor(private dialogRef: MatDialogRef<CreateProjectComponent>, @Inject(MAT_DIALOG_DATA) private data: any,
                private experimentsService: ExperimentsService,
                private formBuilder: FormBuilder,
                private dialogsService: DialogsService,
                public prefService: UserPreferencesService,
    ) {
        this.labList = data.labList;
        this.items = data.items;
        this.selectedLab = data.selectedLabItem;

        this.createForm();
    }

    /**
     * Create the project form.
     */
    createForm() {
        this.createProjectForm = this.formBuilder.group({
            projectName: ["", [
                Validators.required
            ]],
            selectedLab: ["", [
                Validators.required
            ]],
            "projectDescription": this.projectDescription
        });
    }

    ngOnInit() {
        setTimeout( () => {
            if(this.selectedLab) {
                this.labComboBox.selectItem(this.selectedLab);
            }
        });
    }

    ngAfterViewInit() {
    }

    /**
     * Set the selected project lab.
     * @param event
     */
    onLabSelect(event: any) {
        if (event.args && event.args.item && event.args.item.value) {
            this.selectedProjectLabItem = event.args.item.originalItem;

            this.idLabString = event.args.item.value;
        }

    }

    /**
     * Save the project.
     * @param project
     */
    saveProject(project: any) {
        this.showSpinner = true;
        let params: HttpParams = new HttpParams();
        let stringifiedProject: string;

        project.name = this.createProjectForm.controls["projectName"].value;
        project.projectDescription = this.createProjectForm.controls["projectDescription"].value;
        stringifiedProject = JSON.stringify(project);
        params = params.set("projectXMLString", stringifiedProject)
                       .set("parseEntries", "Y");
        this.experimentsService.saveProject(params).subscribe((response) => {
            if(response && response.idProject) {
                this.newProjectId = response.idProject;
                if(this.items.length === 0) {
                    this.dialogRef.close();
                } else {
                    this.refreshProjectRequestList();
                }
            }
        }, (error) => {
            this.dialogsService.alert( error.message, "Error");
            this.showSpinner = false;
        });
    }

    /**
     * Refresh the tree.
     */
    refreshProjectRequestList() {
        this.experimentsService.refreshProjectRequestList_fromBackend();
    }

    /**
     * Get the selected project
     */
    getProject() {
        let idProject: any = 0;

        let params: HttpParams = new HttpParams()
            .set("idLab", this.selectedProjectLabItem.idLab)
            .set("idProject", idProject);

        this.experimentsService.getProject(params).subscribe((response) => {
            if(response && response.Project) {
                this.saveProject(response.Project);
            } else {
                let message: string = "";
                if(response && response.message) {
                    message = ": " + response.message;
                }
                this.dialogsService.alert("Failed in getting Project" + message, "Error");
            }
        }, (error) => {
            this.dialogsService.alert("Failed in getting Project" + error.message, "Error");
        });
    }

    /**
     * The save button was selected in the create project dialog.
     */
    createProjectSaveButtonClicked() {
        this.getProject();
    }

}

