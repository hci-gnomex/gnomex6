import {Component, Inject, OnDestroy, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {ConstantsService} from "../../services/constants.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ExperimentPlatformService} from "../../services/experiment-platform.service";
import {DictionaryService} from "../../services/dictionary.service";
import {ProtocolService} from "../../services/protocol.service";
import {HttpParams} from "@angular/common/http";
import {DialogsService, DialogType} from "../../util/popup/dialogs.service";
import {first} from "rxjs/operators";
import {IGnomexErrorResponse} from "../../util/interfaces/gnomex-error.response.model";
import {BaseGenericContainerDialog} from "../../util/popup/base-generic-container-dialog";


@Component({
    template: `
        <form [formGroup]="formGroup">
            <div class="flex-container-col full-width full-height">
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
                        <button mat-button class="link-button minimize" [disabled]="!formGroup.get('url').value" (click)="navToURL()" >
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
        </form>
    `,
    styles: [`
        .medium-form-input{
            width: 30em
        }
    `]
})
export class LibraryPrepProtocolDialogComponent extends BaseGenericContainerDialog implements OnInit, OnDestroy{

    saveProtocolFn:any;
    protocolParams:any;
    protocol:any;
    formGroup:FormGroup;

    constructor(private dialogRef: MatDialogRef<LibraryPrepProtocolDialogComponent>,
                public constService:ConstantsService, private fb: FormBuilder,
                private expPlatformService: ExperimentPlatformService,
                private dictionaryService: DictionaryService,
                private protocolService:ProtocolService,
                private dialogService:DialogsService,
                @Inject(MAT_DIALOG_DATA) private data) {
        super();
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
            this.protocolService.getProtocolObservable().pipe(first()).subscribe(resp =>{
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
            },(err:IGnomexErrorResponse) =>{
                this.dialogService.stopAllSpinnerDialogs();
                });
        }

        this.primaryDisable = (action) => {return this.formGroup.invalid; };
        this.dirty = () => {return this.formGroup.dirty; };

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
                        this.dialogService.alert(resp.message, "", DialogType.SUCCESS);
                        return;
                    }
                    this.saveProtocolFn(resp);
                    this.dialogRef.close();
                }else{
                    this.showSpinner = false;
                    this.dialogService.error("An error occurred please contact GNomEx Support");
                }
            }, error => {
                this.showSpinner = false;
                this.dialogService.error(error);
        });
    }

    ngOnDestroy(){
    }

}
