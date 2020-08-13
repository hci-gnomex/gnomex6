import {Component, Inject, OnInit} from "@angular/core";
import {GridApi, GridReadyEvent, RowNode, RowSelectedEvent} from "ag-grid-community";
import {OrganismService} from "../services/organism.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {DictionaryService} from "../services/dictionary.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {CheckboxRenderer} from "../util/grid-renderers/checkbox.renderer";
import {DateRenderer} from "../util/grid-renderers/date.renderer";
import {DateEditor} from "../util/grid-editors/date.editor";
import {DateParserComponent} from "../util/parsers/date-parser.component";
import {DialogsService} from "../util/popup/dialogs.service";
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar, MatSnackBarConfig} from "@angular/material";
import {HttpParams} from "@angular/common/http";
import {UtilService} from "../services/util.service";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {TextAlignLeftMiddleRenderer} from "../util/grid-renderers/text-align-left-middle.renderer";
import {TextAlignLeftMiddleEditor} from "../util/grid-editors/text-align-left-middle.editor";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";
import {GDAction} from "../util/interfaces/generic-dialog-action.model";
import {HttpUriEncodingCodec} from "../services/interceptors/http-uri-encoding-codec";

@Component({
    selector: 'configure-organisms',
    templateUrl: "./configure-organisms.component.html",
})

export class ConfigureOrganismsComponent extends BaseGenericContainerDialog implements OnInit {

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
    public genomeBuildSelectedIndex: any;

    public selectedOrganism: any;
    public showSpinner: boolean;
    public organismList: any[];
    public appUserList: any[];
    private canWriteDictionaries: boolean;
    public canUpdateSelectedOrganism: boolean;
    public canDeleteSelectedOrganism: boolean;
    public primaryDisable: (action?: GDAction) => boolean;
    public isDialog: boolean = false;
    private preSelectedOrganism: string;

    constructor(private dialogRef: MatDialogRef<ConfigureOrganismsComponent>,
                @Inject(MAT_DIALOG_DATA) private data: any,
                private organismService: OrganismService,
                private dictionaryService: DictionaryService,
                private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private dialogsService: DialogsService,
                private snackBar: MatSnackBar) {
        super();
        if(this.data && Object.keys(this.data).length > 0) {
            this.isDialog = data.isDialog;
            this.preSelectedOrganism = this.data.preSelectedOrganism;
        }
    }

    ngOnInit() {
        this.organismGridColumnDefs = [ {headerName: "Organism", field: "organism", width: 10} ];
        this.genomeBuildSelectedIndex = null;
        this.genomeBuildGridColumnDefs = [
            {headerName: "Name", field: "genomeBuildName", width: 10, editable: this.determineEditable,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                cellEditorFramework: TextAlignLeftMiddleEditor,
                validators: [ Validators.required ],
                errorNameErrorMessageMap: [
                    { errorName: "required", errorMessage: "Name is required" }
                ]},
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

        this.nameFC = new FormControl("", [Validators.required, Validators.maxLength(100)]);
        this.activeFC = new FormControl(false);
        this.das2NameFC = new FormControl("", Validators.maxLength(100));
        this.binomialNameFC = new FormControl("", Validators.maxLength(100));
        this.abbreviationFC = new FormControl("", Validators.maxLength(100));
        this.mageCodeFC = new FormControl("", Validators.maxLength(100));
        this.taxIdFC = new FormControl("", Validators.maxLength(100));
        this.sortOrderFC = new FormControl("", Validators.pattern("^[0-9]{0,5}$"));
        this.mageDefFC = new FormControl("", Validators.maxLength(100));
        this.ownerFC = new FormControl({value: "", disabled: !this.canWriteDictionaries}, Validators.required);
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

        this.preSelectedOrganism ? this.loadOrganismList(this.preSelectedOrganism) : this.loadOrganismList();
        this.formGroup.markAsPristine();
        this.primaryDisable = (action) => {
            return this.formGroup.invalid;
        };
    }

    private loadOrganismList(preselectOrganism?: string): void {
        this.setOrganism(null);
        this.organismList = [];
        this.organismService.getOrganismListNew().subscribe((response: any) => {
            if (response) {
                this.organismList = response;
                if (preselectOrganism) {
                    setTimeout(() => {
                        this.organismGridApi.forEachNode((node: RowNode) => {
                            if (node.data.idOrganism === preselectOrganism) {
                                node.setSelected(true);
                            }
                        });
                    });
                }
            }
        }, (err: IGnomexErrorResponse) => {
            this.showSpinner = false;
        });
    }

    private determineEditable(params: any): boolean {
        return params.node.data.canUpdate === "Y";
    }

    public addOrganism(): void {
        let newOrganism: any = {};
        newOrganism.idOrganism = "";
        newOrganism.organism = "";
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
            this.dialogsService.confirm("Are you sure you want to delete this organism and its associated genome builds?").subscribe((result: boolean) => {
                if (result) {
                    this.showSpinner = true;
                    this.organismService.deleteOrganism(this.selectedOrganism.idOrganism).subscribe((response: any) => {
                        this.showSpinner = false;
                        if (response && response.result && response.result === "SUCCESS") {
                            let config: MatSnackBarConfig = new MatSnackBarConfig();
                            config.duration = 2000;
                            this.snackBar.open("Organism Deleted", "Configure Organisms", config);
                            this.loadOrganismList();
                        } else {
                            let message: string = "";
                            if (response && response.message) {
                                message = ": " + response.message;
                            }
                            this.dialogsService.error("An error occurred while deleting the organism" + message);
                        }
                    }, (err: IGnomexErrorResponse) => {
                        this.showSpinner = false;
                    });
                }
            });
        } else if (this.selectedOrganism && !this.selectedOrganism.idOrganism) {
            let idOwner: string = this.formGroup.get("owner").value;
            this.formGroup.reset();
            this.genomeBuildList = [];
            if(idOwner) {
                this.formGroup.get("owner").setValue(idOwner);
            }
            this.selectedOrganism = null;
        }
    }

    public prepareToSaveOrganism(): void {
        if (this.selectedOrganism && this.canUpdateSelectedOrganism) {
            if (!this.checkGenomeBuildDates()) {
                this.dialogsService.alert("Please specify a build date for each genome build", "Invalid");
                return;
            }

            if (!this.checkGenomeBuildNames()) {
                this.dialogsService.alert("Genome build name is required. Please specify a name for each genome build", "Invalid");
                return;
            }

            if (this.das2NameFC.value === "" || this.binomialNameFC.value === "") {
                this.dialogsService.confirm("If binomial name or das2Name are left blank they will not be displayed in the Data Tracks View. Save Anyway?").subscribe((response: boolean) => {
                    if (response) {
                        this.saveOrganism();
                    }
                });
            } else if (!this.checkGenomeBuildDas2Names()) {
                this.dialogsService.confirm("You have left the das2Name field blank in the Genome Build grid. If you leave this field blank it will not be displayed in the Data Tracks View. Save Anyway?").subscribe((response: boolean) => {
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
            if (build.genomeBuildName === "") {
                return false;
            }
        }
        return true;
    }

    private checkGenomeBuildDas2Names(): boolean {
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
        let name: string = this.nameFC.value;
        let params: HttpParams = new HttpParams({encoder: new HttpUriEncodingCodec()})
            .set("idOrganism", this.selectedOrganism.idOrganism)
            .set("organism", name)
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
            this.showSpinner = false;
            if (result && result.result && result.result === "SUCCESS") {
                if(this.isDialog) {
                    this.dialogRef.close(result.idOrganism);
                } else {
                    let config: MatSnackBarConfig = new MatSnackBarConfig();
                    config.duration = 2000;
                    this.snackBar.open("Organism Saved", "Configure Organisms", config);
                    this.loadOrganismList(result.idOrganism);
                }
            }
        }, (err: IGnomexErrorResponse) => {
            this.showSpinner = false;
        });
    }

    private setOrganism(o: any): void {
        this.selectedOrganism = o;
        if (o) {
            this.canUpdateSelectedOrganism = o.canUpdate === "Y";
            this.canDeleteSelectedOrganism = o.canDelete === "Y";
            this.nameFC.setValue(o.organism);
            this.activeFC.setValue(o.isActive === "Y");
            this.das2NameFC.setValue(o.das2Name ? o.das2Name : "");
            this.binomialNameFC.setValue(o.binomialName ? o.binomialName : "");
            this.abbreviationFC.setValue(o.abbreviation ? o.abbreviation : "");
            this.mageCodeFC.setValue(o.mageOntologyCode ? o.mageOntologyCode : "");
            this.taxIdFC.setValue(o.ncbiTaxID ? o.ncbiTaxID : "");
            this.sortOrderFC.setValue(o.sortOrder ? o.sortOrder : "");
            this.mageDefFC.setValue(o.mageOntologyDefinition ? o.mageOntologyDefinition : "");
            this.ownerFC.setValue(o.idAppUser);
            this.genomeBuildList = UtilService.getJsonArray(o.genomeBuilds, o.genomeBuilds.GenomeBuild);
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
        this.genomeBuildSelectedIndex = null;
        this.showSpinner = false;
        UtilService.markChildrenAsTouched(this.formGroup);
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
            gb.das2Name = "";
            gb.buildDate = ConfigureOrganismsComponent.formatTodaysDate();
            gb.genomeBuildName = "";
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

    public cancel(): void {
        this.dialogRef.close();
    }

}
