import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DictionaryService} from "../../services/dictionary.service";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {GetLabService} from "../../services/get-lab.service";
import {HttpParams} from "@angular/common/http";
import {DialogsService} from "../../util/popup/dialogs.service";
import {ProtocolService} from "../../services/protocol.service";
import {ISubscription} from "rxjs/Subscription";
import {GridApi, GridReadyEvent, GridSizeChangedEvent, RowNode} from "ag-grid";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material";
import {BrowseDictionaryComponent} from "../../configuration/browse-dictionary.component";
import {ConfigureOrganismsComponent} from "../../configuration/configure-organisms.component";
import {PropertyService} from "../../services/property.service";
import {CollaboratorsDialogComponent} from "../../experiments/experiment-detail/collaborators-dialog.component";

@Component({
    selector: 'analysis-info-tab',
    template: `
        <form [formGroup]="this.form" class="padded flex-container-row-children">
            <div class="form-row-children">
                <mat-form-field>
                    <input matInput placeholder="Lab Group" [formControlName]="'lab'">
                </mat-form-field>
                <span></span>
                <mat-form-field>
                    <mat-select placeholder="Owner" [formControlName]="'owner'">
                        <mat-option>None</mat-option>
                        <mat-option *ngFor="let user of this.labUsers" [value]="user.idAppUser">{{user.displayName}}</mat-option>
                    </mat-select>
                </mat-form-field>
            </div>
            <div class="form-row-children">
                <mat-form-field>
                    <input matInput placeholder="Name" [formControlName]="'name'">
                </mat-form-field>
                <span></span>
                <mat-form-field>
                    <input matInput placeholder="Submitter" [formControlName]="'submitter'">
                </mat-form-field>
            </div>
            <div class="form-row-children">
                <div class="flex-container-row form-entry-children">
                    <mat-form-field>
                        <mat-select placeholder="Analysis Type" [formControlName]="'analysisType'">
                            <mat-option>None</mat-option>
                            <mat-option *ngFor="let analysisType of this.analysisTypes" [value]="analysisType.value">{{analysisType.display}}</mat-option>
                        </mat-select>
                    </mat-form-field>
                    <button mat-button color="accent" [disabled]="this.form.controls['analysisType'].disabled" (click)="this.openEditAnalysisType()">New/Edit</button>
                </div>
                <span></span>
                <mat-form-field>
                    <input matInput placeholder="Submit Date" [formControlName]="'submitDate'">
                </mat-form-field>
            </div>
            <div class="form-row-children">
                <div class="flex-container-row form-entry-children">
                    <mat-form-field>
                        <mat-select placeholder="Analysis Protocol" [formControlName]="'analysisProtocol'">
                            <mat-option>None</mat-option>
                            <mat-option *ngFor="let protocol of this.protocolList" [value]="protocol.id">{{protocol.label}}</mat-option>
                        </mat-select>
                    </mat-form-field>
                    <button mat-button color="accent" [disabled]="this.form.controls['analysisProtocol'].disabled" (click)="this.openEditAnalysisProtocol()">New/Edit</button>
                </div>
                <span></span>
                <mat-radio-group class="flex-container-col" [formControlName]="'visibility'">
                    <mat-radio-button *ngFor="let vis of this.visibilityList" [value]="vis.codeVisibility" matTooltip="{{vis.tooltip}}" [matTooltipPosition]="'left'">{{vis.display}}</mat-radio-button>
                </mat-radio-group>
            </div>
            <div *ngIf="this.propertyService.isPrivacyExpirationSupported">
                <span class="flex-two"></span>
                <span class="flex-one"></span>
                <mat-form-field matTooltip="Public visibility date (visibility automatically changes to public on this date)" [matTooltipPosition]="'left'" class="flex-two">
                    <input matInput [matDatepicker]="privacyPicker" placeholder="Privacy Expiration" [formControlName]="'privacyExp'" [min]="this.today">
                    <mat-datepicker-toggle matSuffix [for]="privacyPicker"></mat-datepicker-toggle>
                    <mat-datepicker #privacyPicker [disabled]="this.form.controls['visibility'].disabled"></mat-datepicker>
                </mat-form-field>
            </div>
            <div class="form-row-children">
                <div class="flex-container-row form-entry-children">
                    <mat-form-field>
                        <mat-select placeholder="Organism" [formControlName]="'organism'">
                            <mat-option>None</mat-option>
                            <mat-option *ngFor="let organism of this.organismList" [value]="organism.value">{{organism.display}}</mat-option>
                        </mat-select>
                    </mat-form-field>
                    <button mat-button color="accent" [disabled]="this.form.controls['organism'].disabled" (click)="this.openEditOrganism()">New/Edit</button>
                </div>
                <span></span>
                <div>
                    <button mat-button color="accent" [disabled]="this.form.controls['visibility'].disabled" (click)="this.openCollaboratorsWindow()">Collaborators</button>
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
                                         [rowData]="this.form.controls['genomeBuilds'].value">
                        </ag-grid-angular>
                    </div>
                </div>
                <span></span>
                <div class="flex-container-col">
                    <mat-form-field>
                        <mat-select placeholder="Institution" [formControlName]="'institution'">
                            <mat-option>None</mat-option>
                            <mat-option *ngFor="let inst of this.institutionList" [value]="inst.idInstitution">{{inst.display}}</mat-option>
                        </mat-select>
                    </mat-form-field>
                    <div>
                        <ul>Analysis Group(s)
                            <li *ngFor="let analysisGroup of this.form.controls['analysisGroups'].value">{{analysisGroup.name}}</li>
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
        .form-entry-children > mat-form-field {
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
    private protocolListSubscription: ISubscription;
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
                public propertyService: PropertyService){
        this.form = this.formBuilder.group({
            lab: "",
            name: ["", Validators.required],
            analysisType: "",
            analysisProtocol: "",
            organism: ["", Validators.required],
            genomeBuilds: [],
            analysisGroups: [],
            owner: ["", Validators.required],
            submitter: "",
            submitDate: "",
            visibility: ["", Validators.required],
            institution: "",
            collaborators: [],
            genomeBuildToAdd: null,
            privacyExp: "",
        });

        this.genomeBuildGridColDefs = [
            {headerName: "Name", field: "display"}
        ];
    }

    ngOnInit() {
        this.analysisTypes = this.dictionaryService.getEntriesExcludeBlank(DictionaryService.ANALYSIS_TYPE);
        this.protocolListSubscription = this.protocolService.getProtocolListObservable().subscribe((result: any[]) => {
            let protocols: any[] = [];
            for (let parent of result) {
                protocols = protocols.concat(Array.isArray(parent.Protocol) ? parent.Protocol : [parent.Protocol.Protocol]);
            }
            this.protocolList = protocols;
        });
        this.protocolService.getProtocolList();
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

        this.form.controls['lab'].disable();
        this.form.controls['submitter'].disable();
        this.form.controls['submitDate'].disable();
        this.form.controls['analysisGroups'].disable();
        this.form.controls['privacyExp'].disable();

        this.form.controls['organism'].valueChanges.subscribe(() => {
            this.refreshGenomeBuilds();
        });
        this.form.controls['visibility'].valueChanges.subscribe(() => {
            if (this.form.controls['visibility'].value === 'INST' && this.form.controls['visibility'].enabled) {
                this.form.controls['institution'].enable();
            } else {
                this.form.controls['institution'].disable();
            }
        });

        this.route.data.forEach((data: any) => {
            this.analysis = data.analysis.Analysis;

            this.form.controls['lab'].setValue(this.analysis.labName);
            this.form.controls['name'].setValue(this.analysis.name);
            this.form.controls['analysisType'].setValue(this.analysis.idAnalysisType);
            this.form.controls['analysisProtocol'].setValue(this.analysis.idAnalysisProtocol);
            this.form.controls['organism'].setValue(this.analysis.idOrganism);
            this.form.controls['genomeBuilds'].setValue(Array.isArray(this.analysis.genomeBuilds) ? this.analysis.genomeBuilds : [this.analysis.genomeBuilds.GenomeBuild]);
            this.form.controls['analysisGroups'].setValue(Array.isArray(this.analysis.analysisGroups) ? this.analysis.analysisGroups : [this.analysis.analysisGroups.AnalysisGroup]);
            this.form.controls['owner'].setValue(this.analysis.idAppUser);
            this.form.controls['submitter'].setValue(this.analysis.submitterName);
            this.form.controls['submitDate'].setValue(this.analysis.createDate);
            this.form.controls['visibility'].setValue(this.analysis.codeVisibility);
            this.form.controls['institution'].setValue(this.analysis.idInstitution ? this.analysis.idInstitution : "");
            this.form.controls['collaborators'].setValue(this.analysis.collaborators ? (Array.isArray(this.analysis.collaborators) ? this.analysis.collaborators : [this.analysis.collaborators.AnalysisCollaborator]) : []);
            this.form.controls['genomeBuildToAdd'].setValue(null);
            this.form.controls['privacyExp'].setValue(this.analysis.privacyExpirationDate ? this.analysis.privacyExpirationDate : "");
            this.genomeBuildToRemove = null;

            let canUpdate: boolean = this.analysis.canUpdate === 'Y';
            let canWriteAnyObject: boolean = this.createSecurityAdvisorService.hasPermission(CreateSecurityAdvisorService.CAN_WRITE_ANY_OBJECT);
            this.form.controls['owner'].disable();
            if (canUpdate) {
                this.form.controls['name'].enable();
                this.form.controls['analysisType'].enable();
                this.form.controls['analysisProtocol'].enable();
                this.form.controls['organism'].enable();
                this.form.controls['genomeBuilds'].enable();
                this.form.controls['visibility'].enable();
                this.form.controls['institution'].enable();
                this.form.controls['collaborators'].enable();
                this.form.controls['genomeBuildToAdd'].enable();
                if (canWriteAnyObject) {
                    this.form.controls['owner'].enable();
                }
            } else {
                this.form.controls['name'].disable();
                this.form.controls['analysisType'].disable();
                this.form.controls['analysisProtocol'].disable();
                this.form.controls['organism'].disable();
                this.form.controls['genomeBuilds'].disable();
                this.form.controls['visibility'].disable();
                this.form.controls['institution'].disable();
                this.form.controls['collaborators'].disable();
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
            return build.isActive === 'Y' && build.idOrganism === this.form.controls['organism'].value;
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
            if (this.form.controls['genomeBuilds'].value.filter((build: any) => {return build.idGenomeBuild === this.form.controls['genomeBuildToAdd'].value.idGenomeBuild}).length === 0) {
                let newGenomeBuild: any = {
                    idGenomeBuild: this.form.controls['genomeBuildToAdd'].value.idGenomeBuild,
                    display: this.form.controls['genomeBuildToAdd'].value.display,
                };
                this.form.controls['genomeBuilds'].value.push(newGenomeBuild);
                this.genomeBuildGridApi.setRowData(this.form.controls['genomeBuilds'].value);
                this.form.markAsDirty();
            }
            this.form.controls['genomeBuildToAdd'].setValue(null);
        }
    }

    public removeGenomeBuild(): void {
        if (this.form.controls['genomeBuildToAdd'].enabled && this.genomeBuildToRemove) {
            this.form.controls['genomeBuilds'].value.splice(this.genomeBuildToRemove.rowIndex, 1);
            this.genomeBuildToRemove = null;
            this.genomeBuildGridApi.setRowData(this.form.controls['genomeBuilds'].value);
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
        if (this.form.controls['visibility'].disabled || this.form.controls['visibility'].value === 'PUBLIC') {
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
        if (this.form.controls['visibility'].value === 'MEM') {
            possibleCollaborators = this.lab.membersCollaborators ? (Array.isArray(this.lab.membersCollaborators) ? this.lab.membersCollaborators : [this.lab.membersCollaborators.AppUser]) : [];
        } else if (this.form.controls['visibility'].value === 'OWNER') {
            possibleCollaborators = this.lab.possibleCollaborators ? (Array.isArray(this.lab.possibleCollaborators) ? this.lab.possibleCollaborators : [this.lab.possibleCollaborators.AppUser]) : [];
        }

        let config: MatDialogConfig = new MatDialogConfig();
        config.height = '33em';
        config.width  = '44em';
        config.panelClass = 'no-padding-dialog';

        config.data = {
            currentCollaborators:  this.form.controls['collaborators'].value,
            possibleCollaborators:  possibleCollaborators,
            idField: 'idAnalysis',
            idFieldValue: this.analysis.idAnalysis
        };

        let dialogRef: MatDialogRef<CollaboratorsDialogComponent> = this.dialog.open(CollaboratorsDialogComponent, config);
        dialogRef.afterClosed().subscribe((result: any[]) => {
            if (result) {
                this.form.controls['collaborators'].setValue(result);
            }
        });
    }

    ngOnDestroy() {
        this.protocolListSubscription.unsubscribe();
    }

}
