import {Component, OnInit} from "@angular/core";
import {GridApi, GridReadyEvent, RowSelectedEvent} from "ag-grid-community";
import {OrganismService} from "../services/organism.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {DictionaryService} from "../services/dictionary.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {CheckboxRenderer} from "../util/grid-renderers/checkbox.renderer";
import {DateRenderer} from "../util/grid-renderers/date.renderer";
import {DateEditor} from "../util/grid-editors/date.editor";
import {DateParserComponent} from "../util/parsers/date-parser.component";
import {DialogsService} from "../util/popup/dialogs.service";
import {MatSnackBar, MatSnackBarConfig} from "@angular/material";
import {HttpParams} from "@angular/common/http";

@Component({
    selector: 'configure-organisms',
    templateUrl: "./configure-organisms.component.html",
})

export class ConfigureOrganismsComponent implements OnInit {

    public formGroup: FormGroup;
    public nameFC: FormControl;
    public activeFC: FormControl;
    public das2NameFC: FormControl;
    public binomialNameFC: FormControl;
    public abbreviationFC: FormControl;
    public mageCodeFC: FormControl;
    public taxIdFC: FormControl;
    public sortOrderFC: FormControl;
    public mageDefFC: FormControl;
    public ownerFC: FormControl;

    public organismGridApi: GridApi;
    public organismGridColumnDefs: any[];

    public genomeBuildGridApi: GridApi;
    public genomeBuildGridColumnDefs: any[];
    public genomeBuildList: any[];
    private genomeBuildSelectedIndex: any;

    public selectedOrganism: any;
    public showSpinner: boolean;
    public organismList: any[];
    public appUserList: any[];
    private canWriteDictionaries: boolean;
    public canUpdateSelectedOrganism: boolean;
    public canDeleteSelectedOrganism: boolean;

    constructor(private organismService: OrganismService,
                private dictionaryService: DictionaryService,
                private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private dialogsService: DialogsService,
                private snackBar: MatSnackBar) {
    }

    ngOnInit() {
        this.organismGridColumnDefs = [ {headerName: "Organism", field: "organism", width: 10} ];
        this.genomeBuildSelectedIndex = null;
        this.genomeBuildGridColumnDefs = [
            {headerName: "Name", field: "genomeBuildName", width: 10, editable: this.determineEditable},
            {headerName: "Das2Name", field: "das2Name", width: 10, editable: this.determineEditable},
            {headerName: "Build Date", field: "buildDate", width: 10, cellRendererFramework: DateRenderer,
                cellEditorFramework: DateEditor, dateParser: new DateParserComponent("YYYY-MM-DD", "MM/DD/YYYY"),
                editable: this.determineEditable},
            {headerName: "Latest Build", field: "isLatestBuild", width: 10, cellRendererFramework: CheckboxRenderer,
                editable: false, checkboxEditable: this.determineEditable},
            {headerName: "Active", field: "isActive", width: 10, cellRendererFramework: CheckboxRenderer,
                editable: false, checkboxEditable: this.determineEditable},
        ];
        this.appUserList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.APP_USER);
        this.canWriteDictionaries = this.createSecurityAdvisorService.hasPermission("canWriteDictionaries");
        this.canUpdateSelectedOrganism = false;
        this.canDeleteSelectedOrganism = false;
        this.showSpinner = false;

        this.nameFC = new FormControl("", Validators.maxLength(100));
        this.activeFC = new FormControl(false);
        this.das2NameFC = new FormControl("", Validators.maxLength(100));
        this.binomialNameFC = new FormControl("", Validators.maxLength(100));
        this.abbreviationFC = new FormControl("", Validators.maxLength(100));
        this.mageCodeFC = new FormControl("", Validators.maxLength(100));
        this.taxIdFC = new FormControl("", Validators.maxLength(100));
        this.sortOrderFC = new FormControl("", Validators.pattern("^[0-9]{0,5}$"));
        this.mageDefFC = new FormControl("", Validators.maxLength(100));
        this.ownerFC = new FormControl({value: "", disabled: !this.canWriteDictionaries});
        this.formGroup = new FormGroup({
            name: this.nameFC,
            active: this.activeFC,
            das2Name: this.das2NameFC,
            binomialName: this.binomialNameFC,
            abbreviation: this.abbreviationFC,
            mageCode: this.mageCodeFC,
            taxId: this.taxIdFC,
            sortOrder: this.sortOrderFC,
            mageDef: this.mageDefFC,
            owner: this.ownerFC,
        });

        this.loadOrganismList();
    }

    private loadOrganismList(): void {
        this.setOrganism(null);
        this.organismList = [];
        this.organismService.getOrganismListNew().subscribe((response: any) => {
            if (response) {
                this.organismList = response;
            }
        });
    }

    private determineEditable(params: any): boolean {
        return params.node.data.canUpdate === "Y";
    }

    public addOrganism(): void {
        let newOrganism: any = {};
        newOrganism.idOrganism = "";
        newOrganism.organism = "Enter name here...";
        newOrganism.isActive = "Y";
        newOrganism.canUpdate = "Y";
        newOrganism.canDelete = "Y";
        newOrganism.canRead = "Y";
        newOrganism.mageOntologyCode = "";
        newOrganism.mageOntologyDefinition = "";
        newOrganism.das2Name = "";
        newOrganism.binomialName = "";
        newOrganism.idAppUser = this.createSecurityAdvisorService.hasPermission("canWriteDictionaries") ? "" : "" + this.createSecurityAdvisorService.idAppUser;
        newOrganism.genomeBuilds = [];

        this.setOrganism(newOrganism);
        this.formGroup.markAsDirty();
        this.organismGridApi.deselectAll();
    }

    public removeOrganism(): void {
        if (this.selectedOrganism && this.selectedOrganism.idOrganism && this.canDeleteSelectedOrganism) {
            this.dialogsService.confirm("Are you sure you want to delete this organism and its associated genome builds?", " ").subscribe((result: boolean) => {
                if (result) {
                    this.showSpinner = true;
                    this.organismService.deleteOrganism(this.selectedOrganism.idOrganism).subscribe((response: any) => {
                        if (response && response.result && response.result === "SUCCESS") {
                            let config: MatSnackBarConfig = new MatSnackBarConfig();
                            config.duration = 2000;
                            this.snackBar.open("Organism Deleted", "Configure Organisms", config);
                        } else {
                            let message: string = "";
                            if (response && response.message) {
                                message = ": " + response.message;
                            }
                            this.dialogsService.confirm("An error occurred while deleting the organism" + message, null);
                        }
                        this.showSpinner = false;
                        this.loadOrganismList();
                    });
                }
            });
        }
    }

    public prepareToSaveOrganism(): void {
        if (this.selectedOrganism && this.canUpdateSelectedOrganism) {
            if (!this.checkGenomeBuildDates()) {
                this.dialogsService.confirm("Please specify a build date for each genome build", null);
                return;
            }

            if (this.das2NameFC.value === "" || this.binomialNameFC.value === "") {
                this.dialogsService.confirm("If binomial name or das2Name are left blank they will not be displayed in the Data Tracks View. Save Anyway?", " ").subscribe((response: boolean) => {
                    if (response) {
                        this.saveOrganism();
                    }
                });
            } else if (!this.checkGenomeBuildNames()) {
                this.dialogsService.confirm("You have left the das2Name field blank in the Genome Build grid. If you leave this field blank it will not be displayed in the Data Tracks View. Save Anyway?", " ").subscribe((response: boolean) => {
                    if (response) {
                        this.saveOrganism();
                    }
                });
            } else {
                this.saveOrganism();
            }
        }
    }

    private checkGenomeBuildNames(): boolean {
        for (let build of this.genomeBuildList) {
            if (build.das2Name === "") {
                return false;
            }
        }
        return true;
    }

    private checkGenomeBuildDates(): boolean {
        for (let build of this.genomeBuildList) {
            if (build.buildDate === "") {
                return false;
            }
        }
        return true;
    }

    public saveOrganism(): void {
        this.showSpinner = true;
        let params: HttpParams = new HttpParams()
            .set("idOrganism", this.selectedOrganism.idOrganism)
            .set("organism", this.nameFC.value)
            .set("isActive", this.activeFC.value ? "Y" : "N")
            .set("mageOntologyCode", this.mageCodeFC.value)
            .set("mageOntologyDefinition", this.mageDefFC.value)
            .set("abbreviation", this.abbreviationFC.value)
            .set("das2Name", this.das2NameFC.value)
            .set("binomialName", this.binomialNameFC.value)
            .set("ncbiTaxID", this.taxIdFC.value)
            .set("sortOrder", this.sortOrderFC.value)
            .set("idAppUser", this.ownerFC.value)
            .set("noJSONToXMLConversionNeeded", "Y")
            .set("genomeBuildsJSONString", JSON.stringify(this.genomeBuildList));

        this.organismService.saveOrganismNew(params).subscribe((result: any) => {
            if (result && result.result && result.result === "SUCCESS") {
                let config: MatSnackBarConfig = new MatSnackBarConfig();
                config.duration = 2000;
                this.snackBar.open("Organism Saved", "Configure Organisms", config);
            } else if (result && result.message) {
                this.dialogsService.confirm(result.message, null);
            } else {
                this.dialogsService.confirm("An error occurred while saving the organism", null);
            }
            this.showSpinner = false;
            this.loadOrganismList();
        });
    }

    private setOrganism(o: any): void {
        this.selectedOrganism = o;
        if (o) {
            this.canUpdateSelectedOrganism = o.canUpdate === "Y";
            this.canDeleteSelectedOrganism = o.canDelete === "Y";
            this.nameFC.setValue(o.organism);
            this.activeFC.setValue(o.isActive === "Y");
            this.das2NameFC.setValue(o.das2Name);
            this.binomialNameFC.setValue(o.binomialName);
            this.abbreviationFC.setValue(o.abbreviation);
            this.mageCodeFC.setValue(o.mageOntologyCode);
            this.taxIdFC.setValue(o.ncbiTaxID);
            this.sortOrderFC.setValue(o.sortOrder);
            this.mageDefFC.setValue(o.mageOntologyDefinition);
            this.ownerFC.setValue(o.idAppUser);
            this.genomeBuildList = Array.isArray(o.genomeBuilds) ? o.genomeBuilds : [o.genomeBuilds.GenomeBuild];
        } else {
            this.canUpdateSelectedOrganism = false;
            this.canDeleteSelectedOrganism = false;
            this.nameFC.setValue("");
            this.activeFC.setValue(false);
            this.das2NameFC.setValue("");
            this.binomialNameFC.setValue("");
            this.abbreviationFC.setValue("");
            this.mageCodeFC.setValue("");
            this.taxIdFC.setValue("");
            this.sortOrderFC.setValue("");
            this.mageDefFC.setValue("");
            this.ownerFC.setValue("");
            this.genomeBuildList = [];
        }
        this.showSpinner = false;
    }

    public onOrganismGridReady(params: GridReadyEvent): void {
        this.organismGridApi = params.api;
        this.organismGridApi.sizeColumnsToFit();
    }

    public onOrganismGridRowSelected(event: RowSelectedEvent): void {
        if (event.node.isSelected()) {
            this.setOrganism(event.data);
            this.formGroup.markAsPristine();
        }
    }

    public onGenomeBuildGridReady(params: GridReadyEvent): void {
        this.genomeBuildGridApi = params.api;
        this.genomeBuildGridApi.sizeColumnsToFit();
    }

    public onGenomeBuildGridRowSelected(event: RowSelectedEvent): void {
        if (event.node.isSelected()) {
            this.genomeBuildSelectedIndex = event.rowIndex;
        }
    }

    public addGenomeBuild(): void {
        if (this.canUpdateSelectedOrganism) {
            let gb: any = {};
            gb.idGenomeBuild = "GenomeBuild" + this.genomeBuildList.length;
            gb.das2Name = "Enter das2Name...";
            gb.buildDate = ConfigureOrganismsComponent.formatTodaysDate();
            gb.genomeBuildName = "Enter Name...";
            gb.isActive = "Y";
            gb.isLatestBuild = "N";
            gb.canUpdate = "Y";
            this.genomeBuildList.push(gb);
            this.genomeBuildGridApi.setRowData(this.genomeBuildList);
            this.formGroup.markAsDirty();
        }
    }

    private static formatTodaysDate(): string {
        let d: Date = new Date();
        let month: string = "" + (d.getMonth() + 1);
        let day: string = "" + d.getDate();
        let year: string = "" + d.getFullYear();
        if (month.length < 2) {
            month = "0" + month;
        }
        if (day.length < 2) {
            day = "0" + day;
        }
        return [year, month, day].join("-");
    }

    public removeGenomeBuild(): void {
        if (this.canUpdateSelectedOrganism && this.genomeBuildSelectedIndex != null) {
            this.genomeBuildList.splice(this.genomeBuildSelectedIndex, 1);
            this.genomeBuildGridApi.setRowData(this.genomeBuildList);
            this.genomeBuildSelectedIndex = null;
            this.formGroup.markAsDirty();
        }
    }

    public adjustColumns(api: GridApi): void {
        if (api) {
            api.sizeColumnsToFit();
        }
    }

}