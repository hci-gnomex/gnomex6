import {Component, Inject, OnInit, ViewChild} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef, MatTabChangeEvent} from "@angular/material";
import * as _ from "lodash";
import {ConstantsService} from "../../services/constants.service";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {PropertyService} from "../../services/property.service";
import {IFileParams} from "../interfaces/file-params.model";
import {LinkedSampleFileComponent} from "./linked-sample-file.component";
import {FileService} from "../../services/file.service";
import {Subscription} from "rxjs";
import {HttpParams} from "@angular/common/http";
import {OrganizeFilesComponent} from "./organize-files.component";
import {DialogsService, DialogType} from "../popup/dialogs.service";
import {UploadFileComponent} from "./upload-file.component";
import {IGnomexErrorResponse} from "../interfaces/gnomex-error.response.model";
import {BaseGenericContainerDialog} from "../popup/base-generic-container-dialog";


@Component({
    template: `
        <div class="full-height full-width flex-container-col">
            <mat-tab-group [(selectedIndex)]="this.selectedTabIndex"
                           (selectedTabChange)="tabChanged($event)"
                           class="mat-tab-group-border full-height full-width">
                <mat-tab class="full-height" label="Upload">
                    <upload-file (navToTab)="tabNavigateTo($event)"
                                 [manageData]="this.manageData"></upload-file>
                </mat-tab>
                <mat-tab class="full-height" label="Organize Files">
                    <organize-file (closeDialog)="onCloseDialog()" [manageData]="this.manageData">
                    </organize-file>
                </mat-tab>
                <mat-tab *ngIf="this.showLinkedSampleTab" class="full-height" label="Link Samples">
                    <linked-sample-file (closeDialog)="onCloseDialog()"
                                        [manageData]="this.manageData">
                    </linked-sample-file>
                </mat-tab>
            </mat-tab-group>
        </div>
    `,
    styles: [`

        .padded-outer{
            margin:0;
            padding:0;
        }
        .padded-inner{
            padding:0.3em;

        }
        mat-form-field.medium-form-input{
            width: 20em;
            margin-right: 1em;
        }
        .mat-tab-group-border{
            border: 1px solid #e8e8e8;
        }
        .force-flex{
            display:flex !important;
        }




    `]
})
export class ManageFilesDialogComponent extends BaseGenericContainerDialog implements OnInit{

    order:any;
    manageData:IFileParams;
    selectedTabIndex:number = 0;
    showLinkedSampleTab:boolean = false;

    @ViewChild(LinkedSampleFileComponent) private linkedSampleTab: LinkedSampleFileComponent;
    @ViewChild(OrganizeFilesComponent) private orgFileTab: OrganizeFilesComponent;
    @ViewChild(UploadFileComponent) private uploadFileTab: UploadFileComponent;
    saveSubscription:Subscription;




    constructor(private dialogRef: MatDialogRef<ManageFilesDialogComponent>,
                private fileService: FileService,
                private dialogService: DialogsService,
                public constService:ConstantsService,private fb:FormBuilder,
                @Inject(MAT_DIALOG_DATA) private data,private propertyService: PropertyService) {
        super();
    }

    ngOnInit(){
        let type= '';
        let uploadURL = '';
        let idObj:any = null;
        let p = this.propertyService.getProperty(PropertyService.PROPERTY_EXPERIMENT_FILE_SAMPLE_LINKING_ENABLED);



        if(this.data){
            let isFDT: boolean = this.data.isFDT;
            if(this.data.startTabIndex){
                this.selectedTabIndex = this.data.startTabIndex;
            }else{
                this.selectedTabIndex = 0;
            }

            if(this.data.order.idRequest){
                type= 'e';
                uploadURL = "/gnomex/UploadExperimentURLServlet.gx";
                idObj = {idRequest: this.data.order.idRequest }
            }else if(this.data.order.idAnalysis){
                type= 'a';
                uploadURL = "/gnomex/UploadAnalysisURLServlet.gx";
                idObj = {idAnalysis: this.data.order.idAnalysis};

            }
            this.manageData =_.cloneDeep({
                type:type,
                uploadURL: uploadURL,
                id: idObj,
                isFDT: this.data.isFDT
            });
        }
        if(p.propertyValue && p.propertyValue === 'Y' && this.manageData.type === 'e'){
            this.showLinkedSampleTab = true;
        }else{
            this.showLinkedSampleTab = false;
        }


        this.saveSubscription =  this.fileService.saveManageFilesObservable().subscribe( () =>{
            this.dialogService.startDefaultSpinnerDialog();
            this.save()
        })
    }

    ngAfterViewInit(){ // hack for setting split size and enabling trees
        setTimeout(()=>{
            if(this.selectedTabIndex > 0){
                this.orgFileTab.prepareView(true);
            }
        });

    }

    tabChanged(event:MatTabChangeEvent){
        if(this.showLinkedSampleTab){
            let activeLink:boolean = event.tab.textLabel === "Link Samples";
            this.linkedSampleTab.prepareView(activeLink);
        }
        if(event.tab.textLabel === "Upload"){
            this.uploadFileTab.sizeGridColumns();
        }
        let activeOrganize:boolean = event.tab.textLabel === "Organize Files";
        this.orgFileTab.prepareView(activeOrganize);

    }
    tabNavigateTo(index){
        this.selectedTabIndex = index;
    }


    onCloseDialog(){
        this.dialogRef.close();
    }


    executeSave(params:any){
        if(this.manageData.type === 'a'){
            this.fileService.organizeAnalysisUploadFiles(params).subscribe(resp => {
                this.dialogService.stopAllSpinnerDialogs();
                if(resp.warning){
                    this.dialogService.alert(resp.warning);
                }
                this.fileService.getManageFilesForm().markAsPristine();
                this.fileService.emitGetAnalysisOrganizeFiles({idAnalysis : this.manageData.id.idAnalysis});
            },(err:IGnomexErrorResponse) => {
                this.dialogService.stopAllSpinnerDialogs();
            });

        }else{
            this.fileService.organizeExperimentFiles(params).subscribe( resp => {
                if(resp.warning){
                    this.dialogService.alert(resp.warning, null, DialogType.WARNING);
                }
                this.fileService.getManageFilesForm().markAsPristine();
                this.fileService.emitGetRequestOrganizeFiles({idRequest: this.manageData.id.idRequest });
                if(this.showLinkedSampleTab){
                    this.fileService.emitGetLinkedSampleFiles({idRequest: this.manageData.id.idRequest});
                }

            },(err:IGnomexErrorResponse) => {
                this.dialogService.stopAllSpinnerDialogs();
            });

        }

    }

    save(){
        this.orgFileTab.save();
        if(this.linkedSampleTab){
            this.linkedSampleTab.save();
        }


        let group = this.fileService.getManageFilesForm().controls;
        let paramsObj =  null;
        let params:HttpParams = new HttpParams();

        for(let g in group){
            let control = (<FormGroup>group[g]).controls;

            for(let c in control){
                let cVal = (<FormControl>control[c]).value;
                if(c.endsWith("Params")){
                    paramsObj = paramsObj ? {...paramsObj, ...cVal } : {...cVal}
                }
            }
        }

        for(let p in paramsObj){
            params = params.set(p , paramsObj[p]);
        }

        this.executeSave(params);
    }

    ngOnDestroy(){
        this.fileService.resetManageFilesForm();
        this.saveSubscription.unsubscribe();
    }


}
