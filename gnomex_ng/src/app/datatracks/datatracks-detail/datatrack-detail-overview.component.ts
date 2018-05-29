/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, OnDestroy, OnInit} from "@angular/core";
import {DataTrackService} from "../../services/data-track.service";
import {ActivatedRoute, Router} from "@angular/router";
import {IAnnotation} from "../../util/interfaces/annotation.model";
import {IAnnotationOption} from "../../util/interfaces/annotation-option.model";
import {DatatrackDetailOverviewService} from "./datatrack-detail-overview.service";
import {ConstantsService} from "../../services/constants.service";
import {GnomexService} from "../../services/gnomex.service";
import {DialogsService} from "../../util/popup/dialogs.service";
import {HttpParams} from "@angular/common/http";
import {MatDialog, MatDialogRef} from "@angular/material";
import {ShareLinkDialogComponent} from "../../util/share-link-dialog.component";





@Component({
    template: `
        <div style="display:flex; flex-direction:column; height:100%; width:100%;">
            <div style="display:flex; font-size:small; " >
                <label>
                    <img class="icon" [src]="dataTrackService?.datatrackListTreeNode.icon">
                    Data Track {{this.dataTrackService?.datatrackListTreeNode.number}}
                </label>

                <button [disabled]="!showUCSC" 
                        mat-button color="link" 
                        (click)="makeUCSCLink()"  
                        matTooltip="Create file link(s) for viewing the selected data track in the UCSC Genome Browser">
                    <img class="icon" [src]="constService.ICON_UCSC">
                    UCSC Browser
                </button>

                <button [disabled]="!showIGV"
                        mat-button color="link" 
                        (click)="makeIGVLink()"
                        matTooltip="Create file link(s) for viewing the selected data track in the IGV Genome Browser">
                    <img class="icon" [src]="constService.ICON_IGV">
                    IGV Browser
                </button>
                
                <button [disabled]="!showIOBIO"
                        mat-button color="link"
                        matTooltip="Create file link(s) for viewing the selected data track in the IOBIO Genome Browser"
                        (click)="makeIOBIOLink()">
                    <img class="icon" [src]="constService.ICON_IOBIO">
                    IOBIO Browser
                </button>

                <button  [disabled]="!showLink"
                         mat-button color="link"
                         matTooltip="Creates URL file link(s) for accessing the selected data tracks via HTTP"
                         (click)="makeURLLink()">
                    <img class="icon" [src]="constService.ICON_LINK">
                    URL Links
                </button>
                
                <button [disabled]="!showLink"
                        mat-button color="link"
                        matTooltip="Destroys all existing IGV, UCSC, IOBIO and URL links to user-owned datatracks.  Re-created links will have different random paths, making tracks private if old paths were distributed."
                        (click)="destroyLinks()">
                    <img class="icon" [src]="constService.ICON_DELETE_LINK">
                    Clear file links
                </button>
                
                <button [disabled]="!showDownload" *ngIf="showDownloadLink" mat-button color="link">
                    Download
                </button>


                <button mat-button color="link" (click)="shareableLink()">
                    <img class="icon" [src]="constService.GLOBE_LINK">
                    Share
                </button>
                <mat-spinner  *ngIf="showSpinner" strokeWidth="3" [diameter]="30"></mat-spinner>
                
                
            </div>
            
            
            
            <div style="display:flex; flex: 1;">

                <mat-tab-group style="height:100%; width:100%;" class="mat-tab-group-border"
                               (selectedTabChange)="tabChanged($event)">
                    <mat-tab style="height:100%" label="Summary">
                        <dt-summary-tab></dt-summary-tab>
                    </mat-tab>
                    <mat-tab style="height:100%" label="Annotations">
                        <dt-annotation-tab [annotations]="annotations"></dt-annotation-tab>
                    </mat-tab>
                    <mat-tab style="height:100%;" label="Visibility">
                        <dt-visibility-tab></dt-visibility-tab>
                    </mat-tab>
                </mat-tab-group>
            </div>
            <div>
                <save-footer (saveClicked)="save()"
                             [disableSave]="this.dtOverviewService.dtOverviewForm.invalid"
                             [dirty]="this.dtOverviewService.dtOverviewForm.dirty"></save-footer>
            </div>
            
        </div>
`,

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
export class DatatracksDetailOverviewComponent implements OnInit, OnDestroy{
    private datatrack: any;
    private datatrackFiles: Array<any> ;
    private datatrackDirectory:any;
    private annotations: IAnnotation[];
    public showDownloadLink:boolean = false;
    public showUCSC:boolean = false;
    public showIGV: boolean = true;
    public showIOBIO: boolean = false;
    public showLink: boolean = false;
    public showSpinner:boolean = false;
    private shareWebLinkDialogRef: MatDialogRef<ShareLinkDialogComponent>;

    constructor(private dataTrackService:DataTrackService,private route:ActivatedRoute,
                public dtOverviewService: DatatrackDetailOverviewService,
                public constService: ConstantsService,
                private gnomexService: GnomexService,
                private dialogService: DialogsService,
                private dialog: MatDialog,){
    }

    ngOnInit(){

        console.log(this.dataTrackService.datatrackListTreeNode);

        this.route.data.forEach(data =>{
           this.datatrack =  data.datatrack;
           this.initLinkVisibility() ;



           this.showDownloadLink = data.fromTopic ? data.fromTopic : false;
           if(this.datatrack){
               let annots = this.datatrack.DataTrackProperties;
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
           }
            this.dtOverviewService.dtOverviewForm.markAsPristine()


        })


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
        console.log(this.dtOverviewService.dtOverviewForm);
    }

    tabChanged(event:any){

    }



}
