/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {AfterViewInit, Component, Inject, OnInit, ViewChild} from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { URLSearchParams } from "@angular/http";
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

import {ExperimentsService} from "./experiments.service";
import {UserPreferencesService} from "../services/user-preferences.service";

@Component({
    selector: 'create-project-dialog',
    templateUrl: 'create-project-dialog.html',
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

export class CreateProjectComponent implements OnInit, AfterViewInit{
    @ViewChild("yesButton") yesButton;

    formControl: FormControl = new FormControl();
    private labList: any[];
    private labListString: any[];
    private items: any[];
    private i:number = 0;
    private selectedItem: any;
    private idLabString: string;
    private projectName: string;
    private projectDescription: string;
    private selectedProjectLabItem: any;
    private createProjectForm: FormGroup;
    public showSpinner: boolean = false;

    constructor(private dialogRef: MatDialogRef<CreateProjectComponent>, @Inject(MAT_DIALOG_DATA) private data: any,
                private experimentsService: ExperimentsService,
                private formBuilder: FormBuilder,
                public prefService: UserPreferencesService,
    ) {
        this.labListString = data.labListString;
        this.labList = data.labList;
        this.items = data.items;
        this.selectedItem = data.selectedLabItem;

        this.createForm();
    }

    /**
     * Create the project form.
     */
    createForm() {
        this.createProjectForm = this.formBuilder.group({
            projectName: ['', [
                Validators.required
            ]],
            selectedLab: ['', [
                Validators.required
            ]],
            "projectDescription": this.projectDescription
        })
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
    }

    /**
     * Set the selected project lab.
     * @param event
     */
    onLabSelect(event: any) {
        if (event.args != undefined && event.args.item != null && event.args.item.value != null) {
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
        project.name = this.createProjectForm.controls['projectName'].value;
        project.projectDescription = this.createProjectForm.controls['projectDescription'].value;
        stringifiedProject = JSON.stringify(project);
        params.set("projectXMLString", stringifiedProject);
        params.set("parseEntries", "Y");
        var lPromise = this.experimentsService.saveProject(params).toPromise();
        lPromise.then(response => {
            if (this.items.length === 0)
                this.dialogRef.close();
            else
                this.refreshProjectRequestList();
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
    /**
     * The no button was selected in the delete project window.
     */
    createProjectCancelButtonClicked() {
        this.dialogRef.close();
    }

    save(formData:any){
        console.log(formData);
    }

}

export class CreateProjectComponentLauncher {

}
