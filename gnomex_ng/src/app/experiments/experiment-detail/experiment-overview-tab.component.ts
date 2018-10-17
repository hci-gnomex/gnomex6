import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {DictionaryService} from "../../services/dictionary.service";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {LabListService} from "../../services/lab-list.service";
import {GetLabService} from "../../services/get-lab.service";
import {Subscription} from "rxjs/Subscription";
import {DialogsService} from "../../util/popup/dialogs.service";
import {PropertyService} from "../../services/property.service";
import {ConstantsService} from "../../services/constants.service";
import {FormControl} from "@angular/forms";
import {MatDialog, MatDialogConfig} from "@angular/material";
import {CollaboratorsDialogComponent} from "./collaborators-dialog.component";


@Component({
    selector: 'experiment-overview-tab',
    templateUrl: 'experiment-overview-tab.component.html',
    styles: [`
        
        .text-center { text-align: center; }
        
        .padded { padding: 0.3em; }
        
        .small-font { font-size: small;   }
        .tiny-font  { font-size: x-small; }

        .underline { text-decoration: underline; }
        
        .label {  
            color: blue;  
            font-style: italic;
        }
        
        .label-width { width: 7rem; }
        
        .minor-label { font-style: italic; }
        
        .minor-label-width { width: 6rem; }
        
        .field-width { 
            min-width: 35em;
            width: 40em;
        }

        .bordered {
            border: solid silver 1px;
            border-radius: 0.3em;
        }

        .multi-line { white-space: pre-line; }
        
        .max-height {
            max-height: 6em;
            overflow: auto;
        }
        
        .limit-width { max-width: 100%; }
        
        .padded { padding: 0.3em; }
        
        .margin { margin: 0.5em; }
        
        .margin-top { margin-top: 0.3em; }
        .margin-top-bottom {
            margin-top:    0.6em;
            margin-bottom: 0.6em;
        }
        
        .gnomex-progress-bar { 
            height: 1.5rem;
            background-color: green; 
        }
        
        .horizontal-spacing { width:  2em;   }
        .vertical-spacer    { height: 0.5em; }
        
        .max-width { max-width: 70em; }

        .align-right { text-align: right; }

        .highlight { 
            color: green;
            font-weight: bold;
        }
        
    `]
}) export class ExperimentOverviewTabComponent implements OnInit, OnDestroy {

    @Input('experiment') set experiment(experiment: any) {
        this.isReady_filteredApplicationDictionary = false;

        setTimeout(() => {
            this.dialogService.startDefaultSpinnerDialog();
        });

        this._experiment = experiment;

        if (!experiment) {
            return;
        }

        setTimeout(() => {
            // coreFacilityName
            let tempCoreFacilities: any[] = [];
            if (this.coreFacilitiesDictionary) {
                if (!Array.isArray(this.coreFacilitiesDictionary)) {
                    this.coreFacilitiesDictionary = [this.coreFacilitiesDictionary];
                }

                tempCoreFacilities = this.coreFacilitiesDictionary.filter((a) => {
                    return a.value === experiment.idCoreFacility;
                });
            }
            this.coreFacilityName = tempCoreFacilities.length > 0 ? tempCoreFacilities[0].display : '';

            let tempRequestCategory: any[] = [];
            if (this.requestCategoryDictionary) {
                if (!Array.isArray(this.requestCategoryDictionary)) {
                    this.requestCategoryDictionary = [this.requestCategoryDictionary];
                }

                tempRequestCategory = this.requestCategoryDictionary.filter((a) => {
                    return a.value === experiment.codeRequestCategory;
                });
            }
            this.requestCategoryName = tempRequestCategory.length > 0 ? tempRequestCategory[0].display : '';

            if (experiment.codeApplication && experiment.codeApplication === 'OTHER' && experiment.applicationNotes) {
                this.experimentCategoryName = this.experimentCategoryName + ' - ' + experiment.applicationNotes;
            }

            let tempVisibilities: any[] = [];
            if (this.visibilityDictionary) {
                if (!Array.isArray(this.visibilityDictionary)) {
                    this.visibilityDictionary = [this.visibilityDictionary];
                }

                tempVisibilities = this.visibilityDictionary.filter((a) => {
                    return a.value === experiment.codeVisibility;
                });
            }
            this.visibility   = tempVisibilities.length > 0 ? tempVisibilities[0].display : '';

            let tempInstitutions: any[] = [];
            if (this.institutionDictionary) {
                if (!Array.isArray(this.institutionDictionary)) {
                    this.institutionDictionary = [this.institutionDictionary];
                }

                tempInstitutions = this.institutionDictionary.filter((a) => {
                    return a.value === experiment.idInstitution;
                });
            }
            this.institutionName = tempInstitutions.length > 0 ? tempInstitutions[0].display : '';

            this.isExternal = experiment.isExternal && experiment.isExternal === 'Y';

            this.filterApplicationDictionary();

            if (!this.labSubscription) {
                this.labSubscription = this.getLabService.getLabById(this._experiment.idLab).subscribe((result) => {
                    this.lab = result;

                    this.filterLabDictionary();
                });
            }

            this.workflowSteps = [];
            this.progresses = [];
            this.numberOfSteps = 0;

            this.processedWorkflowSteps = [];

            if (this._experiment.workflowStatus) {
                this.numberOfSteps = this._experiment.workflowStatus.numberOfSteps;

                if (this._experiment.workflowStatus.Step) {
                    if (Array.isArray(this._experiment.workflowStatus.Step)) {
                        this.workflowSteps = this._experiment.workflowStatus.Step;
                    } else {
                        this.workflowSteps = [this._experiment.workflowStatus.Step];
                    }
                }

                if (this._experiment.workflowStatus.Progress) {
                    if (Array.isArray(this._experiment.workflowStatus.Progress)) {
                        this.progresses = this._experiment.workflowStatus.Progress;
                    } else {
                        this.progresses = [this._experiment.workflowStatus.Progress];
                    }

                    for (let progress of this.progresses) {
                        progress.displayArray = [];
                        progress.undisplayArray = [];

                        for (let i: number = 1; i < progress.stepNumber; i++) {
                            progress.displayArray.push(i);
                            progress.displayArray.push(i);
                        }

                        let isCompleted: boolean = true;

                        for (let i: number = this.numberOfSteps; i > progress.stepNumber; i--) {
                            isCompleted = false;
                            progress.undisplayArray.push(i);
                            progress.undisplayArray.push(i);
                        }

                        if (!isCompleted) {
                            progress.displayArray.push(-1);
                            progress.undisplayArray.push(-1);
                        } else {
                            progress.displayArray.push(-1);
                            progress.displayArray.push(-1);
                        }
                    }
                }


                for (let step of this.workflowSteps) {
                    let tempCopy: any = {
                        name: step.name,
                        found: false
                    };

                    for (let progress of this.progresses) {
                        if (progress.stepName === step.name) {
                            tempCopy.found = true;
                            break;
                        }
                    }

                    this.processedWorkflowSteps.push(tempCopy);
                }
            }

            this.updateCollaboratorsDisplay();
        });
    };

    public _experiment: any = {};

    public lab: any;

    public coreFacilityName:       string = '';
    public requestCategoryName:    string = '';
    public experimentCategoryName: string = '';
    public visibility:             string = '';
    public institutionName:        string = '';

    public isExternal: boolean = false;

    public applicationDictionary:      any[];
    public coreFacilitiesDictionary:   any[];
    public institutionDictionary:      any[];
    public labDictionary:              any[];
    public projectsDictionary:         any[];
    public visibilityDictionary:       any[];
    public requestCategoryDictionary:  any[];

    public possibleOwnersForLabDictionary:     any[];
    public possibleSubmittersForLabDictionary: any[];

    public requestCategoryApplicationsDictionary:  any[];

    public filteredApplicationDictionary: any[];
    public filteredLabDictionary:         any[];

    public workflowSteps: any[];
    public progresses   : any[];
    public numberOfSteps: any;

    public processedWorkflowSteps: any[];

    public visibilityOptions: any[];

    public privacyExp: Date;
    public isPrivacyExpSupported: boolean = false;

    public currentCollaboratorsDisplay: string = '';

    private _isReady_applicationDictionary:      boolean = false;
    private _isReady_coreFacilitiesDictionary:   boolean = false;
    private _isReady_institutionDictionary:      boolean = false;
    private _isReady_labDictionary:              boolean = false;
    private _isReady_projectsDictionary:         boolean = false;
    private _isReady_visibilityDictionary:       boolean = false;
    private _isReady_requestCategoryDictionary:  boolean = false;

    private _isReady_possibleOwnersForLabDictionary:     boolean = false;
    private _isReady_possibleSubmittersForLabDictionary: boolean = false;

    private _isReady_requestCategoryApplicationsDictionary:  boolean = false;

    private _isReady_filteredApplicationDictionary: boolean = false;
    private _isReady_filteredLabDictionary:         boolean = false;

    private set isReady_applicationDictionary(value: boolean) {
        this._isReady_applicationDictionary = value;
        this.finishLoadingIfAllDictionariesAreLoaded();
    }
    private set isReady_coreFacilitiesDictionary(value: boolean) {
        this._isReady_coreFacilitiesDictionary = value;
        this.finishLoadingIfAllDictionariesAreLoaded();
    }
    private set isReady_institutionDictionary(value: boolean) {
        this._isReady_institutionDictionary = value;
        this.finishLoadingIfAllDictionariesAreLoaded();
    }
    private set isReady_labDictionary(value: boolean) {
        this._isReady_labDictionary = value;
        this.finishLoadingIfAllDictionariesAreLoaded();
    }
    private set isReady_projectsDictionary(value: boolean) {
        this._isReady_projectsDictionary = value;
        this.finishLoadingIfAllDictionariesAreLoaded();
    }
    private set isReady_visibilityDictionary(value: boolean) {
        this._isReady_visibilityDictionary = value;
        this.finishLoadingIfAllDictionariesAreLoaded();
    }
    private set isReady_requestCategoryDictionary(value: boolean) {
        this._isReady_requestCategoryDictionary = value;
        this.finishLoadingIfAllDictionariesAreLoaded();
    }
    private set isReady_possibleOwnersForLabDictionary(value: boolean) {
        this._isReady_possibleOwnersForLabDictionary = value;
        this.finishLoadingIfAllDictionariesAreLoaded();
    }
    private set isReady_possibleSubmittersForLabDictionary(value: boolean) {
        this._isReady_possibleSubmittersForLabDictionary = value;
        this.finishLoadingIfAllDictionariesAreLoaded();
    }
    private set isReady_requestCategoryApplicationsDictionary(value: boolean) {
        this._isReady_requestCategoryApplicationsDictionary = value;
        this.finishLoadingIfAllDictionariesAreLoaded();
    }
    private set isReady_filteredApplicationDictionary(value: boolean) {
        this._isReady_filteredApplicationDictionary = value;
        this.finishLoadingIfAllDictionariesAreLoaded();
    }
    private set isReady_filteredLabDictionary(value: boolean) {
        this._isReady_filteredLabDictionary = value;
        this.finishLoadingIfAllDictionariesAreLoaded();
    }

    private labSubscription: Subscription;


    public get isAdmin(): boolean {
        return this.secAdvisor.isAdmin;
    }

    constructor(private constantsService: ConstantsService,
                private secAdvisor: CreateSecurityAdvisorService,
                private dialogService: DialogsService,
                private dictionaryService: DictionaryService,
                private getLabService: GetLabService,
                private labListService: LabListService,
                private matDialog: MatDialog,
                private propertyService: PropertyService) { }

    public get selectedExperimentCategory(): string {
        if (!this._experiment || !this._experiment.experimentCategoryName) {
            return '';
        } else {
            return this._experiment.experimentCategoryName;
        }
    }

    public set selectedExperimentCategory(value: string) {
        if (this._experiment) {
            this._experiment.experimentCategoryName = value;
        }
    }

    ngOnInit() {
        setTimeout(() => {
            this.dialogService.startDefaultSpinnerDialog();
        });

        this.applicationDictionary     = this.dictionaryService.getEntries('hci.gnomex.model.Application');
        this.coreFacilitiesDictionary  = this.dictionaryService.getEntries('hci.gnomex.model.CoreFacility');
        this.institutionDictionary     = this.dictionaryService.getEntries('hci.gnomex.model.Institution');
        this.visibilityDictionary      = this.dictionaryService.getEntries('hci.gnomex.model.Visibility');
        this.requestCategoryDictionary = this.dictionaryService.getEntries('hci.gnomex.model.RequestCategory');

        this.requestCategoryApplicationsDictionary = this.dictionaryService.getEntries('hci.gnomex.model.RequestCategoryApplication');

        this.isReady_applicationDictionary                 = true;
        this.isReady_coreFacilitiesDictionary              = true;
        this.isReady_institutionDictionary                 = true;
        this.isReady_visibilityDictionary                  = true;
        this.isReady_requestCategoryDictionary             = true;
        this.isReady_requestCategoryApplicationsDictionary = true;


        // this.labListService.getAllLabsUnbounded().subscribe((labs: any[]) => {
        this.labListService.getLabList().subscribe((labs: any[]) => {
            if (labs) {
                this.labDictionary = labs;
                this.isReady_labDictionary = true;

                this.filterLabDictionary();
            }
        });

        if (this._experiment && this._experiment.idLab && !this.labSubscription) {
            this.labSubscription = this.getLabService.getLabById(this._experiment.idLab).subscribe((result) => {
                this.lab = result;

                if (result.Lab) {
                    this.projectsDictionary = result.Lab.projects;
                    this.isReady_projectsDictionary = true;

                    this.compilePossibleOwners();
                    this.compilePossibleSubmittersForLabDictionary();
                }
            });
        }

        this.filterApplicationDictionary();

        this.visibilityOptions = [
            {
                display: 'Owner',
                value: 'OWNER',
                icon: this.constantsService.ICON_TOPIC_OWNER,
                tooltip:'Visible to the submitter and the lab PI'
            },
            {
                display: 'All Lab Members',
                value: 'MEM',
                icon: this.constantsService.ICON_TOPIC_MEMBER,
                tooltip:'Visible to all members of the lab group'
            }
        ];

        if(this.propertyService.isPublicVisbility()){
            this.visibilityOptions.push({
                display: 'Public Access',
                value: 'PUBLIC',
                icon: this.constantsService.ICON_TOPIC_PUBLIC,
                tooltip: 'Visible to everyone'
            });
        }

        this.isPrivacyExpSupported= this.propertyService.isPrivacyExpirationSupported;

        let dateParsed = this.parsePrivacyDate(this._experiment.privacyExpirationDate);
        if (dateParsed.length > 0 ) {
            this.privacyExp = new Date(dateParsed[0],dateParsed[1],dateParsed[2]);
        } else {
            this.privacyExp = null;
        }
    }

    ngOnDestroy(): void {
        if (this.labSubscription) {
            this.labSubscription.unsubscribe();
        }
    }

    public onClickCollaborators(): void {
        if (this._experiment.codeVisibility === 'PUBLIC') {
            return;
        }

        let prepCollabsList: any[] = [];

        if (this._experiment.codeVisibility === 'MEM' && this.lab && this.lab.Lab) {
            prepCollabsList = Array.isArray(this.lab.Lab.membersCollaborators) ? this.lab.Lab.membersCollaborators : [this.lab.Lab.membersCollaborators.AppUser];
        } else if (this._experiment.codeVisibility === 'OWNER' && this.lab && this.lab.Lab) {
            prepCollabsList = Array.isArray(this.lab.Lab.possibleCollaborators) ? this.lab.Lab.possibleCollaborators : [this.lab.Lab.possibleCollaborators.AppUser];
        }

        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.height = '33em';
        configuration.width  = '44em';
        configuration.panelClass = 'no-padding-dialog';

        configuration.data = {
            currentCollaborators:  this._experiment.collaborators,
            possibleCollaborators:  prepCollabsList,
            idField: 'idRequest',
            idFieldValue: this._experiment.idRequest
        };

        let collaboratorsDialogReference = this.matDialog.open(CollaboratorsDialogComponent, configuration);

        collaboratorsDialogReference.afterClosed().subscribe(result => {
            if (result) {
                this._experiment.collaborators = result;
            }

            this.updateCollaboratorsDisplay();
        });
    }


    public onChange_lab(event: any): void {
        if (event && event.value) {
            let temp: any[] = this.filteredLabDictionary.filter((a) => {
                return a.idLab === event.value;
            });

            this._experiment.labName          = temp && temp.length === 1 ? temp[0].display : '';
            this._experiment.truncatedLabName = '';

             this.getLabService.getLabById(this._experiment.idLab).subscribe((result: any) => {
                 this.lab = result.json();
            });
        }
    }

    public onChange_application(event: any): void {
        if (event && event.value) {
            let temp: any[] = this.filteredApplicationDictionary.filter((a) => {
                return a.codeApplication === event.value;
            });

            this._experiment.application.Application = temp && temp.length === 1 ? temp[0] : null;
        }
    }

    public onChange_project(event: any): void {
        if (event && event.value) {
            let temp: any[] = this.projectsDictionary.filter((a) => {
                return a.idProject === event.value;
            });

            this._experiment.project.Project = temp && temp.length === 1 ? temp[0] : null;
        }
    }

    public onChange_owner(event: any): void {
        if (!this._experiment) {
            return;
        }

        if (event && event.value) {
            let temp: any[] = this.possibleOwnersForLabDictionary.filter((a) => {
                return a.idAppUser === event.value;
            });

            this._experiment.ownerName = temp && temp.length === 1 ? temp[0].firstLastDisplayName : '';
        }
    }

    public onChange_submitter(event: any): void {
        if (!this._experiment) {
            return;
        }

        if (event && event.value) {
            let temp: any[] = this.possibleSubmittersForLabDictionary.filter((a) => {
                return a.idAppUser === event.value;
            });

            this._experiment.submitterName = temp && temp.length === 1 ? temp[0].firstLastDisplayName : '';
        }
    }


    private filterApplicationDictionary(): void {
        if (!this.applicationDictionary) {
            return;
        }

        if (!Array.isArray(this.applicationDictionary)) {
            this.applicationDictionary = [this.applicationDictionary];
        }

        this.isReady_filteredApplicationDictionary = false;

        this.filteredApplicationDictionary = this.applicationDictionary.filter((a) => {
            if (!a.value) {
                return false;
            } else if (a.value === this._experiment.codeApplication) {
                return true;
            } else if (a.isActive === 'N') {
                return false;
            }

            let applicationMatchesRequestCategory: boolean = false;

            let filteredRequestCategoryApplicationsDictionary = this.requestCategoryApplicationsDictionary.filter((entry) => {
                return entry && entry.value && entry.codeApplication === a.value;
            });

            for (let entry of filteredRequestCategoryApplicationsDictionary) {
                if (entry.codeRequestCategory === this._experiment.codeRequestCategory) {
                    applicationMatchesRequestCategory = true;
                    break;
                }
            }

            if (!applicationMatchesRequestCategory) {
                return false;
            }


            let applicationMatchesSeqPrepByCore: boolean = true;

            if (a.onlyForLabPrepped !== 'N' && this._experiment.seqPrepByCore === 'Y') {
                applicationMatchesSeqPrepByCore = false;
            }

            return applicationMatchesSeqPrepByCore;
        });

        this.isReady_filteredApplicationDictionary = true;
    }

    private filterLabDictionary(): void {
        this.isReady_filteredLabDictionary = false;

        this.filteredLabDictionary = this.labDictionary.filter((a) => {
            return a.canGuestSubmit === 'Y' || a.canSubmitRequests === 'Y';
        });

        this.isReady_filteredLabDictionary = true;
    }

    private compilePossibleOwners(): void {
        this.isReady_possibleOwnersForLabDictionary = false;
        this.possibleOwnersForLabDictionary = [];

        if (!this.lab || !this.lab.Lab) {
            return;
        }

        let temp: any[] = this.lab.Lab.members;

        for (let member of temp) {
            this.possibleOwnersForLabDictionary.push(member);
        }

        for (let manager of this.lab.Lab.managers) {
            let managerFoundInAppUsers: boolean = false;

            for (let appUser of this.possibleOwnersForLabDictionary) {
                if (appUser.idAppUser === manager.idAppUser) {
                    managerFoundInAppUsers = true;
                    break;
                }
            }

            if (!managerFoundInAppUsers) {
                this.possibleOwnersForLabDictionary.push(manager);
            }

            let needToAddCurrentOwner:Boolean = true;

            for (let appUser of this.possibleOwnersForLabDictionary) {
                if (appUser.idAppUser == this._experiment.idAppUser) {
                    needToAddCurrentOwner = false;
                    break;
                }
            }
            if (needToAddCurrentOwner) {
                let currentRequestOwner: any = this.dictionaryService.getEntry('hci.gnomex.model.AppUserLite', this._experiment.idAppUser);
                let newNode: any = {
                    idAppUser: currentRequestOwner.idAppUser,
                    displayName: currentRequestOwner.display
                };
                this.possibleOwnersForLabDictionary.push(newNode);
            }
        }

        this.isReady_possibleOwnersForLabDictionary = true;
    }

    private compilePossibleSubmittersForLabDictionary(): void {
        this.isReady_possibleSubmittersForLabDictionary = false;
        this.possibleSubmittersForLabDictionary = [];

        if (!this.lab || !this.lab.Lab) {
            return;
        }

        let temp: any[] = this.lab.Lab.members;
        for (let member of temp) {
            this.possibleSubmittersForLabDictionary.push(member);
        }

        for (let manager of this.lab.Lab.managers) {
            let managerFoundInAppUsers: boolean = false;

            for (let appUser of this.possibleSubmittersForLabDictionary) {
                if (appUser.idAppUser === manager.idAppUser) {
                    managerFoundInAppUsers = true;
                    break;
                }
            }

            if (!managerFoundInAppUsers) {
                this.possibleSubmittersForLabDictionary.push(manager);
            }
        }

        for (let submitter of this._experiment.submitterFromOtherCores) {
            let submitterFoundInAppUsers: boolean = false;

            for (let appUser of this.possibleSubmittersForLabDictionary) {
                if (appUser.idAppUser === submitter.idAppUser) {
                    submitterFoundInAppUsers = true;
                    break;
                }
            }

            if (!submitterFoundInAppUsers) {
                this.possibleSubmittersForLabDictionary.push(submitter);
            }
        }

        let needToAddCurrentSubmitter:Boolean = true;

        for (let appUser of this.possibleSubmittersForLabDictionary) {
            if (appUser.idAppUser == this._experiment.idAppUser) {
                needToAddCurrentSubmitter = false;
                break;
            }
        }
        if (needToAddCurrentSubmitter) {
            let currentRequestOwner: any = this.dictionaryService.getEntry('hci.gnomex.model.AppUserLite', this._experiment.idAppUser);
            let newNode: any = {
                idAppUser: currentRequestOwner.idAppUser,
                displayName: currentRequestOwner.display
            };
            this.possibleSubmittersForLabDictionary.push(newNode);
        }

        this.isReady_possibleSubmittersForLabDictionary = true;
    }

    private finishLoadingIfAllDictionariesAreLoaded(): void {
        if (this._isReady_applicationDictionary
            && this._isReady_coreFacilitiesDictionary
            && this._isReady_institutionDictionary
            && this._isReady_labDictionary
            && this._isReady_projectsDictionary
            && this._isReady_visibilityDictionary
            && this._isReady_requestCategoryDictionary
            && this._isReady_possibleOwnersForLabDictionary
            && this._isReady_possibleSubmittersForLabDictionary
            && this._isReady_requestCategoryApplicationsDictionary
            && this._isReady_filteredApplicationDictionary
            && this._isReady_filteredLabDictionary) {

            setTimeout(() => {
                this.dialogService.stopAllSpinnerDialogs();
            });
        }
    }

    private updateCollaboratorsDisplay() {
        this.currentCollaboratorsDisplay = '';

        if (this._experiment) {
            for (let collaborator of this._experiment.collaborators) {
                if (this.currentCollaboratorsDisplay) {
                    this.currentCollaboratorsDisplay = this.currentCollaboratorsDisplay + '\n';
                }

                if (!collaborator.displayName) {
                    let currentRequestOwner: any = this.dictionaryService.getEntry('hci.gnomex.model.AppUserLite', collaborator.idAppUser);

                    collaborator.displayName = currentRequestOwner.display;
                }

                this.currentCollaboratorsDisplay = this.currentCollaboratorsDisplay + collaborator.displayName;
            }
        }
    }

    public onUpdateVisibility(event: any) {
        if (event) {
            this._experiment.codeVisibility = event.value;
        }
    }

    private parsePrivacyDate(date: string): number[] {
        let parseDateList:string[] = date.split("-");
        if(parseDateList.length > 1){
            let year:number = +parseDateList[0];
            let month:number = (+parseDateList[1]) - 1;
            let day:number = +parseDateList[2];
            return [year,month,day]

        } else {
            return [];
        }
    }
}