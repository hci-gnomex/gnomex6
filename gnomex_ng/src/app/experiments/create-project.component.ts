import {AfterViewInit, Component, Inject, OnInit, ViewChild} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {Http, URLSearchParams} from "@angular/http";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

import {ExperimentsService} from "./experiments.service";
import {UserPreferencesService} from "../services/user-preferences.service";
import {jqxComboBoxComponent} from "../../assets/jqwidgets-ts/angular_jqxcombobox";
import {HttpParams} from "@angular/common/http";
import {first} from "rxjs/operators";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
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
                private dialogService: DialogsService,
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

        this.newProjectName = this.createProjectForm.controls["projectName"].value;
        project.name = this.createProjectForm.controls["projectName"].value;
        project.projectDescription = this.createProjectForm.controls["projectDescription"].value;
        stringifiedProject = JSON.stringify(project);
        params = params.set("projectXMLString", stringifiedProject);
        params = params.set("parseEntries", "Y");

        this.experimentsService.saveProject(params).pipe(first()).subscribe(response => {
            if(this.items.length === 0) {
                this.dialogRef.close();
            } else {
                this.refreshProjectRequestList();
            }
        },(err:IGnomexErrorResponse) => {
            this.dialogService.alert(err.gError.message);
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

        this.experimentsService.getProject(params).pipe(first()).subscribe(response => {
            this.saveProject(response.Project);
        },(err: IGnomexErrorResponse) => {
            this.dialogService.alert(err.gError.message);
        });
    }

    /**
     * The save button was selected in the create project dialog.
     */
    createProjectSaveButtonClicked() {
        this.getProject();
    }

}

