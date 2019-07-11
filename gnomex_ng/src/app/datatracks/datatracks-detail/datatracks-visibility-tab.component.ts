import {Component, OnDestroy, OnInit} from "@angular/core";
import {FormGroup,FormBuilder,Validators } from "@angular/forms"
import {DataTrackService} from "../../services/data-track.service";
import {ActivatedRoute} from "@angular/router";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {PropertyService} from "../../services/property.service";
import {ConstantsService} from "../../services/constants.service";
import {GnomexService} from "../../services/gnomex.service";
import {GetLabService} from "../../services/get-lab.service";
import {first} from "rxjs/operators";
import {UserPreferencesService} from "../../services/user-preferences.service";
import {HttpParams} from "@angular/common/http";
import {UtilService} from "../../services/util.service";

@Component({
    selector:'dt-visibility-tab',
    templateUrl:'./datatracks-visibility-tab.component.html',
    styles: [`
        .flexbox-column{

            display:flex;
            flex-direction:column;
            height:100%;
            width:100%;

        }

    `]
})
export class DatatracksVisibilityTabComponent implements OnInit, OnDestroy{
    //Override
    public edit = false;
    public visibilityForm: FormGroup;
    private visRadio:Array<any> = [];
    private labList:Array<any> = [];
    private currentIdLab:string;
    private currentDatatrack:any;
    private possibleCollaborators:Array<any> = [];
    public selectMode:string = "Select All";
    public isSelectable: boolean = true;
    private lab: any;


    constructor(protected fb: FormBuilder,private dtService: DataTrackService,
                private route: ActivatedRoute,private secAdvisor: CreateSecurityAdvisorService,
                private propertyService: PropertyService, private constService: ConstantsService,
                private gnomexService:GnomexService, private getLabService : GetLabService,
                public prefService: UserPreferencesService){
    }

    ngOnInit():void{ // Note this hook runs once if route changes to another folder you don't recreate component
        this.visRadio = [
            {display:'Owner    (the owner and the group manager)',value:'OWNER', icon: this.constService.ICON_TOPIC_OWNER},
            {display:'All Lab Members', value:'MEM', icon: this.constService.ICON_TOPIC_MEMBER}
        ];
        if(this.propertyService.isPublicVisbility()){
            this.visRadio.push( {display:'Public Access', value:'PUBLIC', icon: this.constService.ICON_TOPIC_PUBLIC})
        }

        this.edit = !this.secAdvisor.isGuest;
        this.visibilityForm = this.fb.group({
            codeVisibility:['',Validators.required],
            idAppUser: ['',Validators.required],
            lab: ['',Validators.required],
            collaborators: [[]]
        });

        this.labList = this.gnomexService.labList
            .filter( lab => lab.canGuestSubmit === 'Y' || lab.canSubmitRequests == 'Y' ) ;


        this.route.data.forEach(data => { // new datatrack
            this.currentDatatrack = data.datatrack;
            if(!this.currentDatatrack){
                return;
            }
            let currentCollaborators = this.currentDatatrack.Collaborators;
            if(currentCollaborators){
                currentCollaborators =Array.isArray(currentCollaborators) ? currentCollaborators : [currentCollaborators];
                currentCollaborators = currentCollaborators.map(c =>{return c.AppUser ? c.AppUser : c }) // making adjustment for inconsistent backend
            }else{
                currentCollaborators = []
            }

            this.visibilityForm.get("codeVisibility").setValue(this.currentDatatrack.codeVisibility);
            this.visibilityForm.get("idAppUser").setValue(this.currentDatatrack.idAppUser);
            this.visibilityForm.get("lab").setValue(this.currentDatatrack.idLab);
            this.visibilityForm.get("collaborators").setValue(currentCollaborators);

            let labParams: HttpParams = new HttpParams();

            if(this.currentDatatrack.idLab) {
                labParams = labParams.set('idLab', this.currentDatatrack.idLab);
                labParams = labParams.set('includeBillingAccounts', 'N');
                labParams = labParams.set('includeProductCounts','N');
                this.getLabService.getLab(labParams).pipe(first()).subscribe( data =>{
                    if(data.Lab){
                        this.makeOwnerList(data.Lab);
                        this.lab = data.Lab;
                        this.updateCollaborators();

                    }
                });
            }else{
                this.updateCollaborators();
            }


        });



    }

    private makeOwnerList(lab:any) :void {

        let members:Array<any> = Array.isArray(lab.members) ? lab.members : [lab.members];
        let managers:Array<any> = Array.isArray(lab.managers) ? lab.managers : [lab.managers];
        managers = managers.map(mgr => { return mgr.AppUser? mgr.AppUser : mgr }); // dealing with inconstencies of the backend

        let activeMembers:Array<any> = members.filter(appUser => appUser.isActive === 'Y');
        let activeManagers:Array<any> = managers.filter( mgr => mgr.isActive === 'Y');

        let uniqueManagers:Array<any> = activeManagers.filter(mgr =>  !activeMembers.find( mem => mgr.idAppUser === mem.idAppUser));

        let allMembers : Array<any> =  activeMembers.concat(uniqueManagers);
        let sortedActiveMembers = allMembers.sort( this.getLabService.sortLabMembersFn );
        this.getLabService.labMembersSubject.next(sortedActiveMembers);

    }

    selectOption($event){
        let value = $event;

        if(!value){
            return;
        }
        if(this.currentIdLab != value){
            this.currentIdLab = value;
            let params: HttpParams = new HttpParams()
                .set("idLab", value)
                .set("includeBillingAccounts", "N")
                .set("includeProductCounts", "N");

            this.getLabService.getLab(params).pipe(first()).subscribe( data =>{
                if(data.Lab){
                    this.visibilityForm.get("idAppUser").setValue(""); // setting empty string because new lab won't match owner
                    this.visibilityForm.get("lab").setValue(data.Lab.idLab);
                    this.lab = data.Lab;
                    this.makeOwnerList(data.Lab);
                    this.updateCollaborators();

                    this.visibilityForm.markAsPristine();

                }
            });
        }

    }

    updateCollaborators(){
        let visCode =  this.visibilityForm.get('codeVisibility').value;
        let toSelectCollaborators:Array<any> = this.visibilityForm.get('collaborators').value;
        let lab = this.lab;
        let prepCollabsList:Array<any> = [];

        if(!lab){
            this.possibleCollaborators = [];
            this.visibilityForm.get('collaborators').disable();
            this.isSelectable = false;
            return;
        }


        if(visCode === 'MEM'){
            let memCollabs: any[] = [];
            if (lab.membersCollaborators) {
                memCollabs = UtilService.getJsonArray(lab.membersCollaborators, lab.membersCollaborators.AppUser);
            }
            lab.membersCollaborators = memCollabs;
            prepCollabsList = memCollabs.filter(mem => mem.isActive === 'Y');
            this.visibilityForm.get('collaborators').enable();
            this.isSelectable = true;

        }else if(visCode === 'OWNER'){
            let ownCollabs = Array.isArray(lab.possibleCollaborators) ? lab.possibleCollaborators : [lab.possibleCollaborators];
            lab.possibleCollaborators = ownCollabs;
            prepCollabsList = ownCollabs.filter(own => own.isActive === 'Y');
            this.visibilityForm.get('collaborators').enable();
            this.isSelectable = true;

        }else if(visCode === 'PUBLIC'){
            this.visibilityForm.get('collaborators').disable();
            this.isSelectable = false;
        }
        // removing the selected owner if one of the collaborators
        prepCollabsList = prepCollabsList
            .filter(col => !(col.idAppUser === this.visibilityForm.get('idAppUser').value));
        this.possibleCollaborators = prepCollabsList;

        this.setCollaboratorPermission(toSelectCollaborators);

    }

    /*handler gets called twice one for select one for deselect */
    collaborChange(selected : any,i:number) {
        this.possibleCollaborators[i].isSelected = selected ? 'Y' : 'N'

    }

    setCollaboratorPermission(selectedCollaborators:Array<any>){
        for (let collab  of  this.possibleCollaborators) {
            let isSelected: Boolean = false;
            let canUpload: Boolean = false;
            let canUpdate: Boolean = false;

            for (let selected of  selectedCollaborators) {
                if (collab.idAppUser == selected.idAppUser) {
                    isSelected = true;
                    canUpload = selected.canUploadData != null ? selected.canUploadData == "Y" : false;
                    canUpdate = selected.canUpdate != null ? selected.canUpdate == "Y" : false;
                    break;
                }
            }
            collab.isSelected = isSelected ? "Y" : "N";
            collab.canUploadData = canUpload ? "Y" : "N";
            collab.canUpdate = canUpdate ? "Y" : "N";

        }
    }

    compareByID(itemOne, itemTwo) {
        return itemOne && itemTwo && itemOne.idAppUser == itemTwo.idAppUser;
    }

    toggeSelect(){
        //let tempCollabs =
        if(this.selectMode === "Select All"){
            this.visibilityForm.get("collaborators").setValue(this.possibleCollaborators.slice());
            this.selectMode = "Unselect All"
        }else{
            this.visibilityForm.get("collaborators").setValue([]);
            this.selectMode = "Select All"
        }

    }

    ngOnDestroy(){
        this.getLabService.labMembersSubject.next(null);

    }

}




