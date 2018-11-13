import {Component, Inject, OnDestroy, OnInit} from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig, MatDialog} from "@angular/material";
import {ConstantsService} from "../../services/constants.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ExperimentPlatformService} from "../../services/experiment-platform.service";
import {DictionaryService} from "../../services/dictionary.service";
import {ProtocolService} from "../../services/protocol.service";
import {HttpParams} from "@angular/common/http";
import {ISubscription} from "rxjs/Subscription";
import {DialogsService} from "../../util/popup/dialogs.service";



@Component({
    template: `
        <form [formGroup]="formGroup">
            <div mat-dialog-title class="padded-outer">
                <div class="dialog-header-colors padded-inner">
                    Edit Library Prep
                </div>
            </div>
            <div mat-dialog-content style="margin: 0; padding: 0;">
                <div style="margin: 0.5em;">
                    <div class="flex-container-row spaced-children-margin" style="align-items:center;">
                        <mat-form-field  class="medium-form-input">
                            <input matInput placeholder="Name" formControlName="name">
                            <mat-error *ngIf="this.formGroup?.controls['name']?.hasError('required')">
                                This field is required
                            </mat-error>
                        </mat-form-field>
                        <mat-checkbox  formControlName="isActive">
                            Active
                        </mat-checkbox>
                    </div>
                    <div matTooltip="If the site you want to reach is https please include in url" class="flex-container-row spaced-children-margin" style="align-items:center;">
                        <mat-form-field  class="medium-form-input">
                            <input matInput placeholder="URL" formControlName="url">
                        </mat-form-field>
                        <button mat-button color="accent" [disabled]="!formGroup.get('url').value" (click)="navToURL()" > 
                            <img [src]="this.constService.PAGE_GO">
                            View URL
                        </button>
                    </div>
                    <mat-form-field class="full-width">
                        <textarea matInput placeholder="Description" formControlName="description" matTextareaAutosize matAutosizeMinRows="10" matAutosizeMaxRows="15"></textarea>
                    </mat-form-field>
                    <div class="flex-container-row spaced-children-margin">
                        <mat-form-field  class="medium-form-input">
                            <input matInput placeholder="Read 1 Adapter Sequence" formControlName="adapterSequenceThreePrime">
                        </mat-form-field>
                        <mat-form-field  class="medium-form-input">
                            <input matInput placeholder="Read 2 Adapter Sequence" formControlName="adapterSequenceFivePrime">
                        </mat-form-field>
                    </div>
                    
                    
                </div>
            </div>
            <div class="padded-outer" style="justify-content: flex-end;"  mat-dialog-actions>
                <div class="padded-inner flex-container-row" style="align-items:center" >
                    <div class="flex-grow">
                        <save-footer [disableSave]="formGroup.invalid"
                                     [showSpinner]="showSpinner"
                                     (saveClicked)="saveChanges()"
                                     [dirty]="formGroup.dirty" >
                        </save-footer>
                    </div>
                    <button mat-button  mat-dialog-close> Cancel  </button>
                </div>
            </div>
        </form>
    `,
    styles: [`

        .padded-outer{
            margin:0;
            padding:0;
        }
        .padded-inner{
            padding:0.3em;

        }
        .medium-form-input{
            width: 30em
        }




    `]
})
export class LibraryPrepProtocolDialogComponent implements OnInit, OnDestroy{

    saveProtocolFn:any;
    protocolParams:any;
    protocol:any;
    formGroup:FormGroup;
    private protocolSubscription: ISubscription;
    public showSpinner:boolean = false;




    constructor(private dialogRef: MatDialogRef<LibraryPrepProtocolDialogComponent>,
                public constService:ConstantsService, private fb: FormBuilder,
                private expPlatformService: ExperimentPlatformService,
                private dictionaryService: DictionaryService,
                private protocolService:ProtocolService,
                private dialogService:DialogsService,
                @Inject(MAT_DIALOG_DATA) private data) {
        if (this.data) {
            this.saveProtocolFn =  this.data.saveProtocolFn;
            this.protocolParams = this.data.protocol;
        }
    }

    ngOnInit(){
        this.formGroup = this.fb.group({
                idProtocol:'',
                name: ['',Validators.required],
                isActive: true,
                url:'',
                description:'',
                adapterSequenceThreePrime:'',
                adapterSequenceFivePrime:''

            }
        );
        if(this.protocolParams){
            this.protocolService.getProtocolByIdAndClass(this.protocolParams.idSeqLibProtocol, DictionaryService.SEQ_LIB_PROTOCOL);
            this.protocolService.getProtocolObservable().first().subscribe(resp =>{
                if(resp){
                    this.protocol = resp;
                    this.formGroup.get('idProtocol').setValue(resp.idSeqLibProtocol ? resp.idSeqLibProtocol : '');
                    this.formGroup.get('name').setValue(resp.name? resp.name : '');
                    this.formGroup.get('isActive').setValue(resp.isActive ? resp.isActive === 'Y': false);
                    this.formGroup.get('url').setValue(resp.url ? resp.url : '');
                    this.formGroup.get('description').setValue(this.formatDescription(resp.description));
                    this.formGroup.get('adapterSequenceThreePrime').setValue(resp.adapterSequenceThreePrime ? resp.adapterSequenceThreePrime : '');
                    this.formGroup.get('adapterSequenceFivePrime').setValue(resp.adapterSequenceFivePrime ? resp.adapterSequenceFivePrime : '');
                    this.formGroup.markAsPristine();
                }
            },err =>{this.dialogService.alert(err)});
        }

    }

    /*backend sends an empty array when no string provided for description*/
    formatDescription(description:any):string{
        if(description){
               return Array.isArray(description) ? '' : description;
        }else{
            return '';
        }

    }
    navToURL(){
        let url: string = this.formGroup.get('url').value;
        if (!url.match(/^https?:\/\//i)) {
            url = 'http://' + url;
        }
        window.open(url, "_blank");
    }

    saveChanges(){
        this.showSpinner = true;
        let params:HttpParams = new HttpParams()
            .set('idProtocol', this.formGroup.get('idProtocol').value)
            .set('protocolName',this.formGroup.get('name').value)
            .set('protocolDescription',this.formGroup.get('description').value)
            .set('protocolUrl',this.formGroup.get('url').value)
            .set('isActive',this.formGroup.get('isActive').value ? 'Y': 'N')
            .set('protocolClassName',DictionaryService.SEQ_LIB_PROTOCOL)
            .set('adapterSequenceThreePrime',this.formGroup.get('adapterSequenceThreePrime').value)
            .set('adapterSequenceFivePrime',this.formGroup.get('adapterSequenceFivePrime').value)
        this.protocolService.saveProtocol(params).subscribe(resp =>{
                if(resp && resp.result && resp.result === "SUCCESS"){
                    this.showSpinner = false;
                    if(resp.message){
                        this.dialogService.alert(resp.message);
                        return;
                    }
                    this.saveProtocolFn(resp);
                    this.dialogRef.close();
                }else{
                    this.showSpinner = false;
                    this.dialogService.alert("An error occurred please contact GNomEx Support")
                }
            }, error => {
                this.showSpinner = false;
                this.dialogService.alert(error)});
    }

    ngOnDestroy(){
        //this.protocolSubscription.unsubscribe();
    }






}