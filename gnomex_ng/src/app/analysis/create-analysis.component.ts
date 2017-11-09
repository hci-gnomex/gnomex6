/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {
    MatDialogRef, MAT_DIALOG_DATA, MatOptionSelectionChange, MatAutocompleteTrigger, MatInput,
    MatDialog
} from '@angular/material';
import { URLSearchParams } from "@angular/http";
import {
    AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild
} from "@angular/core";
import {AnalysisService} from "../services/analysis.service";
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';
import {GetLabService} from "../services/get-lab.service";
import {DictionaryService} from "../services/dictionary.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {DialogsService} from '../util/popup/dialogs.service';

@Component({
    selector: 'create-analysis-dialog',
    templateUrl: 'create-analysis-dialog.html',
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

export class CreateAnalysisComponent implements OnInit, AfterViewInit{
    @ViewChild("labCombo") labCombo;
    formControl: FormControl = new FormControl();
    private _analysisGroups: any[] = [];
    private _labList: any[];
    private items: any[];
    private i:number = 0;
    private idLabString: string;
    private idAnalysisGroup: string;
    private idAppUser: string;
    private analysisName: string;
    private organismList: any[] = [];
    private activeOrganismList: any[] = [];
    private analysisGroupList: any[] = [];
    private analysisLabList: any[] = [];
    private visibilityList: any[] = [];
    private idOrganism: string;
    private genomeBuildList: any[] = [];
    private showOwnerComboBox: boolean = false;
    private ownerList: any[] = [];
    private newAnalysisGroup: boolean = false;
    private selectedLab: string;
    private selectedAnalysisLabItem: any;
    private organism: any;
    private genomBuilds: any[] = [];
    private analysisGroup: any[] = [];
    private createAnalysisForm: FormGroup;
    private selectedLabLabel: string;
    private codeVisibility: string;

    constructor(private dialogRef: MatDialogRef<CreateAnalysisComponent>, @Inject(MAT_DIALOG_DATA) private data: any,
                private dictionaryService: DictionaryService,
                private dialog: MatDialog,
                private getLabService: GetLabService,
                private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private analysisService: AnalysisService,
                private formBuilder: FormBuilder,
                private dialogsService: DialogsService
    ) {
        this._labList = data.labList;
        this.items = data.items;
        this.selectedLab = data.selectedLab;
        this.selectedLabLabel = data.selectedLabLabel;
        this.createForm();

    }

    /**
     * Build the form.
     */
    createForm() {
        this.createAnalysisForm = this.formBuilder.group({
            analysisName: ['', [
                Validators.required
            ]],
            selectedLab: ['', [
                Validators.required
            ]],
            analysisGroup: ['', [
                Validators.required
            ]],
            organism: ['', [
                Validators.required
            ]],
            visibility: ['', [
                Validators.required
            ]]
        })
        if (this.createSecurityAdvisorService.isAdmin) {
            this.createAnalysisForm.addControl("analysisOwner", new FormControl("", Validators.required));
        }
    }

    ngOnInit() {
        this.organismList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.ORGANISM);
        this.visibilityList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.VISIBILTY);

        this.activeOrganismList = this.organismList.filter(org =>
            org.isActive === "Y");

        if (this.createSecurityAdvisorService.isAdmin) {
            this.showOwnerComboBox = true;
        }
    }

    ngAfterViewInit() {
        var lnameLab = this.selectedLabLabel.substring(this.selectedLabLabel.indexOf(' ')+1, this.selectedLabLabel.length);
        var fname = this.selectedLabLabel.substring(0, this.selectedLabLabel.indexOf(' '));
        var lname = lnameLab.substring(0, lnameLab.indexOf(' '));
        var fNameFirst = lname+", "+fname+" Lab";
        this.labCombo.selectItem(fNameFirst);
    }

    /**
     * Build the owners combo list.
     * @param event
     */
    onLabSelect(event: any) {
        if (event.args != undefined && event.args.item != null && event.args.item.value != null) {
            this.selectedAnalysisLabItem = event.args.item.originalItem;

            this.idLabString = event.args.item.value;
            if (this.showOwnerComboBox) {
                this.getLabService.getLabByIdOnlyForHistoricalOwnersAndSubmitters(this.idLabString).subscribe((response: any) => {
                    this.ownerList = response.Lab.historicalOwnersAndSubmitters;
                });
            }
            this.analysisLabList = this.items.filter(group => group.idLab === this.idLabString);
            if (this.analysisLabList.length == 1) {
                this.analysisGroupList = this.analysisLabList[0].AnalysisGroup;
            }
        }
    }

    /**
     * Build the analysis groups list.
     * @param event
     */
    onAnalysisGroupSelect(event: any) {
        console.log("user is "+event);
        if (event.args != undefined && event.args.item != null && event.args.item.value != null) {
            this.idAnalysisGroup = event.args.item.value;
            this.analysisGroup = this.analysisGroupList.filter(group=>group.idAnalysisGroup===this.idAnalysisGroup)
        }
    }

    /**
     * Set the idAppUser on user select.
     * @param event
     */
    onUserSelect(event: any) {
        if (event.args != undefined && event.args.item != null && event.args.item.value != null) {
            this.idAppUser = event.args.item.value;
        }
    }

    /**
     * Set the code visibility.
     * @param event
     */
    onVisibilitySelect(event: any) {
        this.codeVisibility = event.args.item.value;
    }

    /**
     * Set the genome build
     * @param event
     */
    onOrganismSelect(event: any) {
        if (event.args != undefined && event.args.item != null && event.args.item.value != null) {

            this.idOrganism = event.args.item.value;
            let genomeBuilds = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.GENOME_BUILD);
            this.genomeBuildList = genomeBuilds.filter(gen => {
                if (gen.isActive === "Y" && !(gen.value === "")) {
                    return gen.idOrganism === this.idOrganism;
                }
                return false;
            });

        } else {
            //this.resetOrganismSelection();
        }
    }

    /**
     * Set the genomeBuild.
     *
     * @param event
     */
    onGenomeBuildSelect(event: any) {
        if (event.args != undefined && event.args.item != null && event.args.item.value != null) {

            this.organism = event.args.item;
            var genomeBuild = {"idGenomeBuild": event.args.item.value,
                                "display": event.args.item.label};
            this.genomBuilds[this.genomBuilds.length] = genomeBuild;
        }
    }

    /**
     * Setup and call the SaveAnalysis.
     */
    saveAnalysis() {
        var params: URLSearchParams = new URLSearchParams();
        var stringifiedGenomBuild = JSON.stringify(this.genomBuilds);

        var stringifiedAnalysisGroup = JSON.stringify(this.analysisGroup);
        params.set("lanesXMLString", "");
        params.set("samplesXMLString", "");
        params.set("hybsXMLString", "");
        params.set("idInstitution", "");
        params.set("analysisFilesToDeleteXMLString", "");
        params.set("idOrganism", this.idOrganism);
        params.set("idAppUser", this.idAppUser);
        params.set("codeVisibility", this.codeVisibility);
        params.set("name", this.createAnalysisForm.controls['analysisName'].value);
        var genomeBuilds = {genomeBuilds};
        params.set("genomeBuildsXMLString", stringifiedGenomBuild);
        params.set("analysisGroupsXMLString", stringifiedAnalysisGroup);
        //params.set("codeVisibility", this.code)
        var aPromise = this.analysisService.saveAnalysis(params).toPromise();
        aPromise.then(response => {
            console.log("Saved Analysis");
        })
    }

    /**
     * The yes button was selected in the delete project dialog.
     */
    createAnalysisYesButtonClicked() {
        if (this.genomBuilds.length === 0) {
            this.dialogsService
                .confirm('Warning', 'A genome build has not been specified. Create new analysis anyway?')
                .subscribe(
                    res => {
                        if (res) {
                            this.saveAnalysis();
                            this.dialogRef.close();
                        }
                    }
                );

        } else {
            this.saveAnalysis();
            this.dialogRef.close();
        }
    }

    /**
     * The no button was selected in the delete project window.
     */
    createAnalysisNoButtonClicked() {
        this.dialogRef.close();
    }

    /**
     * The new analysis group button was selected on the dialog.
     */
    includeNewGroup() {
        this.newAnalysisGroup = true;
        this.createAnalysisForm.addControl("analysisGroupName", new FormControl("", Validators.required));
        this.createAnalysisForm.removeControl("analysisGroup");
    }

    save(formData:any){
        console.log(formData);
    }
}
