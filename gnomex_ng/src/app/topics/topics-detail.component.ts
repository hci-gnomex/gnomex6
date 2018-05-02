/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {TopicService} from "../services/topic.service";
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs/Subscription";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ConstantsService} from "../services/constants.service";
import {GnomexService} from "../services/gnomex.service";
import {MatAutocomplete} from "@angular/material";
import {GetLabService} from "../services/get-lab.service";
import {URLSearchParams} from "@angular/http";
import {PropertyService} from "../services/property.service";
import {HttpParams} from "@angular/common/http";
import {DialogsService} from "../util/popup/dialogs.service";
import {jqxEditorComponent} from "../../assets/jqwidgets-ts/angular_jqxeditor";

@Component({
    templateUrl: './topics-detail.component.html',
    styles:[`
        .flex-container{
            display: flex;
            justify-content: space-between;
            flex:1;
        }
        .flexbox-column{
            display:flex;
            flex-direction:column;
            height:100%;
            width:100%;
        }
        .mat-tab-group-border{
            border: 1px solid #e8e8e8;
        }
        mat-form-field.formField {
            width: 30%;
            margin: 0 0.5em;
        }
    `]
})

export class TopicDetailComponent implements OnInit, OnDestroy, AfterViewInit{
    private topicListNodeSubscription:Subscription;
    private topicLab:any;
    private labList:Array<any>;
    private topicNode:any;
    private topicForm: FormGroup;
    private currentIdLab:string;
    private currentIdAppUser:string;
    private toolBarSettings:string = "bold italic underline | left center right |  format font size | color | ul ol | outdent indent";
    private edit:boolean = false;
    private description:string = '';
    private visOpt:string;
    public showSpinner:boolean = false;

    @ViewChild("autoLab") matAutoLab: MatAutocomplete;
    @ViewChild('editorReference') myEditor: jqxEditorComponent;

    private visRadio: Array<any>;


    constructor(private route:ActivatedRoute,
                public topicService:TopicService,
                private fb: FormBuilder,
                private gnomexService:GnomexService,
                private constService:ConstantsService,
                public getLabService:GetLabService,
                private propertyService:PropertyService,
                private dialogService: DialogsService) {
    }

    ngOnInit(){
        this.visRadio = [
            {display:'Owner    (the owner and the group manager)',value:'OWNER', icon: this.constService.ICON_TOPIC_OWNER},
            {display:'All Lab Members', value:'MEM', icon: this.constService.ICON_TOPIC_MEMBER}
        ];
        if(this.propertyService.isPublicVisbility()){
            this.visRadio.push( {display:'Public Access', value:'PUBLIC', icon: this.constService.ICON_TOPIC_PUBLIC})
        }

        this.topicForm = this.fb.group({
            name: ['', Validators.required],
            selectLab:[ '', Validators.required],
            selectOwner:['', Validators.required]
        });



        this.labList = this.gnomexService.labList
            .filter( lab => lab.canGuestSubmit === 'Y' || lab.canSubmitRequests == 'Y' ) ;




        this.topicListNodeSubscription = this.topicService.getSelectedTreeNodeObservable()
            .subscribe(data =>{
               this.topicNode = data;
        });


        this.route.data.forEach(data =>{
            this.topicLab = data.topicLab.Lab;
            this.currentIdLab = this.topicLab.idLab ? this.topicLab.idLab : "";
            console.log("The topic lab: ", this.topicLab);
            if(this.topicNode.name){
                this.visOpt = this.topicNode.codeVisibility;
                console.log("the select topic node ", this.topicNode);
                this.currentIdAppUser = this.topicNode.idAppUser ? this.topicNode.idAppUser : '';

                let memList: Array<any> = Array.isArray(this.topicLab.members) ? this.topicLab.members : [this.topicLab.members.AppUser];
                let activeMemList: Array<any> = memList.filter(appUser => appUser.isActive === 'Y');
                this.getLabService.labMembersSubject.next(activeMemList);

                this.topicForm.get("selectLab").setValue(this.topicLab);
                this.topicForm.get("name").setValue(this.topicNode.name);
                this.topicForm.get("selectOwner").setValue(this.currentIdAppUser);

                this.edit = this.topicNode.canWrite === 'Y';
                if (this.edit) {
                    this.topicForm.get("name").enable();
                    this.topicForm.get("selectLab").enable();
                    this.topicForm.get("selectOwner").enable();
                } else {
                    this.topicForm.get("name").disable();
                    this.topicForm.get("selectLab").disable();
                    this.topicForm.get("selectOwner").disable();
                }
                this.topicForm.markAsPristine();
            }


        });

        //this.toolBarSettings = this.edit ? this.constService.DEFAULT_TOOLBAR_SETTINGS : '';

    }


    ngAfterViewInit():void{
        this.route.data.forEach(data =>{
            //this.myEditor.val(this.topicNode.description);
        });


    }



    radioChange(){
        this.topicForm.markAsDirty();
    }


    selectOption($event){
        let value = $event.source.value;
        this.topicForm.get("selectLab").setValue($event.source.value);

        if(!value.idLab){
            return;
        }
        if(this.currentIdLab != value.idLab){
            this.currentIdLab = value.idLab;
            let params: URLSearchParams = new URLSearchParams();
            params.set("idLab", value.idLab );
            params.set("includeBillingAccounts", "N");
            params.set("includeProductCounts", "N");

            this.getLabService.getLabMembers_fromBackend(params);
            this.topicForm.get("selectOwner").setValue("");
            this.topicForm.markAsPristine();

        }

    }

    displayLab(lab: any) {
        return lab ? lab.name : lab;
    }
    filterLabList(selectedLab:any){

        let fLabs: any[];
        if (selectedLab) {
            if(selectedLab.idLab){
                fLabs = this.labList.filter(lab =>
                    lab.name.toLowerCase().indexOf(selectedLab.name.toLowerCase()) >= 0);
                return fLabs;

            }else{
                fLabs = this.labList.filter(lab =>
                    lab.name.toLowerCase().indexOf(selectedLab.toLowerCase()) >= 0);
                return fLabs;
            }


        } else {
            return this.labList;
        }

    }

    firstLabOpt(): void {
        this.matAutoLab.options.first.select();
    }
    changed(event:any){
        console.log(event.args);

    }

    save(){
        this.showSpinner = true;

        let params: URLSearchParams = new URLSearchParams();
        params.set("description",this.description);
        params.set("name",this.topicForm.get("name").value);
        params.set("idTopic",this.topicNode.idTopic);
        params.set("idLab" ,this.currentIdLab);
        params.set("idAppUser",this.topicForm.get("selectOwner").value);
        params.set("idParentTopic", this.topicNode.idParentTopic);
        params.set("codeVisibility", this.visOpt);

        this.topicService.saveTopic(params).first().subscribe( resp =>{
            this.visOpt = resp.codeVisibility;
            this.topicService.refreshTopicsList_fromBackend();
            this.showSpinner = false;
            this.topicForm.markAsPristine();

            let visMessage:string = resp.visibilityMsg;

            if(visMessage.length > 0){
                let message = "A topic may not be given broader visibility than its parent. Since the parent is currently only visible to " +
                    visMessage + ", visibility for this topic has been set to the same level.";
                this.dialogService.confirm(message,null);
            }


        })
    }




    ngOnDestroy(){
        this.topicListNodeSubscription.unsubscribe();
    }



}
