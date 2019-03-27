import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material";
import {URLSearchParams} from "@angular/http";
import {
    AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, ViewChild,
} from "@angular/core";
import {AnalysisService} from "../services/analysis.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {GetLabService} from "../services/get-lab.service";
import {DictionaryService} from "../services/dictionary.service";
import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {NewOrganismComponent} from "../util/new-organism.component";
import {NewGenomeBuildComponent} from "../util/new-genome-build.component";
import {HttpParams} from "@angular/common/http";
import {first} from "rxjs/operators";
import {ConstantsService} from "../services/constants.service";
import {UserPreferencesService} from "../services/user-preferences.service";
import jqxComboBox = jqwidgets.jqxComboBox;
import {Router} from "@angular/router";
import {GnomexService} from "../services/gnomex.service";

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
            width: 350px;
        }

    `]
})

export class CreateAnalysisComponent implements OnInit, AfterViewInit {
    @ViewChild("labCombo") labCombo: jqxComboBox;
    @ViewChild("analysisGroupCombo") analysisGroupCombo: jqxComboBox;
    @ViewChild("organismCombo") organismCombo: jqxComboBox;

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
    public showSpinner: boolean = false;
    public newAnalysisName: string;
    public newAnalysisId: string;
    public selectedAnalysisGroup: string;
    public selectedOrganism: string;
    public selectedLab: string;

    private items: any[];
    private idLabString: string;
    private idAnalysisGroup: string;
    private idAppUser: string = "";
    private organismList: any[] = [];
    private analysisLabList: any[] = [];
    private idOrganism: string;
    private selectedAnalysisLabItem: any;
    private organism: any;
    private genomBuilds: any[] = [];
    private analysisGroup: any[] = [];
    private codeVisibility: string;
    private parentComponent: string = "";

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
        this.labList = data.labList;
        this.items = data.items;
        this.selectedLab = data.selectedLab;
        this.selectedAnalysisGroup = data.selectedAnalysisGroup;
        this.selectedOrganism = data.selectedOrganism;
        this.parentComponent = data.parentComponent;
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
            ]]
        });
        if (this.createSecurityAdvisorService.isAdmin) {
            this.createAnalysisForm.addControl("analysisOwner", new FormControl("", Validators.required));
        }
    }

    ngOnInit() {
        this.organismList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.ORGANISM);
        this.visibilityList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.VISIBILITY);

        this.activeOrganismList = this.organismList.filter(org =>
            org.isActive === "Y");

        if (this.createSecurityAdvisorService.isAdmin) {
            this.showOwnerComboBox = true;
        }
    }

    ngAfterViewInit() {
        setTimeout(() => {
            if(this.selectedLab) {
                this.labCombo.selectItem(this.selectedLab);
            }

            if(this.selectedOrganism) {
                this.organismCombo.selectItem(this.selectedOrganism);
            }
        });

        setTimeout(() => {
            if(this.selectedAnalysisGroup && this.analysisGroupList.length > 0) {
                for(let ag of this.analysisGroupList) {
                    if(ag.idAnalysisGroup === this.selectedAnalysisGroup) {
                        this.analysisGroupCombo.selectItem(this.selectedAnalysisGroup);
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
        if (event.args && event.args.item && event.args.item.value) {
            this.selectedAnalysisLabItem = event.args.item.originalItem;
            this.analysisGroupList = [];

            this.dialogsService.startDefaultSpinnerDialog();

            this.idLabString = event.args.item.value;
            if (this.showOwnerComboBox) {
                this.getLabService.getLabByIdOnlyForHistoricalOwnersAndSubmitters(this.idLabString).subscribe((response: any) => {
                    this.ownerList = response.Lab.historicalOwnersAndSubmitters;
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
                    let ids: URLSearchParams = new URLSearchParams;

                    ids.set("idLab", this.idLabString);
                    this.analysisService.getAnalysisGroupList(ids).subscribe((response: any) => {
                        if (response && response.AnalysisGroup) {
                            if (!this.isArray(response.AnalysisGroup)) {
                                this.analysisGroupList = [response.AnalysisGroup];
                            } else {
                                this.analysisGroupList = response.AnalysisGroup;
                            }
                        }
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
        if (event.args && event.args.item && event.args.item.value) {
            this.idAnalysisGroup = event.args.item.value;
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
        if (event.args && event.args.item && event.args.item.value) {
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
        if (event.args !== undefined && event.args.item != null && event.args.item.value != null) {

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
        if (event.args && event.args.item && event.args.item.value) {

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
        this.dialogsService.startDefaultSpinnerDialog();
        var idAnalysis: any = 0;
        var params: HttpParams = new HttpParams();
        var stringifiedGenomBuild;
        if (this.genomBuilds.length > 0) {
            stringifiedGenomBuild = JSON.stringify(this.genomBuilds);
        }
        var stringifiedAnalysisGroup;
        if (this.analysisGroup.length > 0) {
            stringifiedAnalysisGroup = JSON.stringify(this.analysisGroup);
        }
        params = params.set("lanesXMLString", "")
            .set("samplesJSONString", "")
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
                    this.gnomexService.navByNumber("A" + resp.idAnalysis);
                } else if(this.parentComponent === "Analysis") {
                    this.dialogsService.stopAllSpinnerDialogs();
                    this.analysisService.createdAnalysis = resp.idAnalysis;
                    this.analysisService.refreshAnalysisGroupList_fromBackend();
                }

                this.dialogRef.close();

            } else if(resp && resp.message) {
                this.dialogsService.alert(resp.message);
                this.dialogsService.stopAllSpinnerDialogs();
            }

        }, (err) => {
            this.dialogsService.alert(err);
            this.dialogsService.stopAllSpinnerDialogs();
        });

    }

    /**
     * The yes button was selected in the delete project dialog.
     */
    createAnalysisYesButtonClicked() {
        if (this.genomBuilds.length === 0) {
            this.dialogsService
                .confirm("Warning", "A genome build has not been specified. Create new analysis anyway?")
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
        let dialogRef: MatDialogRef<NewOrganismComponent> = this.dialog.open(NewOrganismComponent, {
            height: "430px",
            width: "300px",
        });
    }

    newGenomeBuild() {
        let dialogRef: MatDialogRef<NewGenomeBuildComponent> = this.dialog.open(NewGenomeBuildComponent, {
            height: "430px",
            width: "300px",
        });
    }

}
