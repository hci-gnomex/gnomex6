import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material";
import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, ViewChild} from "@angular/core";
import {AnalysisService} from "../services/analysis.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {GetLabService} from "../services/get-lab.service";
import {DictionaryService} from "../services/dictionary.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {HttpParams} from "@angular/common/http";
import {first} from "rxjs/operators";
import {ConstantsService} from "../services/constants.service";
import {UserPreferencesService} from "../services/user-preferences.service";
import {Router} from "@angular/router";
import {GnomexService} from "../services/gnomex.service";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";
import {ActionType, GDAction} from "../util/interfaces/generic-dialog-action.model";
import {ConfigureOrganismsComponent} from "../configuration/configure-organisms.component";
import {UtilService} from "../services/util.service";
import {Experiment} from "../util/models/experiment.model";
import {HttpUriEncodingCodec} from "../services/interceptors/http-uri-encoding-codec";

@Component({
    selector: "create-analysis-dialog",
    templateUrl: "create-analysis-dialog.html",
    styles: [`

        .inlineComboBox {
            display: inline-block;
        }

        .label-width {
            width: 10em;
        }

        .no-margin {
            margin: 0;
        }

        .no-padding {
            padding: 0;
        }

        .example-full-width {
            width: 450px;
        }

    `]
})

export class CreateAnalysisComponent extends BaseGenericContainerDialog implements OnInit, AfterViewInit  {

    formControl: FormControl = new FormControl();

    public labList: any[];
    public analysisName: string;
    public activeOrganismList: any[] = [];
    public analysisGroupList: any[] = [];
    public visibilityList: any[] = [];
    public genomeBuildList: any[] = [];
    public showOwnerComboBox: boolean = false;
    public ownerList: any[] = [];
    public newAnalysisGroup: boolean = false;
    public createAnalysisForm: FormGroup;
    public primaryDisable: (action?: GDAction) => boolean;
    public newAnalysisName: string;
    public newAnalysisId: string;
    public selectedAnalysisGroup: string;
    public selectedOrganism: string;
    public selectedLab: string;
    private readonly items: any[];
    private idLabString: string;
    private idAnalysisGroup: string;
    private idAppUser: string = "";
    private organismList: any[] = [];
    private analysisLabList: any[] = [];
    private idOrganism: string;
    private organism: any;
    private analysisGroup: any[] = [];
    private codeVisibility: string;
    private readonly parentComponent: string = "";
    private experiment:Experiment;

    public labDisplayField: string = this.prefService.labDisplayField;

    constructor(private dialogRef: MatDialogRef<CreateAnalysisComponent>, @Inject(MAT_DIALOG_DATA) private data: any,
                private dictionaryService: DictionaryService,
                private dialog: MatDialog,
                private changeDetectorRef: ChangeDetectorRef,
                private getLabService: GetLabService,
                private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private analysisService: AnalysisService,
                private formBuilder: FormBuilder,
                private dialogsService: DialogsService,
                public prefService: UserPreferencesService,
                public constantsService: ConstantsService,
                private router: Router,
                private gnomexService: GnomexService,
    ) {
        super();
        this.labList = data.labList;
        if (this.labList && this.labList.length) {
            if (!this.labList[0][this.labDisplayField]) {
                this.labDisplayField = "labName";
            }
        }
        this.items = data.items;
        this.selectedLab = data.selectedLab;
        this.selectedAnalysisGroup = data.selectedAnalysisGroup;
        this.selectedOrganism = data.selectedOrganism;
        this.parentComponent = data.parentComponent;
        this.experiment = data.experiment;
        this.createForm();

    }

    /**
     * Build the form.
     */
    createForm() {
        this.createAnalysisForm = this.formBuilder.group({
            analysisName: ["", [
                Validators.required
            ]],
            selectedLab: ["", [
                Validators.required
            ]],
            analysisGroup: ["", [
                Validators.required
            ]],
            organism: ["", [
                Validators.required
            ]],
            visibility: ["", [
                Validators.required
            ]],
            genomeBuilds: [[]]
        });
        if (this.createSecurityAdvisorService.isAdmin) {
            this.createAnalysisForm.addControl("analysisOwner", new FormControl("", Validators.required));
        }
    }

    ngOnInit() {
        this.organismList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.ORGANISM);
        this.visibilityList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.VISIBILITY);
        this.primaryDisable = (action) => {
            return this.createAnalysisForm.invalid;
        };

        this.activeOrganismList = this.organismList.filter(org =>
            org.isActive === "Y");

        if (this.createSecurityAdvisorService.isAdmin) {
            this.showOwnerComboBox = true;
        }

        if (!this.showOwnerComboBox) {
            this.idAppUser = "" + this.createSecurityAdvisorService.idAppUser;
        }
    }

    ngAfterViewInit() {
        setTimeout(() => {
            if(this.selectedLab) {
                this.createAnalysisForm.get("selectedLab").setValue(this.selectedLab);
                this.onLabSelect(this.selectedLab);
            }

            if(this.selectedOrganism) {
                this.createAnalysisForm.get("organism").setValue(this.selectedOrganism);
                this.onOrganismSelect(this.selectedOrganism);
            }
        });

        setTimeout(() => {
            if(this.selectedAnalysisGroup && this.analysisGroupList.length > 0) {
                for(let ag of this.analysisGroupList) {
                    if(ag.idAnalysisGroup === this.selectedAnalysisGroup) {
                        this.createAnalysisForm.get("analysisGroup").setValue(ag.idAnalysisGroup);
                        this.onAnalysisGroupSelect(ag.idAnalysisGroup);
                        break;
                    }
                }
            }
        });

    }

    /**
     * Build the owners combo list.
     * @param event
     */
    onLabSelect(event: any) {
        if (event) {
            this.analysisGroupList = [];
            this.ownerList = [];

            this.dialogsService.startDefaultSpinnerDialog();

            this.idLabString = event;
            if (this.showOwnerComboBox) {
                this.getLabService.getLabByIdOnlyForHistoricalOwnersAndSubmitters(this.idLabString).subscribe((response: any) => {
                    if(response && response.Lab && response.Lab.members) {
                        this.ownerList = UtilService.getJsonArray(response.Lab.members, response.Lab.members.AppUser);
                    }
                });
            }


            if(this.idLabString) {
                if(this.items && this.items.length > 0) {
                    this.analysisLabList = this.items.filter(group => group.idLab === this.idLabString);
                    if (this.analysisLabList.length === 1) {
                        this.analysisGroupList = this.analysisLabList[0].AnalysisGroup ? this.analysisLabList[0].AnalysisGroup : [];
                    }
                    if (!this.isArray(this.analysisGroupList)) {
                        this.analysisGroupList = [this.analysisGroupList];
                    }

                } else {
                    let ids: HttpParams = new HttpParams().set("idLab", this.idLabString);
                    this.analysisService.getAnalysisGroupList(ids).subscribe((response: any) => {
                        if (response && response.AnalysisGroup) {
                            if (!this.isArray(response.AnalysisGroup)) {
                                this.analysisGroupList = [response.AnalysisGroup];
                            } else {
                                this.analysisGroupList = response.AnalysisGroup;
                            }
                        }
                    }, (err:IGnomexErrorResponse) => {
                        this.dialogsService.stopAllSpinnerDialogs();
                    });

                }
            }

            this.dialogsService.stopAllSpinnerDialogs();
        }
    }

    /**
     * Build the analysis groups list.
     * @param event
     */
    onAnalysisGroupSelect(event: any) {
        if (event) {
            this.idAnalysisGroup = event;
            this.analysisGroup = this.analysisGroupList.filter(group => group.idAnalysisGroup === this.idAnalysisGroup);

        }
    }

    isArray(what) {
        return Object.prototype.toString.call(what) === "[object Array]";
    }


    /**
     * Set the idAppUser on user select.
     * @param event
     */
    onUserSelect(event: any) {
        if (event) {
            this.idAppUser = event;
        }
    }

    /**
     * Set the code visibility.
     * @param event
     */
    onVisibilitySelect(event: any) {
        if (event) {
            this.codeVisibility = event;
        } else {
            this.codeVisibility = "";
        }
    }

    /**
     * Set the genome build
     * @param event
     */
    onOrganismSelect(event: any) {
        if (event) {

            this.idOrganism = event;
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
     * Setup and call the SaveAnalysis.
     */
    saveAnalysis() {
        this.dialogsService.startDefaultSpinnerDialog();
        let idAnalysis: any = 0;
        let params: HttpParams = new HttpParams({encoder: new HttpUriEncodingCodec()});
        let stringifiedGenomBuild = "";
        if (this.createAnalysisForm.get("genomeBuilds").value.length > 0) {
            stringifiedGenomBuild = JSON.stringify(this.createAnalysisForm.get("genomeBuilds").value);
        }
        let stringifiedAnalysisGroup = "";
        if (this.analysisGroup.length > 0) {
            stringifiedAnalysisGroup = JSON.stringify(this.analysisGroup);
        }
        let experimentJSONRep = null;
        let samples:any[] = null;
        let seqLanes:any[] = null;
        if(this.experiment){
            experimentJSONRep = this.experiment.getJSONObjectRepresentation();
            seqLanes = <any[]>experimentJSONRep.sequenceLanes;
            (seqLanes).forEach(sl => {
                sl.type = "SequenceLane";
            });

            samples = experimentJSONRep.samples;
        }


        params = params.set("lanesJSONString", seqLanes && seqLanes.length > 0 ? JSON.stringify(seqLanes) : "")
            .set("samplesJSONString", samples && samples.length > 0 ? JSON.stringify(samples) : "")
            .set("collaboratorsJSONString", "")
            .set("analysisFilesJSONString", "")
            .set("hybsJSONString", "")
            .set("idInstitution", "")
            .set("analysisFilesToDeleteJSONString", "")
            .set("idOrganism", this.idOrganism)
            .set("idAppUser", this.idAppUser)
            .set("idLab", this.idLabString)
            .set("idAnalysis", idAnalysis)
            .set("codeVisibility", this.codeVisibility)
            .set("name", this.createAnalysisForm.controls["analysisName"].value)
            .set("noJSONToXMLConversionNeeded", "Y");

        this.newAnalysisName = this.createAnalysisForm.controls["analysisName"].value;
        if (this.createAnalysisForm.controls["analysisGroupName"]) {
            params = params.set("newAnalysisGroupName", this.createAnalysisForm.controls["analysisGroupName"].value);
        }

        params =  params.set("genomeBuildsJSONString", stringifiedGenomBuild)
            .set("analysisGroupsJSONString", stringifiedAnalysisGroup);
        this.analysisService.saveAnalysis(params).pipe(first()).subscribe(resp => {
            if(resp && resp.idAnalysis && !resp.message) {
                this.newAnalysisId = resp.idAnalysis;

                if(this.parentComponent === "Experiment") {
                    this.dialogsService.stopAllSpinnerDialogs();
                    this.dialogRef.close();
                    this.gnomexService.navByNumber("A" + resp.idAnalysis);
                } else if(this.parentComponent === "Analysis") {
                    this.analysisService.createdAnalysis = resp.idAnalysis;
                    this.dialogRef.close();
                    setTimeout(() => {
                        this.analysisService.refreshAnalysisGroupList_fromBackend();
                    });
                }


            } else if(resp && resp.message) {
                this.dialogsService.error(resp.message);
                this.dialogsService.stopAllSpinnerDialogs();
            }

        }, (err) => {
            this.dialogsService.stopAllSpinnerDialogs();
        });

    }

    /**
     * The yes button was selected in the delete project dialog.
     */
    createAnalysisYesButtonClicked() {
        if (this.createAnalysisForm.get("genomeBuilds").value.length === 0) {
            this.dialogsService
                .confirm("A genome build has not been specified. Create new analysis anyway?", "Warning")
                .subscribe(
                    res => {
                        if (res) {
                            this.saveAnalysis();
                        }
                    }
                );

        } else {
            this.saveAnalysis();
        }
    }


    /**
     * The new analysis group button was selected on the dialog.
     */
    includeNewGroup() {

        this.newAnalysisGroup = !this.newAnalysisGroup;
        if(this.newAnalysisGroup) {
            this.createAnalysisForm.addControl("analysisGroupName", new FormControl("", Validators.required));
            this.createAnalysisForm.removeControl("analysisGroup");
        } else {
            this.createAnalysisForm.addControl("analysisGroup", new FormControl("", Validators.required));
            this.createAnalysisForm.removeControl("analysisGroupName");
        }

    }

    newOrganism() {
        let config: MatDialogConfig = new MatDialogConfig();
        config.width = "1000px";
        config.height = "790px";
        config.panelClass = "no-padding-dialog";
        config.autoFocus = false;
        config.disableClose = true;
        config.data = {
            isDialog: true,
            preSelectedOrganism: this.createAnalysisForm.get("organism").value ? this.createAnalysisForm.get("organism").value : "",
        };

        this.dialogsService.genericDialogContainer(ConfigureOrganismsComponent, "Configure Organisms", null, config,
            {actions: [
                    {type: ActionType.PRIMARY, icon: null, name: "Save", internalAction: "prepareToSaveOrganism"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "cancel"}
                ]}).subscribe((result: any) => {
            if(result) {
                this.refreshOrganisms(result);
                this.refreshGenomeBuilds();
            }
        });
    }

    private refreshOrganisms(idOrganism: any): void {
        this.organismList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.ORGANISM);
        this.activeOrganismList = this.organismList.filter(org => org.isActive === "Y");
        let createdOrganism = this.activeOrganismList.filter(activeOrg => activeOrg.idOrganism === idOrganism);
        if(createdOrganism) {
            this.createAnalysisForm.get("organism").setValue(idOrganism);
            this.onOrganismSelect(idOrganism);
        }
    }

    private refreshGenomeBuilds(): void {
        this.genomeBuildList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.GENOME_BUILD).filter((build: any) => {
            return build.isActive === "Y" && build.idOrganism === this.createAnalysisForm.get("organism").value;
        });
    }

    public cancel() {
        this.dialogRef.close();
    }

}
