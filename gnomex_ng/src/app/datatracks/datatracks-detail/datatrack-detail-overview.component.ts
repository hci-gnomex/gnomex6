/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {DataTrackService} from "../../services/data-track.service";
import {ActivatedRoute, Router} from "@angular/router";
import {IAnnotation} from "../../util/interfaces/annotation.model";
import {IAnnotationOption} from "../../util/interfaces/annotation-option.model";
import {ConstantsService} from "../../services/constants.service";
import {GnomexService} from "../../services/gnomex.service";
import {DialogsService} from "../../util/popup/dialogs.service";
import {HttpParams} from "@angular/common/http";
import {MatDialog, MatDialogRef} from "@angular/material";
import {ShareLinkDialogComponent} from "../../util/share-link-dialog.component";
import {DatatracksSummaryTabComponent} from "./datatracks-summary-tab.component";
import {AnnotationTabComponent, OrderType} from "../../util/annotation-tab.component";
import {DatatracksVisibilityTabComponent} from "./datatracks-visibility-tab.component";
import {FormGroup} from "@angular/forms";





@Component({
    templateUrl:'./datatrack-detail-overview.component.html',

    styles: [`


        .flex-container{
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        .mat-tab-group-border{
            border: 1px solid #e8e8e8;
        }


`]
})
export class DatatracksDetailOverviewComponent implements OnInit, AfterViewInit, OnDestroy{
    private dtOverviewForm:FormGroup;
    private datatrack: any;
    private datatrackFiles: Array<any> ;
    private datatrackDirectory:any;
    private annotations: IAnnotation[];
    public relatedObjects: any;
    public showRelatedDataTab:boolean = false;
    public showDownloadLink:boolean = false;
    public showUCSC:boolean = false;
    public showIGV: boolean = true;
    public showIOBIO: boolean = false;
    public showLink: boolean = false;
    public showSpinner:boolean = false;
    private shareWebLinkDialogRef: MatDialogRef<ShareLinkDialogComponent>;
    public types = OrderType;
    @ViewChild(DatatracksSummaryTabComponent) summaryComponet:DatatracksSummaryTabComponent;
    @ViewChild(AnnotationTabComponent) annotationComponent:AnnotationTabComponent;
    @ViewChild(DatatracksVisibilityTabComponent) visibilityComponent: DatatracksVisibilityTabComponent;


    constructor(private dataTrackService:DataTrackService,private route:ActivatedRoute,
                public constService: ConstantsService,
                private gnomexService: GnomexService,
                private dialogService: DialogsService,
                private dialog: MatDialog,){
    }

    ngOnInit(){

        console.log(this.dataTrackService.datatrackListTreeNode);

        this.route.data.forEach(data =>{
            this.datatrack =  data.datatrack;
            this.initLinkVisibility();
            this.dtOverviewForm = new FormGroup({});
            setTimeout(()=>{
                this.dtOverviewForm.addControl("summaryForm", this.summaryComponet.summaryFormGroup);
                this.dtOverviewForm.addControl("annotationForm", this.annotationComponent.annotationForm);
                this.dtOverviewForm.addControl("visibilityForm", this.visibilityComponent.visibilityForm);
                this.dtOverviewForm.markAsPristine();
            });



            this.showDownloadLink = data.fromTopic ? data.fromTopic : false;
            if(this.datatrack){
                let annots = this.datatrack.DataTrackProperties;
                this.showRelatedDataTab = this.initRelatedData(this.datatrack);

                if(annots){
                    this.annotations = Array.isArray(annots) ? <IAnnotation[]>annots : <IAnnotation[]>[annots];
                    for(let i = 0; i < this.annotations.length; i++){
                        let propertyOptions = this.annotations[i].PropertyOption;
                        if(propertyOptions){
                            this.annotations[i].PropertyOption =  Array.isArray(propertyOptions)? propertyOptions :  <IAnnotationOption[]>[propertyOptions];
                        }
                    }
                }else{
                    this.annotations = [];
                }

            }else{
                this.annotations = [];
                this.relatedObjects = [];
            }

        })


    }

    ngAfterViewInit(){

    }

    initLinkVisibility(){
        if(this.datatrack.Files){
            let ucscLinkFile:string = '';

            this.datatrackDirectory = this.datatrack.Files.Dir;
            if(this.datatrackDirectory){
                ucscLinkFile = this.datatrack.Files.Dir.ucscLinkFile
            }
            this.datatrackFiles = this.gnomexService.getFiles(this.datatrack.Files);
            this.showUCSC = ucscLinkFile != 'none' && this.datatrackFiles.length > 0;
            this.showIOBIO = this.datatrackFiles.length > 0;
            this.showLink = this.datatrackFiles.length > 0;

        }



    }

    initRelatedData(datatrack:any):boolean {
        this.relatedObjects = {};
        let rObjects = datatrack.relatedObjects;
        let relatedTopics = datatrack.relatedTopics;

        if(rObjects){

            if(rObjects.Analysis){
                let order:Array<any> =  rObjects.Analysis;
                this.relatedObjects.Analysis = Array.isArray(order) ? order : [order];
            }
            if(rObjects.DataTrack){
                let order:Array<any> =   rObjects.DataTrack;
                this.relatedObjects.DataTrack = Array.isArray(order) ? order : [order];
            }
            if(rObjects.Request){
                let order:Array<any> =   rObjects.Request;
                this.relatedObjects.Request = Array.isArray(order) ? order : [order];
            }
            if(relatedTopics){
                let topics:Array<any> = relatedTopics.Topic;
                if(topics){
                    this.relatedObjects.Topic = Array.isArray(topics) ? topics : [topics];
                }
            }

            return !!(this.relatedObjects.Topic || this.relatedObjects.Analysis || this.relatedObjects.Request || this.relatedObjects.DataTrack); // !! converts to boolean statement
        }else{
            return false;
        }

    }

    makeUCSCLink(){
        this.showSpinner = true;
        let params: HttpParams = new HttpParams().set("idDataTrack", this.datatrack.idDataTrack);

        if(this.datatrackDirectory){
            if(this.datatrackDirectory.ucscLinkFile === 'convert'){
                this.dialogService.alert("Patience, converting useq to bw/bb format.");
            }
        }

        this.dataTrackService.makeUCSCLinks(params).first().subscribe(resp => {
                if(resp && resp.result && resp.result === "SUCCESS"){
                    console.log(resp.ucscURL1);
                    window.open(resp.ucscURL1, "_blank");

                }else{

                    let message: string = "";
                    if (resp && resp.message) {
                        message = ": " + resp.message;
                    }
                    this.dialogService.confirm("An error occurred while making link. " + message, null);
                }
            });
    }
    makeIGVLink(){
        this.showSpinner = true;

        let IGVLinkCallBack = (resp):void =>{
            console.log("I am the response ", resp);
            if(resp && resp.result && resp.result === "SUCCESS" ){
                this.dialogService.confirm(resp.igvURL,null);

            }else{
                let message: string = "";
                if (resp && resp.message) {
                    message = ": " + resp.message;
                }
                this.dialogService.confirm("An error occurred while making link. " + message, null);

            }
            this.showSpinner = false;
        };

        if(this.datatrackDirectory){
            if(this.datatrackDirectory.ucscLinkFile === 'convert'){
                this.dialogService.confirm("Creating an IGV data repository containing all user-visible datatracks affiliated with IGV-supported genome builds. " +
                    "If there are unconverted USeq files, this can take a significant amount of time.  When finished, a URL link will be displayed. " +
                    "Paste the link into IGV's Data Registry URL field.  If new data tracks are added, a new repository must be created, but the " +
                    "link will remain valid.","Do you wish to continue?").first().subscribe((answer:boolean) =>{
                        if(answer) {
                            this.dataTrackService.makeIGVLink().first().subscribe(IGVLinkCallBack);
                        }
                    });
            }
        }
        this.dataTrackService.makeIGVLink().first().subscribe(IGVLinkCallBack);


    }
    makeIOBIOLink(){
        this.showSpinner = true;
        let params: HttpParams = new HttpParams().set("requestType" ,"IOBIO")
            .set("idDataTrack", this.datatrack.idDataTrack);

        this.dataTrackService.makeIOBIOLink(params).first().subscribe( resp =>{
            if(resp && resp.result && resp.result === "SUCCESS"){
                window.open(resp.urlsToLink, "_blank");

            }else{
                let message: string = "";
                if (resp && resp.message) {
                    message = ": " + resp.message;
                }
                this.dialogService.confirm("An error occurred while making link. " + message, null);
            }
            this.showSpinner = false;

        })



    }
    makeURLLink(){

        this.showSpinner = true;
        let params: HttpParams = new HttpParams().set("idDataTrack", this.datatrack.idDataTrack);

        this.dataTrackService.makeURLLink(params).first().subscribe( resp =>{
            if(resp && resp.result && resp.result === "SUCCESS"){
                this.dialogService.confirm(resp.urlsToLink,null);

            }else{
                let message: string = "";
                if (resp && resp.message) {
                    message = ": " + resp.message;
                }
                this.dialogService.confirm("An error occurred while making link. " + message, null);
            }
            this.showSpinner = false;

        })
    }

    destroyLinks():void{
        this.showSpinner = true;
        this.dataTrackService.destroyLinks().first()
            .subscribe(resp =>{
                if(resp && resp.result && resp.result === "SUCCESS"){
                    this.dialogService.confirm("All Links Destroyed.",null);

                }else{
                    this.dialogService.confirm("Failed to delete links. Contact site admin.", null);
                }
                this.showSpinner = false;
            });
    }

    shareableLink(): void{
        this.shareWebLinkDialogRef = this.dialog.open(ShareLinkDialogComponent, {
            width: '35em',
            data: {
                name: this.datatrack.name,
                number: this.datatrack.number,
                type: "dataTrackNumber"


            }
        });
    }





    ngOnDestroy(){
    }
    save(){
        console.log(this.dtOverviewForm);
    }

    tabChanged(event:any){

    }



}
