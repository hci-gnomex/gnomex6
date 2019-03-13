import {Component, OnDestroy, OnInit} from "@angular/core";
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

@Component({
    selector: 'analysis-info-tab',
    template: `
        <form [formGroup]="this.form" class="padded flex-container-row-children">
            <div class="form-row-children">
                <mat-form-field>
                    <input matInput placeholder="Lab Group" [formControlName]="'labName'">
                </mat-form-field>
                <span></span>
                <lazy-loaded-select placeholder="Owner" [options]="this.labUsers"
                                    valueField="idAppUser" displayField="displayName" [allowNone]="true"
                                    [control]="this.form.get('idAppUser')">
                </lazy-loaded-select>
            </div>
            <div class="form-row-children">
                <mat-form-field>
                    <input matInput placeholder="Name" [formControlName]="'name'">
                </mat-form-field>
                <span></span>
                <mat-form-field>
                    <input matInput placeholder="Submitter" [formControlName]="'submitterName'">
                </mat-form-field>
            </div>
            <div class="form-row-children">
                <div class="flex-container-row form-entry-children">
                    <lazy-loaded-select placeholder="Analysis Type" [options]="this.analysisTypes"
                                        valueField="value" displayField="display" [allowNone]="true"
                                        [control]="this.form.get('idAnalysisType')">
                    </lazy-loaded-select>
                    <button mat-button color="accent" [disabled]="this.form.controls['idAnalysisType'].disabled" (click)="this.openEditAnalysisType()">New/Edit</button>
                </div>
                <span></span>
                <mat-form-field>
                    <input matInput placeholder="Submit Date" [formControlName]="'submitDate'">
                </mat-form-field>
            </div>
            <div class="form-row-children">
                <div class="flex-container-row form-entry-children">
                    <lazy-loaded-select placeholder="Analysis Protocol" [options]="this.protocolList"
                                        valueField="id" displayField="label" [allowNone]="true"
                                        [control]="this.form.get('idAnalysisProtocol')">
                    </lazy-loaded-select>
                    <button mat-button color="accent" [disabled]="this.form.controls['idAnalysisProtocol'].disabled" (click)="this.openEditAnalysisProtocol()">New/Edit</button>
                </div>
                <span></span>
                <mat-radio-group class="flex-container-col" [formControlName]="'codeVisibility'">
                    <mat-radio-button *ngFor="let vis of this.visibilityList" [value]="vis.codeVisibility" matTooltip="{{vis.tooltip}}" [matTooltipPosition]="'left'">{{vis.display}}</mat-radio-button>
                </mat-radio-group>
            </div>
            <div *ngIf="this.propertyService.isPrivacyExpirationSupported">
                <span class="flex-two"></span>
                <span class="flex-one"></span>
                <mat-form-field matTooltip="Public visibility date (visibility automatically changes to public on this date)" [matTooltipPosition]="'left'" class="flex-two">
                    <input matInput [matDatepicker]="privacyPicker" placeholder="Privacy Expiration" [formControlName]="'privacyExpirationDate'" [min]="this.today">
                    <mat-datepicker-toggle matSuffix [for]="privacyPicker"></mat-datepicker-toggle>
                    <mat-datepicker #privacyPicker [disabled]="this.form.controls['codeVisibility'].disabled"></mat-datepicker>
                </mat-form-field>
            </div>
            <div class="form-row-children">
                <div class="flex-container-row form-entry-children">
                    <lazy-loaded-select placeholder="Organism" [options]="this.organismList"
                                        valueField="value" displayField="display" [allowNone]="true"
                                        [control]="this.form.get('idOrganism')">
                    </lazy-loaded-select>
                    <button mat-button color="accent" [disabled]="this.form.controls['idOrganism'].disabled" (click)="this.openEditOrganism()">New/Edit</button>
                </div>
                <span></span>
                <div>
                    <button mat-button color="accent" [disabled]="this.form.controls['codeVisibility'].disabled" (click)="this.openCollaboratorsWindow()">Collaborators</button>
                </div>
            </div>
            <div class="form-row-children">
                <div class="flex-container-col">
                    <div class="flex-container-row form-entry-children">
                        <mat-form-field>
                            <mat-select placeholder="Genome Builds" [formControlName]="'genomeBuildToAdd'">
                                <mat-option>None</mat-option>
                                <mat-option *ngFor="let build of this.genomeBuildList" [value]="build">{{build.display}}</mat-option>
                            </mat-select>
                        </mat-form-field>
                        <button mat-button (click)="this.addGenomeBuild()" [disabled]="this.form.controls['genomeBuildToAdd'].disabled || !this.form.controls['genomeBuildToAdd'].value">
                            <img src="../../../assets/add.png" class="icon">Add
                        </button>
                        <button mat-button (click)="this.removeGenomeBuild()" [disabled]="this.form.controls['genomeBuildToAdd'].disabled || !this.genomeBuildToRemove">
                            <img src="../../../assets/delete.png" class="icon">Remove
                        </button>
                        <button mat-button color="accent" [disabled]="this.form.controls['genomeBuildToAdd'].disabled" (click)="this.openEditOrganism()">New/Edit</button>
                    </div>
                    <div class="genome-build-grid-container">
                        <ag-grid-angular class="ag-theme-balham full-height full-width"
                                         (gridReady)="this.onGenomeBuildGridReady($event)"
                                         (gridSizeChanged)="this.onGridSizeChanged($event)"
                                         (rowClicked)="this.onGenomeBuildGridSelection($event)"
                                         [rowSelection]="'single'"
                                         [rowData]="this.form.controls['genomeBuildsJSONString'].value">
                        </ag-grid-angular>
                    </div>
                </div>
                <span></span>
                <div class="flex-container-col">
                    <mat-form-field>
                        <mat-select placeholder="Institution" [formControlName]="'idInstitution'">
                            <mat-option>None</mat-option>
                            <mat-option *ngFor="let inst of this.institutionList" [value]="inst.idInstitution">{{inst.display}}</mat-option>
                        </mat-select>
                    </mat-form-field>
                    <div>
                        <ul>Analysis Group(s)
                            <li *ngFor="let analysisGroup of this.form.controls['analysisGroupsJSONString'].value">{{analysisGroup.name}}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </form>
    `,
    styles: [`        
        * {
            font-size: 95%;
        }
        .padded {
            padding: 1em;
        }
        .flex-one {
            flex: 1;
        }
        .flex-two {
            flex: 2;
        }
        .flex-container-row-children > * {
            display: flex;
            flex-direction: row;
            align-items: center;
        }
        .form-row-children > * {
            flex: 2;
        }
        .form-row-children > span {
            flex: 1;
        }
        .form-entry-children > mat-form-field,
        .form-entry-children > lazy-loaded-select {
            flex: 4;
        }
        .form-entry-children > button {
            flex: 1;
        }
        div.genome-build-grid-container {
            width: 100%;
            height: 150px;
        }
    `]
})
export class AnalysisInfoTabComponent implements OnInit, OnDestroy {

    public analysis: any;
    public labUsers: any[] = [];
    public analysisTypes: any[] = [];
    public protocolList: any[] = [];
    private protocolListSubscription: Subscription;
    public visibilityList: any[] = [];
    public organismList: any[] = [];
    public genomeBuildList: any[] = [];
    private genomeBuildGridApi: GridApi;
    private genomeBuildGridColDefs: any[];
    private genomeBuildToRemove: RowNode;
    public institutionList: any[] = [];

    public form: FormGroup;
    public lab: any = null;

    public today: Date = new Date();

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
                public propertyService: PropertyService){
        this.form = this.formBuilder.group({
            labName: "",
            name: ["", Validators.required],
            idAnalysisType: "",
            idAnalysisProtocol: "",
            idOrganism: ["", Validators.required],
            genomeBuildsJSONString: [],
            analysisGroupsJSONString: [],
            idAppUser: ["", Validators.required],
            submitterName: "",
            submitDate: "",
            codeVisibility: ["", Validators.required],
            idInstitution: "",
            collaboratorsJSONString: [],
            genomeBuildToAdd: null,
            privacyExpirationDate: "",
        });

        this.genomeBuildGridColDefs = [
            {headerName: "Name", field: "display"}
        ];
    }

    ngOnInit() {
        this.analysisService.addAnalysisOverviewFormMember(this.form, this.constructor.name);
        this.analysisTypes = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.ANALYSIS_TYPE);
        this.protocolListSubscription = this.protocolService.getProtocolListObservable().subscribe((result: any[]) => {
            let protocols: any[] = [];
            for (let parent of result) {
                if(parent.Protocol){
                    protocols = protocols.concat(Array.isArray(parent.Protocol) ? parent.Protocol : [parent.Protocol.Protocol]);
                }

            }
            this.protocolList = protocols;
        });
        this.protocolService.getProtocolList(new HttpParams().set("protocolClassName",ProtocolService.ANALYSIS_PROTOCOL_CLASS_NAME));
        let visList: any[] = [];
        for (let vis of this.dictionaryService.getEntriesExcludeBlank(DictionaryService.VISIBILITY)) {
            let visOption: any = {
                display: vis.display,
                codeVisibility: vis.codeVisibility,
                tooltip: ''
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

        this.form.controls['labName'].disable();
        this.form.controls['submitterName'].disable();
        this.form.controls['submitDate'].disable();
        this.form.controls['analysisGroupsJSONString'].disable();
        this.form.controls['privacyExpirationDate'].disable();

        this.form.controls['idOrganism'].valueChanges.subscribe(() => {
            this.refreshGenomeBuilds();
        });
        this.form.controls['codeVisibility'].valueChanges.subscribe(() => {
            if (this.form.controls['codeVisibility'].value === 'INST' && this.form.controls['codeVisibility'].enabled) {
                this.form.controls['idInstitution'].enable();
            } else {
                this.form.controls['idInstitution'].disable();
            }
        });

        this.route.data.forEach((data: any) => {
            if (!data.analysis.Analysis) {
                return;
            }

            this.analysis = data.analysis.Analysis;

            this.form.controls['labName'].setValue(this.analysis.labName);
            this.form.controls['name'].setValue(this.analysis.name);
            this.form.controls['idAnalysisType'].setValue(this.analysis.idAnalysisType);
            this.form.controls['idAnalysisProtocol'].setValue(this.analysis.idAnalysisProtocol);
            this.form.controls['idOrganism'].setValue(this.analysis.idOrganism);
            this.form.controls['genomeBuildsJSONString'].setValue(Array.isArray(this.analysis.genomeBuilds) ? this.analysis.genomeBuilds : [this.analysis.genomeBuilds.GenomeBuild]);
            this.form.controls['analysisGroupsJSONString'].setValue(Array.isArray(this.analysis.analysisGroups) ? this.analysis.analysisGroups : [this.analysis.analysisGroups.AnalysisGroup]);
            this.form.controls['idAppUser'].setValue(this.analysis.idAppUser);
            this.form.controls['submitterName'].setValue(this.analysis.submitterName);
            this.form.controls['submitDate'].setValue(this.analysis.createDate);
            this.form.controls['codeVisibility'].setValue(this.analysis.codeVisibility);
            this.form.controls['idInstitution'].setValue(this.analysis.idInstitution ? this.analysis.idInstitution : "");
            this.form.controls['collaboratorsJSONString'].setValue(this.analysis.collaborators ? (Array.isArray(this.analysis.collaborators) ? this.analysis.collaborators : [this.analysis.collaborators.AnalysisCollaborator]) : []);
            this.form.controls['genomeBuildToAdd'].setValue(null);
            this.form.controls['privacyExpirationDate'].setValue(this.analysis.privacyExpirationDate ? this.analysis.privacyExpirationDate : "");
            this.genomeBuildToRemove = null;

            let canUpdate: boolean = this.analysis.canUpdate === 'Y';
            let canWriteAnyObject: boolean = this.createSecurityAdvisorService.hasPermission(CreateSecurityAdvisorService.CAN_WRITE_ANY_OBJECT);
            this.form.controls['idAppUser'].disable();
            if (canUpdate) {
                this.form.controls['name'].enable();
                this.form.controls['idAnalysisType'].enable();
                this.form.controls['idAnalysisProtocol'].enable();
                this.form.controls['idOrganism'].enable();
                this.form.controls['genomeBuildsJSONString'].enable();
                this.form.controls['codeVisibility'].enable();
                this.form.controls['idInstitution'].enable();
                this.form.controls['collaboratorsJSONString'].enable();
                this.form.controls['genomeBuildToAdd'].enable();
                if (canWriteAnyObject) {
                    this.form.controls['idAppUser'].enable();
                }
            } else {
                this.form.controls['name'].disable();
                this.form.controls['idAnalysisType'].disable();
                this.form.controls['idAnalysisProtocol'].disable();
                this.form.controls['idOrganism'].disable();
                this.form.controls['genomeBuildsJSONString'].disable();
                this.form.controls['codeVisibility'].disable();
                this.form.controls['idInstitution'].disable();
                this.form.controls['collaboratorsJSONString'].disable();
                this.form.controls['genomeBuildToAdd'].disable();

            }

            this.lab = null;
            this.institutionList = [];

            let owner: any = {idAppUser: this.analysis.idAppUser, displayName: this.analysis.ownerName};
            this.labUsers = [owner];
            if (canUpdate && canWriteAnyObject) {
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
                            if (list.filter((user: any) => {return user.idAppUser === manager.idAppUser}).length === 0) {
                                list.push(manager);
                            }
                        }
                        if (list.filter((user: any) => {return user.idAppUser === this.analysis.idAppUser}).length === 0) {
                            list.push(owner);
                        }
                        list.sort((a: any, b: any) => {
                            return (a.displayName as string).localeCompare((b.displayName as string));
                        });
                        this.labUsers = list;

                        if (result.Lab.institutions) {
                            this.institutionList = Array.isArray(result.Lab.institutions) ? result.Lab.institutions : [result.Lab.institutions.Institution];
                        }
                        if (this.analysis.idInstitution && this.institutionList.filter((inst: any) => {return inst.idInstitution === this.analysis.idInstitution}).length === 0) {
                            this.institutionList.push(this.dictionaryService.getEntry(DictionaryService.INSTITUTION, this.analysis.idInstitution));
                        }
                    } else {
                        let message: string = "";
                        if (result && result.message) {
                            message = ": " + result.message;
                        }
                        this.dialogsService.confirm("An error occurred while retrieving lab" + message, null);
                    }
                });
            }
        });
    }

    private refreshGenomeBuilds(): void {
        this.genomeBuildList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.GENOME_BUILD).filter((build: any) => {
            return build.isActive === 'Y' && build.idOrganism === this.form.controls['idOrganism'].value;
        });
    }

    public onGenomeBuildGridReady(event: GridReadyEvent): void {
        event.api.setColumnDefs(this.genomeBuildGridColDefs);
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
        if (this.form.controls['genomeBuildToAdd'].enabled && this.form.controls['genomeBuildToAdd'].value) {
            if (this.form.controls['genomeBuildsJSONString'].value.filter((build: any) => {return build.idGenomeBuild === this.form.controls['genomeBuildToAdd'].value.idGenomeBuild}).length === 0) {
                let newGenomeBuild: any = {
                    idGenomeBuild: this.form.controls['genomeBuildToAdd'].value.idGenomeBuild,
                    display: this.form.controls['genomeBuildToAdd'].value.display,
                };
                this.form.controls['genomeBuildsJSONString'].value.push(newGenomeBuild);
                this.genomeBuildGridApi.setRowData(this.form.controls['genomeBuildsJSONString'].value);
                this.form.markAsDirty();
            }
            this.form.controls['genomeBuildToAdd'].setValue(null);
        }
    }

    public removeGenomeBuild(): void {
        if (this.form.controls['genomeBuildToAdd'].enabled && this.genomeBuildToRemove) {
            this.form.controls['genomeBuildsJSONString'].value.splice(this.genomeBuildToRemove.rowIndex, 1);
            this.genomeBuildToRemove = null;
            this.genomeBuildGridApi.setRowData(this.form.controls['genomeBuildsJSONString'].value);
            this.form.markAsDirty();
        }
    }

    public openEditAnalysisType(): void {
        let config: MatDialogConfig = new MatDialogConfig();
        config.width = '1000px';
        config.height = '800px';
        let dialogRef: MatDialogRef<BrowseDictionaryComponent> = this.dialog.open(BrowseDictionaryComponent, config);
        dialogRef.afterClosed().subscribe(() => {
            this.dictionaryService.reloadAndRefresh(() => {
                this.analysisTypes = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.ANALYSIS_TYPE);
            }, null, DictionaryService.ANALYSIS_TYPE);
        });
    }

    public openEditAnalysisProtocol(): void {
        let manageProtocolsRoute: string = '/manage-protocols';
        if (this.form.dirty) {
            this.dialogsService.confirm("Unsaved changes will be lost. Proceed?", " ").subscribe((result: boolean) => {
                if (result) {
                    this.router.navigateByUrl(manageProtocolsRoute);
                }
            });
        } else {
            this.router.navigateByUrl(manageProtocolsRoute);
        }
    }

    public openEditOrganism(): void {
        let config: MatDialogConfig = new MatDialogConfig();
        config.width = '1000px';
        config.height = '800px';
        let dialogRef: MatDialogRef<ConfigureOrganismsComponent> = this.dialog.open(ConfigureOrganismsComponent, config);
        dialogRef.afterClosed().subscribe(() => {
            this.dictionaryService.reloadAndRefresh(() => {
                this.organismList = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.ORGANISM);
                this.refreshGenomeBuilds();
            });
        });
    }

    public openCollaboratorsWindow(): void {
        if (this.form.controls['codeVisibility'].disabled || this.form.controls['codeVisibility'].value === 'PUBLIC') {
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
                    this.dialogsService.confirm("An error occurred while retrieving lab" + message, null);
                }
            });
            return;
        }

        let possibleCollaborators: any[] = [];
        if (this.form.controls['codeVisibility'].value === 'MEM') {
            possibleCollaborators = this.lab.membersCollaborators ? (Array.isArray(this.lab.membersCollaborators) ? this.lab.membersCollaborators : [this.lab.membersCollaborators.AppUser]) : [];
        } else if (this.form.controls['codeVisibility'].value === 'OWNER') {
            possibleCollaborators = this.lab.possibleCollaborators ? (Array.isArray(this.lab.possibleCollaborators) ? this.lab.possibleCollaborators : [this.lab.possibleCollaborators.AppUser]) : [];
        }

        let config: MatDialogConfig = new MatDialogConfig();
        config.height = '33em';
        config.width  = '44em';
        config.panelClass = 'no-padding-dialog';

        config.data = {
            currentCollaborators:  this.form.controls['collaboratorsJSONString'].value,
            possibleCollaborators:  possibleCollaborators,
            idField: 'idAnalysis',
            idFieldValue: this.analysis.idAnalysis
        };

        let dialogRef: MatDialogRef<CollaboratorsDialogComponent> = this.dialog.open(CollaboratorsDialogComponent, config);
        dialogRef.afterClosed().subscribe((result: any[]) => {
            if (result) {
                this.form.controls['collaboratorsJSONString'].setValue(result);
                this.form.markAsDirty();
            }
        });
    }

    ngOnDestroy() {
        this.protocolListSubscription.unsubscribe();
    }

}
