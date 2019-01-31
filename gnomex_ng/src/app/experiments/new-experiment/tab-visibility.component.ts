import {Component,Input, OnDestroy} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {GetLabService} from "../../services/get-lab.service";
import {URLSearchParams} from "@angular/http";
import {GnomexService} from "../../services/gnomex.service";
import {ConstantsService} from "../../services/constants.service";
import {PropertyService} from "../../services/property.service";
import {GridApi} from "ag-grid-community";
import {CheckboxRenderer} from "../../util/grid-renderers/checkbox.renderer";
import {first} from "rxjs/operators";
import {Subscription} from "rxjs/index";

import {Experiment} from "../../util/models/experiment.model";

@Component({
    selector: 'tab-visibility',
    templateUrl: './tab-visibility.component.html',
    styles: [`


        .extreme-left-padded { padding-left: 3em; }
        
        
    `]
})
export class TabVisibilityComponent implements OnDestroy{

    private _experiment: Experiment;

    public get experiment(): Experiment {
        return this._experiment;
    }
    @Input("experiment") public set experiment(value: Experiment) {
        this._experiment = value;
        this.currentOrder = value;

        // this.enableAdd = false;
        //this.enableRemove = false;

        if(!this.currentOrder){
            return;
        }

        let dateParsed = TabVisibilityComponent.parsePrivacyDate(this.currentOrder.privacyExpirationDate);
        if (dateParsed.length > 0) {
            this.visibilityForm.get("privacyExp").setValue(new Date(dateParsed[0],dateParsed[1],dateParsed[2]));
        } else {
            this.visibilityForm.get("privacyExp").setValue(null);
        }

        let currentCollaborators = this.currentOrder.collaborators;
        if (currentCollaborators) {
            currentCollaborators = Array.isArray(currentCollaborators) ? currentCollaborators : [currentCollaborators[this.currentOrder.collabType]];
        } else {
            currentCollaborators = [];
        }

        if (this.currentOrder.codeVisibility) {
            this.visibilityForm.get("codeVisibility").setValue(this.currentOrder.codeVisibility);
        } else {
            this.visibilityForm.get("codeVisibility").setValue('MEM');
        }


        let labParams: URLSearchParams = new URLSearchParams();

        if (!this.idLabSubscription) {
            this.idLabSubscription = this._experiment.onChange_idLab.subscribe((value: string) => {
                let idLab = this.currentOrder.idLab;

                if(idLab !== null  && idLab !== undefined) { //empty string is valid
                    labParams.set('idLab', idLab);
                    labParams.set('includeBillingAccounts', 'N');
                    labParams.set('includeProductCounts','N');
                    this.getLabService.getLab(labParams).pipe(first()).subscribe( data =>{
                        this.currentLab = data.Lab ? data.Lab : data;

                        this.memCollaborators       = this.formatCollabList(this.currentLab.membersCollaborators);
                        this.possibleCollaborators  = this.formatCollabList(this.currentLab.possibleCollaborators);
                        // master list
                        this.allCollabs =  this.gnomexService.appUserList;  //this.possibleCollaborators.concat(this.memCollaborators);

                        this.memCollaborators      = this.removeInvalidDropdownCollabs(this.memCollaborators, currentCollaborators);
                        this.possibleCollaborators = this.removeInvalidDropdownCollabs(this.possibleCollaborators,currentCollaborators);

                        //remove from grid inactive collabs and the owner if in grid
                        for(let dropdownCollab of this.allCollabs){
                            let i:number = currentCollaborators.findIndex(c => c.idAppUser === dropdownCollab.idAppUser);
                            if(i > -1 && dropdownCollab.isActive === 'N'){
                                currentCollaborators.splice(i,1);
                            }
                            else if(i > -1 && this.currentOrder.idAppUser === dropdownCollab.idAppUser ){
                                currentCollaborators.splice(i,1);
                            }
                        }

                        this.collabGridRowData         = this.addNameToCollabs(currentCollaborators);
                        this._experiment.collaborators = this.collabGridRowData;

                        if (this.currentLab) {
                            this.updateCollaborators();
                        }
                    });
                }

                this.visibilityForm.markAsPristine();
            });
        }
    }



    //Override
    public edit = false;
    public visibilityForm: FormGroup;
    public visRadio:Array<any> = [];
    public currentOrder:any;
    private currentLab:any;


    public collabDropdown:Array<any> = [];
    private memCollaborators:Array<any> = [];
    private possibleCollaborators:Array<any> = [];
    private allCollabs:Array<any> = [];
    private selectedCollabGridIndex:number = -1;
    public  selectedCollabRow:any[] = [];

    // public enableAdd:boolean = false;
    public showCollaboratorBlock = true;
    public isPrivacyExpSupported:boolean = false;

    public today:Date = new Date();

    //private enableRemove:boolean = false;

    private gridApi:GridApi;
    public collabGridRowData:any[] = [];
    public columnDefs = [
        {
            headerName: "Collaborator",
            field: "displayName",
            width: 200,
            editable:false
        },
        {
            headerName: "View",
            field: "canView_frontEndOnly",
            width: 100,
            editable:false,
            cellRendererFramework: CheckboxRenderer,
            checkboxEditable: true
        },
        {
            headerName: "Upload",
            field: "canUploadData",
            width: 100,
            editable:false,
            cellRendererFramework: CheckboxRenderer,
            checkboxEditable: TabVisibilityComponent.isAbleToView
        },
        {
            headerName: "Update",
            field: "canUpdate",
            width: 100,
            editable:false,
            cellRendererFramework: CheckboxRenderer,
            checkboxEditable: TabVisibilityComponent.isAbleToView
        }
    ];

    // This getter is needed by the New Experiments process.
    public get form(): FormGroup {
        return this.visibilityForm;
    }

    private get initialRowData_memCollaborators(): any[] {
        let temp: any[] = [];

        for (let item of this.memCollaborators) {
            temp.push({
                idAppUser: item.idAppUser,
                displayName: item.displayName,
                canUploadData: 'N',
                canUpdate: 'N',
                canView_frontEndOnly: 'N'
            });
        }

        return temp;
    }

    private get initialRowData_possibleCollaborators(): any[] {
        let temp: any[] = [];

        for (let item of this.possibleCollaborators) {
            temp.push({
                idAppUser: item.idAppUser,
                displayName: item.displayName,
                canUploadData: 'N',
                canUpdate: 'N',
                canView_frontEndOnly: 'N'
            });
        }

        return temp;
    }

    public static isAbleToView(params: any): boolean {
        return params
            && params.node
            && params.node.data
            && params.node.data.canView_frontEndOnly
            && params.node.data.canView_frontEndOnly === 'Y';
    }

    public redrawGridRowIfNeeded(event?: any): void {
        if (event
            && event.node
            && event.column
            && event.column.userProvidedColDef
            && event.column.userProvidedColDef.field
            && event.column.userProvidedColDef.field === "canView_frontEndOnly") {

            if (event.newValue && event.newValue === 'N') {
                let data = event.node.data;

                if (data) {
                    data.canUploadData = 'N';
                    data.canUpdate     = 'N';

                    event.node.setData(data);
                }
            }

            this.gridApi.redrawRows({ rowNodes: [event.node] });

            this._experiment.collaborators = this.collabGridRowData.filter((value:any) => {
                return value && value.canView_frontEndOnly && value.canView_frontEndOnly === 'Y';
            });
        } else {
            // Do nothing
        }
    }


    private idLabSubscription: Subscription;


    constructor(protected fb: FormBuilder,
                private secAdvisor: CreateSecurityAdvisorService,
                private propertyService: PropertyService,
                public constService: ConstantsService,
                private gnomexService:GnomexService,
                private getLabService : GetLabService) {

        this.visRadio = [
            {display:'Owner',value:'OWNER', icon: this.constService.ICON_TOPIC_OWNER, tooltip:'Visible to the submitter and the lab PI'},
            {display:'All Lab Members', value:'MEM', icon: this.constService.ICON_TOPIC_MEMBER, tooltip:'Visible to all members of the lab group'}
        ];
        if(this.propertyService.isPublicVisbility()){
            this.visRadio.push( {display:'Public Access', value:'PUBLIC', icon: this.constService.ICON_TOPIC_PUBLIC, tooltip:'Visible to everyone'})
        }
        this.isPrivacyExpSupported= this.propertyService.isPrivacyExpirationSupported;

        this.edit = !this.secAdvisor.isGuest;

        this.visibilityForm = this.fb.group({
            codeVisibility:['',Validators.required],
            privacyExp: null,
            collaborator: ''
        });
    }

    ngOnDestroy(){
        this.getLabService.labMembersSubject.next(null);

        if (this.idLabSubscription) {
            this.idLabSubscription.unsubscribe();
        }
    }


    private formatCollabList(collabs:any): any[] {
        if (collabs) {
            return (Array.isArray(collabs) ? collabs.slice() : [collabs.AppUser]);
        } else {
            return [];
        }
    }

    addNameToCollabs(currentCollabs:any[]) {

        for(let i= 0; i <  currentCollabs.length; i++ ){
            let collab = currentCollabs[i];
            let refCollab = this.allCollabs.find(ref => collab.idAppUser === ref.idAppUser);
            if (!refCollab) {
                console.log("Testing: Could not find collaborator, may need to call getAppUser controller as source");
                break;
            }

            collab.displayName = refCollab.displayName;
        }

        return currentCollabs;
    }


    public displayLab(lab: any): string {
        return lab ? lab.name : lab;
    }

    private static parsePrivacyDate(date: string): number[] {
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

    public updateCollaborators(): void {
        let visCode =  this.visibilityForm.get('codeVisibility').value;

        if (this._experiment) {
            this._experiment.codeVisibility = this.visibilityForm.get('codeVisibility').value;
        }

        this.collabGridRowData = [];

        let prepCollabsList:Array<any> = [];

        if (visCode === 'MEM') {
            prepCollabsList = this.memCollaborators;
            this.showCollaboratorBlock = true;
            this.collabGridRowData = this.initialRowData_memCollaborators;
        } else if (visCode === 'OWNER') {
            prepCollabsList = this.possibleCollaborators;
            this.showCollaboratorBlock = true;
            this.collabGridRowData = this.initialRowData_possibleCollaborators;
        } else if (visCode === 'PUBLIC') {
            this.showCollaboratorBlock = false;

            this.visibilityForm.get("privacyExp").setValue(new Date());
        }

        this._experiment.collaborators = this.collabGridRowData;

        this.collabDropdown = prepCollabsList;
    }

    public compareByID(itemOne, itemTwo): boolean {
        return itemOne && itemTwo && itemOne.idAppUser === itemTwo.idAppUser;
    }

    private removeInvalidDropdownCollabs(dropdownCollabs:any[], currentCollabs:any[]): any[] {
        let validCollabsInDropdown :any[] = [];

        // remove out collabs that are in grid from out of the dropdown. Also remove the owner from the dropdown
        for(let dropdown of dropdownCollabs) {
            if (dropdown.idAppUser === this.currentOrder.idAppUser
                || currentCollabs.find(collab => collab.idAppUser === dropdown.idAppUser )) {

                continue;
            }

            validCollabsInDropdown.push(dropdown);
        }

        // remove active users out of dropdown
        validCollabsInDropdown = validCollabsInDropdown.filter(own =>  own.isActive === 'Y');

        return validCollabsInDropdown;
    }


    // grid  methods
    onGridSizeChanged(){
        if(this.gridApi){
            this.gridApi.sizeColumnsToFit();
        }
    }

    onCollabGridReady(params:any){
        this.gridApi = params.api;
        this.gridApi.sizeColumnsToFit();
    }

    onCollabGridRowSelected(event:any){
        if(event.node.selected){
            this.selectedCollabGridIndex = event.rowIndex;
        }
        this.selectedCollabRow = this.gridApi.getSelectedRows();
    }
}