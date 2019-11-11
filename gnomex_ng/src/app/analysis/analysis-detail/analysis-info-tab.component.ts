import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DictionaryService} from "../../services/dictionary.service";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {GetLabService} from "../../services/get-lab.service";
import {HttpParams} from "@angular/common/http";
import {DialogsService} from "../../util/popup/dialogs.service";
import {ProtocolService} from "../../services/protocol.service";
import {Subscription} from "rxjs";
import {GridApi, GridReadyEvent, GridSizeChangedEvent, RowNode} from "ag-grid-community";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material";
import {BrowseDictionaryComponent} from "../../configuration/browse-dictionary.component";
import {ConfigureOrganismsComponent} from "../../configuration/configure-organisms.component";
import {PropertyService} from "../../services/property.service";
import {CollaboratorsDialogComponent} from "../../experiments/experiment-detail/collaborators-dialog.component";
import {AnalysisService} from "../../services/analysis.service";
import {UserPreferencesService} from "../../services/user-preferences.service";
import {ActionType} from "../../util/interfaces/generic-dialog-action.model";
import {ConstantsService} from "../../services/constants.service";
import {ManageProtocolsComponent} from "../../configuration/manage-protocols.component";

@Component({
    selector: "analysis-info-tab",
    templateUrl: "analysis-info-tab.component.html",
    styles: [`
        
        .column-width {
            min-width: 12em;
            width: 35em;
        }
        
        .horizontal-spacer {
            width: 2em;
        }
        
        .min-grid-height {
            min-height: 8em;
        }
        
    `]
})
export class AnalysisInfoTabComponent implements OnInit, OnDestroy, OnChanges {
    @Input() public isEditMode: boolean = false;

    public analysis: any;
    public labUsers: any[] = [];
    public analysisTypes: any[] = [];
    public protocolList: any[] = [];
    public visibilityList: any[] = [];
    public organismList: any[] = [];
    public genomeBuildList: any[] = [];
    public institutionList: any[] = [];

    public form: FormGroup;
    public lab: any = null;

    public canUpdate: boolean = false;
    public canWriteAnyObject: boolean = false;

    public today: Date = new Date();
    private protocolListSubscription: Subscription;
    private genomeBuildGridApi: GridApi;
    private genomeBuildToRemove: RowNode;

    constructor(private route: ActivatedRoute,
                private formBuilder: FormBuilder,
                private dictionaryService: DictionaryService,
                private createSecurityAdvisorService: CreateSecurityAdvisorService,
                private getLabService: GetLabService,
                private dialogsService: DialogsService,
                private protocolService: ProtocolService,
                private dialog: MatDialog,
                private router: Router,
                private analysisService: AnalysisService,
                public prefService: UserPreferencesService,
                public propertyService: PropertyService,
                private constantsService: ConstantsService) {

        this.form = this.formBuilder.group({
            labName: [{value: "", disabled: true}],
            name: [{value: "", disabled: true}, Validators.required],
            idAnalysisType: [{value: "", disabled: true}],
            idAnalysisProtocol: [{value: "", disabled: true}],
            idOrganism: [{value: "", disabled: true}, Validators.required],
            genomeBuildsJSONString: [],
            analysisGroupsJSONString: [],
            idAppUser: [{value: "", disabled: true}, Validators.required],
            submitterName: [{value: "", disabled: true}],
            submitDate: [{value: "", disabled: true}],
            codeVisibility: [{value: "", disabled: true}, Validators.required],
            idInstitution: [{value: "", disabled: true}],
            collaboratorsJSONString: [],
            genomeBuildToAdd: null,
            privacyExpirationDate: [{value: "", disabled: true}],
        });
    }

    ngOnInit() {
        this.analysisService.addAnalysisOverviewFormMember(this.form, this.constructor.name);
        this.analysisTypes = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.ANALYSIS_TYPE);
        this.protocolListSubscription = this.protocolService.getProtocolListObservable().subscribe((result: any[]) => {
            let protocols: any[] = [];
            for (let parent of result) {
                if(parent.Protocol) {
                    protocols = protocols.concat(Array.isArray(parent.Protocol) ? parent.Protocol : [parent.Protocol.Protocol]);
                }

            }
            this.protocolList = protocols;
        });
        this.protocolService.getProtocolList(new HttpParams().set("protocolClassName", ProtocolService.ANALYSIS_PROTOCOL_CLASS_NAME));
        let visList: any[] = [];
        for (let vis of this.dictionaryService.getEntriesExcludeBlank(DictionaryService.VISIBILITY)) {
            let visOption: any = {
                display: vis.display,
                codeVisibility: vis.codeVisibility,
                tooltip: ""
            };
            if (visOption.codeVisibility === "OWNER") {
                visOption.tooltip = "Visible to the submitter and the lab PI";
            } else if (visOption.codeVisibility === "MEM") {
                visOption.tooltip = "Visible to all members of the lab group";
            } else if (visOption.codeVisibility === "INST") {
                visOption.tooltip = "Visible to all lab groups that are part of institution";
            } else if (visOption.codeVisibility === "PUBLIC") {
                if (!this.propertyService.isPublicVisbility()) {
                    continue;
                }
                visOption.tooltip = "Visible to everyone";
            }
            visList.push(visOption);
        }
        this.visibilityList = visList;
        this.organismList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.ORGANISM);

        this.form.controls["idOrganism"].valueChanges.subscribe(() => {
            this.refreshGenomeBuilds();
        });
        this.form.controls["codeVisibility"].valueChanges.subscribe(() => {
            if (this.form.controls["codeVisibility"].value === "INST" && this.form.controls["codeVisibility"].enabled && this.isEditMode) {
                this.form.controls["idInstitution"].enable();
            } else {
                this.form.controls["idInstitution"].disable();
            }
        });

        this.route.data.forEach((data: any) => {
            if (!data.analysis || !data.analysis.Analysis) {
                return;
            }

            this.analysis = data.analysis.Analysis;

            this.form.controls["labName"].setValue(this.analysis.labName);
            this.form.controls["name"].setValue(this.analysis.name);
            this.form.controls["idAnalysisType"].setValue(this.analysis.idAnalysisType);
            this.form.controls["idAnalysisProtocol"].setValue(this.analysis.idAnalysisProtocol);
            this.form.controls["idOrganism"].setValue(this.analysis.idOrganism);
            this.form.controls["genomeBuildsJSONString"].setValue(Array.isArray(this.analysis.genomeBuilds) ? this.analysis.genomeBuilds : [this.analysis.genomeBuilds.GenomeBuild]);
            this.form.controls["analysisGroupsJSONString"].setValue(Array.isArray(this.analysis.analysisGroups) ? this.analysis.analysisGroups : [this.analysis.analysisGroups.AnalysisGroup]);
            this.form.controls["idAppUser"].setValue(this.analysis.idAppUser);
            this.form.controls["submitterName"].setValue(this.analysis.submitterName);
            this.form.controls["submitDate"].setValue(this.analysis.createDate);
            this.form.controls["codeVisibility"].setValue(this.analysis.codeVisibility);
            this.form.controls["idInstitution"].setValue(this.analysis.idInstitution ? this.analysis.idInstitution : "");
            this.form.controls["collaboratorsJSONString"].setValue(this.analysis.collaborators ? (Array.isArray(this.analysis.collaborators) ? this.analysis.collaborators : [this.analysis.collaborators.AnalysisCollaborator]) : []);
            this.form.controls["genomeBuildToAdd"].setValue(null);
            this.form.controls["privacyExpirationDate"].setValue(this.analysis.privacyExpirationDate ? this.analysis.privacyExpirationDate : "");
            this.genomeBuildToRemove = null;

            this.canUpdate = this.analysis.canUpdate === "Y";
            this.canWriteAnyObject = this.createSecurityAdvisorService.hasPermission(CreateSecurityAdvisorService.CAN_WRITE_ANY_OBJECT);
            this.updateForm();

            this.lab = null;
            this.institutionList = [];

            let owner: any = {idAppUser: this.analysis.idAppUser};
            owner[this.prefService.userDisplayField] = this.analysis.ownerName;
            this.labUsers = [owner];
            if (this.canUpdate && this.canWriteAnyObject) {
                let params: HttpParams = new HttpParams()
                    .set("idLab", this.analysis.idLab)
                    .set("includeBillingAccounts", "N")
                    .set("includeProductCounts", "N");
                this.getLabService.getLabNew(params).subscribe((result: any) => {
                    if (result && result.Lab) {
                        this.lab = result.Lab;
                        let list: any[] = Array.isArray(result.Lab.members) ? result.Lab.members : [result.Lab.members.AppUser];
                        let managers: any[] = Array.isArray(result.Lab.managers) ? result.Lab.managers : [result.Lab.managers.AppUser];
                        for (let manager of managers) {
                            if (list.filter((user: any) => {return user.idAppUser === manager.idAppUser; }).length === 0) {
                                list.push(manager);
                            }
                        }
                        if (list.filter((user: any) => {return user.idAppUser === this.analysis.idAppUser; }).length === 0) {
                            list.push(owner);
                        }
                        list.sort(this.createAppUserSortFunction(this.prefService.userDisplayField));
                        this.labUsers = list;

                        if (result.Lab.institutions) {
                            this.institutionList = Array.isArray(result.Lab.institutions) ? result.Lab.institutions : [result.Lab.institutions.Institution];
                        }
                        if (this.analysis.idInstitution && this.institutionList.filter((inst: any) => {return inst.idInstitution === this.analysis.idInstitution; }).length === 0) {
                            this.institutionList.push(this.dictionaryService.getEntry(DictionaryService.INSTITUTION, this.analysis.idInstitution));
                        }
                    } else {
                        let message: string = "";
                        if (result && result.message) {
                            message = ": " + result.message;
                        }
                        this.dialogsService.error("An error occurred while retrieving lab" + message);
                    }
                });
            }
        });
    }

    private createAppUserSortFunction(userDisplayField: string): (a, b) => number {
        return (a, b) => {
            if (!a && !b) {
                return 0;
            } else if (a && !b) {
                return 1;
            } else if (!a && b) {
                return -1;
            } else {
                let aDisplay: string = a[userDisplayField] ? a[userDisplayField] : "";
                let bDisplay: string = b[userDisplayField] ? b[userDisplayField] : "";
                return (aDisplay.localeCompare(bDisplay));
            }
        }
    }

    private refreshGenomeBuilds(): void {
        this.genomeBuildList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.GENOME_BUILD).filter((build: any) => {
            return build.isActive === 'Y' && build.idOrganism === this.form.controls['idOrganism'].value;
        });
    }

    public onGenomeBuildGridReady(event: GridReadyEvent): void {
        event.api.setColumnDefs([
            {headerName: "Genome Builds", field: "display"}
        ]);
        event.api.sizeColumnsToFit();
        this.genomeBuildGridApi = event.api;
    }

    public onGridSizeChanged(event: GridSizeChangedEvent): void {
        event.api.sizeColumnsToFit();
    }

    public onGenomeBuildGridSelection(event: any): void {
        if (event.node.selected) {
            this.genomeBuildToRemove = event.node;
        }
    }

    public addGenomeBuild(): void {
        if (this.form.controls["genomeBuildToAdd"].enabled && this.form.controls["genomeBuildToAdd"].value) {
            if (this.form.controls["genomeBuildsJSONString"].value.filter((build: any) => {return build.idGenomeBuild === this.form.controls["genomeBuildToAdd"].value.idGenomeBuild; }).length === 0) {
                let newGenomeBuild: any = {
                    idGenomeBuild: this.form.controls["genomeBuildToAdd"].value.idGenomeBuild,
                    display: this.form.controls["genomeBuildToAdd"].value.display,
                };
                this.form.controls["genomeBuildsJSONString"].value.push(newGenomeBuild);
                this.genomeBuildGridApi.setRowData(this.form.controls["genomeBuildsJSONString"].value);
                this.form.markAsDirty();
            }
            this.form.controls["genomeBuildToAdd"].setValue(null);
        }
    }

    public removeGenomeBuild(): void {
        if (this.form.controls["genomeBuildToAdd"].enabled && this.genomeBuildToRemove) {
            this.form.controls["genomeBuildsJSONString"].value.splice(this.genomeBuildToRemove.rowIndex, 1);
            this.genomeBuildToRemove = null;
            this.genomeBuildGridApi.setRowData(this.form.controls["genomeBuildsJSONString"].value);
            this.form.markAsDirty();
        }
    }

    public openEditAnalysisType(): void {
        let config: MatDialogConfig = new MatDialogConfig();
        config.width = "75em";
        config.height = "50em";
        config.panelClass = "no-padding-dialog";
        config.autoFocus = false;
        config.disableClose = true;
        config.data = {
            isDialog: true,
            preSelectedDictionary: DictionaryService.ANALYSIS_TYPE,
            preSelectedEntry: this.form.controls["idAnalysisType"].value
        };

        this.dialogsService.genericDialogContainer(BrowseDictionaryComponent, "Dictionary Editor", null, config,
            {actions: [
                    {type: ActionType.PRIMARY, icon: null, name: "Save", internalAction: "save"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "cancel"}
                ]}).subscribe(() => {
                    this.dictionaryService.reloadAndRefresh(() => {
                        this.analysisTypes = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.ANALYSIS_TYPE);
                        }, null, DictionaryService.ANALYSIS_TYPE);
        });
    }

    public openEditAnalysisProtocol(): void {
        if(this.form.dirty) {
            this.dialogsService.confirm("Unsaved changes will be lost. Proceed?").subscribe((result: any) => {
                if(!result) {
                    return;
                }
            });
        }

        let config: MatDialogConfig = new MatDialogConfig();
        config.width = "75em";
        config.height = "50em";
        config.autoFocus = false;
        config.data = {
            isDialog: true,
            preSelectedDictionary: ProtocolService.ANALYSIS_PROTOCOL_CLASS_NAME,
            preSelectedEntry: this.form.controls["idAnalysisProtocol"].value
        };

        this.dialogsService.genericDialogContainer(ManageProtocolsComponent, "Analysis Protocols", null, config,
            {actions: [
                    {type: ActionType.PRIMARY, icon: null, name: "Save", internalAction: "save"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "cancel"}
                ]});
    }

    public openEditOrganism(): void {
        let config: MatDialogConfig = new MatDialogConfig();
        config.width = "1000px";
        config.height = "790px";
        config.panelClass = "no-padding-dialog";
        config.autoFocus = false;
        config.disableClose = true;
        config.data = {
            isDialog: true,
            preSelectedOrganism: this.form.controls["idOrganism"].value,
        };

        this.dialogsService.genericDialogContainer(ConfigureOrganismsComponent, "Configure Organisms", null, config,
            {actions: [
                    {type: ActionType.PRIMARY, icon: null, name: "Save", internalAction: "prepareToSaveOrganism"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "cancel"}
                ]}).subscribe((result: any) => {
                    if(result) {
                        this.dictionaryService.reloadAndRefresh(() => {
                            this.organismList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.ORGANISM);
                            this.refreshGenomeBuilds();
                        });
                    }
        });
    }

    public openCollaboratorsWindow(): void {
        if (this.form.controls["codeVisibility"].disabled || this.form.controls["codeVisibility"].value === "PUBLIC") {
            return;
        }
        if (!this.lab) {
            let params: HttpParams = new HttpParams()
                .set("idLab", this.analysis.idLab)
                .set("includeBillingAccounts", "N")
                .set("includeProductCounts", "N");
            this.getLabService.getLabNew(params).subscribe((result: any) => {
                if (result && result.Lab) {
                    this.lab = result.Lab;
                    this.openCollaboratorsWindow();
                } else {
                    let message: string = "";
                    if (result && result.message) {
                        message = ": " + result.message;
                    }
                    this.dialogsService.error("An error occurred while retrieving lab" + message);
                }
            });
            return;
        }

        let possibleCollaborators: any[] = [];
        if (this.form.controls["codeVisibility"].value === "MEM") {
            possibleCollaborators = this.lab.membersCollaborators ? (Array.isArray(this.lab.membersCollaborators) ? this.lab.membersCollaborators : [this.lab.membersCollaborators.AppUser]) : [];
        } else if (this.form.controls["codeVisibility"].value === "OWNER") {
            possibleCollaborators = this.lab.possibleCollaborators ? (Array.isArray(this.lab.possibleCollaborators) ? this.lab.possibleCollaborators : [this.lab.possibleCollaborators.AppUser]) : [];
        }

        let config: MatDialogConfig = new MatDialogConfig();
        config.height = "33em";
        config.width  = "44em";
        config.panelClass = "no-padding-dialog";
        config.disableClose = true;
        config.autoFocus = false;

        config.data = {
            currentCollaborators:  this.form.controls["collaboratorsJSONString"].value,
            possibleCollaborators:  possibleCollaborators,
            idField: "idAnalysis",
            idFieldValue: this.analysis.idAnalysis
        };

        this.dialogsService.genericDialogContainer(CollaboratorsDialogComponent, "Collaborators for Analysis A" + this.analysis.idAnalysis, this.constantsService.ICON_GROUP, config,
            {actions: [
                    {type: ActionType.PRIMARY, name: "Update", internalAction: "onClickUpdate"},
                    {type: ActionType.SECONDARY, name: "Cancel", internalAction: "cancel"}
                ]}).subscribe((result: any) => {
                    if(result) {
                        this.form.controls["collaboratorsJSONString"].setValue(result);
                        this.form.markAsDirty();
                    }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.updateForm();
    }


    ngOnDestroy() {
        this.protocolListSubscription.unsubscribe();
    }

    updateForm(): void {
        this.form.controls["idAppUser"].disable();
        if (this.canUpdate && this.isEditMode) {
            this.form.controls["name"].enable();
            this.form.controls["idAnalysisType"].enable();
            this.form.controls["idAnalysisProtocol"].enable();
            this.form.controls["idOrganism"].enable();
            this.form.controls["genomeBuildsJSONString"].enable();
            this.form.controls["codeVisibility"].enable();
            this.form.controls["idInstitution"].enable();
            this.form.controls["collaboratorsJSONString"].enable();
            this.form.controls["genomeBuildToAdd"].enable();
            if (this.canWriteAnyObject) {
                this.form.controls["idAppUser"].enable();
            }
        } else {
            this.form.controls["name"].disable();
            this.form.controls["idAnalysisType"].disable();
            this.form.controls["idAnalysisProtocol"].disable();
            this.form.controls["idOrganism"].disable();
            this.form.controls["genomeBuildsJSONString"].disable();
            this.form.controls["codeVisibility"].disable();
            this.form.controls["idInstitution"].disable();
            this.form.controls["collaboratorsJSONString"].disable();
            this.form.controls["genomeBuildToAdd"].disable();

        }
    }
}
