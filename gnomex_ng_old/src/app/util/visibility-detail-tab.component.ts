import {Component,Input, OnDestroy, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

import {CreateSecurityAdvisorService} from "../services/create-security-advisor.service";
import {GetLabService} from "../services/get-lab.service";
import {URLSearchParams} from "@angular/http";
import {GnomexService} from "../services/gnomex.service";
import {ConstantsService} from "../services/constants.service";
import {PropertyService} from "../services/property.service";
import {ActivatedRoute} from "@angular/router";
import {GridApi} from "ag-grid-community";
import {CheckboxRenderer} from "./grid-renderers/checkbox.renderer";
import {first} from "rxjs/operators";
import {UserPreferencesService} from "../services/user-preferences.service";
import {HttpParams} from "@angular/common/http";

@Component({
    selector: 'visibility-detail-tab',
    template: `
        <form [formGroup]="visibilityForm" style="display:flex;flex-direction: column; height:100%;">
            <div style="display: flex; flex-direction: column">
                <label class="gx-label">
                    Select the level of visibility:
                </label>
                <mat-radio-group class="flexbox-column"  formControlName="codeVisibility" (change)="updateCollaborators()" >
                    <mat-radio-button style="margin: 0.5em"  *ngFor="let rad of visRadio" [value]="rad.value" [matTooltip]="rad.tooltip">
                        <img [src]="rad.icon">{{rad.display}}
                    </mat-radio-button>
                </mat-radio-group>
            </div>
            <mat-form-field class="short-input" *ngIf="isPrivacyExpSupported"
                            matTooltip="Public visibility date&#13;(visibility automatically changes to public on this date)">
                <input matInput [matDatepicker]="privacyPicker" placeholder="Privacy Expiration" formControlName="privacyExp" [min]="this.today">
                <mat-datepicker-toggle matSuffix [for]="privacyPicker"></mat-datepicker-toggle>
                <mat-datepicker #privacyPicker disabled="false"></mat-datepicker>
            </mat-form-field>
            <div style="margin-top: 1em; display: flex; flex-direction: column;" *ngIf="showCollaboratorBlock" >
                <label class="gx-label"> Individual collaborators allowed access to this data track  </label>
                <div >
                    <div style="width:30%">
                        <custom-combo-box placeholder="Collaborators" (optionSelected)="collaborDropdownChange($event)"
                                          [options]="collabDropdown" [displayField]="this.prefService.userDisplayField"
                                          [formControlName]="'selectedCollaborator'">
                        </custom-combo-box>
                    </div>
                    <button mat-button [disabled]="!enableAdd || _disabled" type="button" (click)="addCollaborator()">
                        <img [src]="this.constService.ICON_ADD"> add
                    </button>
                    <button mat-button [disabled]="selectedCollabRow.length < 1 || _disabled" type="button" (click)="removeCollaborator()">
                        <img [src]="this.constService.ICON_DELETE"> remove
                    </button>
                </div>
            </div>
            <div style="flex:3" *ngIf="showCollaboratorBlock" >
                <ag-grid-angular style="width: 50%; height:100% "
                                 class="ag-theme-fresh"
                                 [rowDeselection]="true"
                                 (gridReady)="this.onCollabGridReady($event)"
                                 (gridSizeChanged)="onGridSizeChanged()"
                                 [rowSelection]="'single'"
                                 (rowSelected)="this.onCollabGridRowSelected($event)"
                                 [rowData]="this.collabGridRowData"
                                 [columnDefs]="this.columnDefs">
                </ag-grid-angular>
            </div>
        </form>
    `,
    styles: [`

        .flex-column-container{
            display:flex;
            flex-direction: column;

        }
        .annot-control{
            width:30%;
            margin:0.25em;
            font-size:small;
        }
        .annot-border{
            border-top: 1px solid #e8e8e8;
            border-bottom: 1px solid #e8e8e8;
        }
        .annot-label{
            align-self: center;
            font-weight: bold;
            margin:1em;
        }


    `]
})
export class VisibilityDetailTabComponent implements OnInit, OnDestroy{

    // This getter is needed by the New Experiments process.
    public get form(): FormGroup {
        return this.visibilityForm;
    }

    //Override
    public edit = false;
    public visibilityForm: FormGroup;
    private visRadio:Array<any> = [];
    public currentOrder:any;
    private currentLab:any;


    public collabDropdown:Array<any> = [];
    private memCollaborators:Array<any> = [];
    private possibleCollaborators:Array<any> = [];
    private allCollabs:Array<any> = [];
    private selectedCollabGridIndex:number = -1;
    public  selectedCollabRow:any[] = [];

    public enableAdd:boolean = false;
    public showCollaboratorBlock = true;
    public isPrivacyExpSupported:boolean = false;

    public today:Date = new Date();



    //private enableRemove:boolean = false;

    private gridApi:GridApi;
    public collabGridRowData:any[] = [];
    public columnDefs = [
        {
            headerName: "Collaborator",
            field: this.prefService.userDisplayField,
            width: 200,
            editable:false
        },
        {
            headerName: "Upload",
            field: "canUploadData",
            width: 100,
            editable:false,
            cellRendererFramework: CheckboxRenderer,
            checkboxEditable: true
        },
        {
            headerName: "Update",
            field: "canUpdate",
            width: 100,
            editable:false,
            cellRendererFramework: CheckboxRenderer,
            checkboxEditable: true
        }

    ];

    public _disabled: boolean = false;

    @Input()
    set disabled(value: boolean) {
        this._disabled = value;
        if (this.visibilityForm) {
            if (this._disabled) {
                this.visibilityForm.disable();
            } else {
                this.visibilityForm.enable();
            }
        }
    }

    sortFn = (obj1,obj2 ) =>{
        if (obj1[this.prefService.userDisplayField] < obj2[this.prefService.userDisplayField])
            return -1;
        if (obj1[this.prefService.userDisplayField] > obj2[this.prefService.userDisplayField])
            return 1;
        return 0;
    };


    constructor(protected fb: FormBuilder,
                private route: ActivatedRoute,
                private secAdvisor: CreateSecurityAdvisorService,
                private propertyService: PropertyService,
                public constService: ConstantsService,
                private gnomexService:GnomexService,
                private getLabService : GetLabService,
                public prefService: UserPreferencesService) {
    }


    ngOnInit():void{ // Note this hook runs once if route changes to another folder you don't recreate component
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
            collaborators: [],
            selectedCollaborator: ''
        });

        this.route.data.forEach(data => { // new datatrack
            this.currentOrder = this.getOrder(data);

            this.enableAdd = false;
            //this.enableRemove = false;

            if(!this.currentOrder){
                return;
            }

            let dateParsed = this.parsePrivacyDate(this.currentOrder.privacyExpirationDate);
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

            this.visibilityForm.get("codeVisibility").setValue(this.currentOrder.codeVisibility);



            let idLab = this.currentOrder.idLab;
            if(idLab !== null  && idLab !== undefined) { //empty string is valid
                let labParams: HttpParams = new HttpParams()
                    .set('idLab', idLab)
                    .set('includeBillingAccounts', 'N')
                    .set('includeProductCounts','N');

                this.getLabService.getLab(labParams).pipe(first()).subscribe( data =>{
                    this.currentLab = data.Lab ? data.Lab : data;
                    this.memCollaborators = this.formatCollabList(this.currentLab.membersCollaborators);
                    this.possibleCollaborators  = this.formatCollabList(this.currentLab.possibleCollaborators);
                    // master list
                    this.allCollabs =  this.gnomexService.appUserList;  //this.possibleCollaborators.concat(this.memCollaborators);

                    this.memCollaborators = this.removeInvalidDropdownCollabs(this.memCollaborators, currentCollaborators);
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
                    this.collabGridRowData = this.addNameToCollabs(currentCollaborators);
                    this.visibilityForm.get("collaborators").setValue(this.collabGridRowData);

                    if(this.currentLab){
                        this.updateCollaborators();
                    }
                });
            }

            this.visibilityForm.markAsPristine();
            if (this._disabled) {
                this.visibilityForm.disable();
            } else {
                this.visibilityForm.enable();
            }
        });
    }


    formatCollabList(collabs:any): any[] {
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
            if(!refCollab){
                console.log("Testing: Could not find collaborator, may need to call getAppUser controller as source");
                break;
            }

            collab[this.prefService.userDisplayField] = refCollab[this.prefService.userDisplayField];
        }

        return currentCollabs;
    }


    displayLab(lab: any) {
        return lab ? lab.name : lab;
    }

    parsePrivacyDate(date: string): number[] {
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

    formatPrivacyDate(date: Date): string {
        let month = date.getMonth() + 1;
        let strMonth = month < 10 ? "0" + month : ""+ month;

        let day = date.getDate();
        let strDay = day < 10 ? "0"+day : ""+day;
        let year = date.getFullYear();
        if(year === 1969){ // default date if date is null
            return '';
        }

        return year + "-"+ strMonth + "-" +strDay;
    }


    updateCollaborators(){
        let visCode =  this.visibilityForm.get('codeVisibility').value;
        //let toSelectCollaborators:Array<any> = this.visibilityForm.get('collaborators').value;
        let prepCollabsList:Array<any> = [];

        if(visCode === 'MEM'){
            prepCollabsList = this.memCollaborators;
            this.showCollaboratorBlock = true;

        }else if(visCode === 'OWNER'){
            prepCollabsList = this.possibleCollaborators;
            this.showCollaboratorBlock = true;
        }else if(visCode === 'PUBLIC'){
            this.showCollaboratorBlock = false;

            this.visibilityForm.get("privacyExp").setValue(new Date());
        }


        this.collabDropdown = prepCollabsList;


    }

    collaborDropdownChange(event:any) {
        if (event) {
            this.enableAdd = true;
        } else {
            this.enableAdd = false;
        }
    }


    getOrder(data:any): any {
        if (data) {
            if (data.analysis && data.analysis.Analysis) {
                data.analysis.Analysis.collabType = 'AnalysisCollaborator';
                return data.analysis.Analysis;
            } else if (data.experiment && data.experiment.Request) {
                data.experiment.Request.collabType = 'ExperimentCollaborator';
                return data.experiment.Request;
            }
        }
    }

    compareByID(itemOne, itemTwo) {
        return itemOne && itemTwo && itemOne.idAppUser == itemTwo.idAppUser;
    }

    addCollaborator() {
        this.visibilityForm.markAsDirty();
        let collabVal = this.visibilityForm.get("selectedCollaborator").value;
        if(collabVal){
            let collabGridItem = {
                    idAppUser: collabVal.idAppUser,
                    canUploadData: 'N',
                    canUpdate: 'N'
                }
            ;
            collabGridItem[this.prefService.userDisplayField] = collabVal[this.prefService.userDisplayField];
            // add to grid
            this.collabGridRowData.push(collabGridItem);
            this.gridApi.setRowData(this.collabGridRowData);
            this.visibilityForm.get("collaborators").setValue(this.collabGridRowData);

            // remove out of dropdown
            let i:number = this.memCollaborators.findIndex(c =>  c.idAppUser === collabVal.idAppUser );
            if(i > -1){
                this.memCollaborators.splice(i,1);
                if(this.visibilityForm.get("codeVisibility").value === "MEM"){
                    this.collabDropdown = this.memCollaborators.slice();
                }
            }

            let j:number = this.possibleCollaborators.findIndex(c =>  c.idAppUser === collabVal.idAppUser );
            if(j > -1){
                this.possibleCollaborators.splice(j,1);
                if(this.visibilityForm.get("codeVisibility").value === "OWNER"){
                    this.collabDropdown = this.possibleCollaborators.slice();

                }

            }

            this.enableAdd = false;
        }
    }

    removeInvalidDropdownCollabs(dropdownCollabs:any[], currentCollabs:any[]): any[] {
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
    // when user selects
    removeCollaborator(){
        let removedCollab = this.collabGridRowData.splice(this.selectedCollabGridIndex,1);
        this.gridApi.setRowData(this.collabGridRowData);
        this.visibilityForm.get("collaborators").setValue(this.collabGridRowData);

        let formatMemCollab = this.formatCollabList(this.currentLab.membersCollaborators);
        let mem = formatMemCollab.find(collab => collab.idAppUser === removedCollab[0].idAppUser);
        if(mem) {
            this.memCollaborators.push(mem);
            if (this.visibilityForm.get("codeVisibility").value === "MEM") {
                this.collabDropdown = this.memCollaborators.slice();
            }
        }

        let formatPossibleCollabs = this.formatCollabList(this.currentLab.possibleCollaborators);
        let possilbe =  formatPossibleCollabs.find(collab => collab.idAppUser === removedCollab[0].idAppUser);
        if(possilbe){
            this.possibleCollaborators.push(possilbe);
            if(this.visibilityForm.get("codeVisibility").value === "OWNER"){
                this.collabDropdown = this.possibleCollaborators.slice();
            }

        }

        this.selectedCollabRow = this.gridApi.getSelectedRows();
    }

    getValue(){
        let test = new Date(this.visibilityForm.get("privacyExp").value);

        console.log(this.formatPrivacyDate(test));
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


    ngOnDestroy(){
        this.getLabService.labMembersSubject.next(null);

    }
}
