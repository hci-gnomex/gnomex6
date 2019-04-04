import {AfterViewInit, Component, Inject, OnInit, ViewChild} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {URLSearchParams} from "@angular/http";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

import {ExperimentsService} from "./experiments.service";
import {UserPreferencesService} from "../services/user-preferences.service";
import {jqxComboBoxComponent} from "../../assets/jqwidgets-ts/angular_jqxcombobox";

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
    public newProjectName: string;
    public showSpinner: boolean = false;
    public labList: any[];
    private items: any[];
    private selectedLab: any;
    private idLabString: string;
    private projectDescription: string;
    private selectedProjectLabItem: any;



    constructor(private dialogRef: MatDialogRef<CreateProjectComponent>, @Inject(MAT_DIALOG_DATA) private data: any,
                private experimentsService: ExperimentsService,
                private formBuilder: FormBuilder,
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
        var params: URLSearchParams = new URLSearchParams();
        var stringifiedProject: string;

        this.newProjectName = this.createProjectForm.controls["projectName"].value;
        project.name = this.createProjectForm.controls["projectName"].value;
        project.projectDescription = this.createProjectForm.controls["projectDescription"].value;
        stringifiedProject = JSON.stringify(project);
        params.set("projectXMLString", stringifiedProject);
        params.set("parseEntries", "Y");
        var lPromise = this.experimentsService.saveProject(params).toPromise();
        lPromise.then(response => {
            if(this.items.length === 0) {
                this.dialogRef.close();
            } else {
                this.refreshProjectRequestList();
            }
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
        var idProject: any = 0;

        var params: URLSearchParams = new URLSearchParams();
        params.set("idLab", this.selectedProjectLabItem.idLab);
        params.set("idProject", idProject);

        var lPromise = this.experimentsService.getProject(params).toPromise();
        lPromise.then(response => {
            this.saveProject(response.Project);
        });
    }

    /**
     * The save button was selected in the create project dialog.
     */
    createProjectSaveButtonClicked() {
        this.getProject();
    }

}

