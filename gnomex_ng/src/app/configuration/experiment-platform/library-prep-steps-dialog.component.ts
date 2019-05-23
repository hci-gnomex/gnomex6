import {AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig, MatDialog} from "@angular/material";
import {ConstantsService} from "../../services/constants.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ExperimentPlatformService} from "../../services/experiment-platform.service";
import {DictionaryService} from "../../services/dictionary.service";
import {ProtocolService} from "../../services/protocol.service";
import {DialogsService} from "../../util/popup/dialogs.service";
import {jqxEditorComponent} from "../../../assets/jqwidgets-ts/angular_jqxeditor";



@Component({
    template: `
        <form [formGroup]="formGroup">
            <div mat-dialog-title class="padded-outer">
                <div class="dialog-header-colors padded-inner">
                    Lib Prep Steps
                </div>
            </div>
            <div mat-dialog-content style="margin: 0; padding: 0;">
                <div class="flex-container-row" style="margin: 0.5em;">
                    <div class="flex-grow flex-container-col" style="margin-right: 0.5em;">
                        <label class="gx-label" style="margin-bottom:0.5em;" for="coreStepsLabel" > Core Steps </label>
                        <jqxEditor
                                #coreEditorRef
                                (onChange)="changedVal($event)"
                                id="coreStepsLabel"
                                [height]="300"
                                [editable]="true"
                                [tools]="tbarSettings"
                                [toolbarPosition]="'bottom'">

                        </jqxEditor>
                    </div>
                    <div class="flex-grow flex-container-col">
                        <label class="gx-label" for="labStepsLabel" > Core Steps(No Lib Prep) </label>
                        <jqxEditor
                                #labEditorRef
                                (onChange)="changedVal($event)"
                                id="labStepsLabel"
                                [height]="300"
                                [editable]="true"
                                [tools]="tbarSettings"
                                [toolbarPosition]="'bottom'">

                        </jqxEditor>
                    </div>

                </div>
            </div>
            <div class="padded-outer" style="justify-content: flex-end;"  mat-dialog-actions>
                <div class="padded-inner flex-container-row" style="align-items:center" >
                    <div class="flex-grow">
                        <save-footer [name]="applyText"
                                     (saveClicked)="applyChanges()"
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
export class LibraryPrepStepsDialogComponent implements OnInit, AfterViewInit{

    applyStepsFn:any;
    applyText:string = "Apply";
    readonly tbarSettings :string  ="bold italic underline | left center right |  format font size | color | ul ol | outdent indent";
    formGroup:FormGroup;
    rowData:any;

    @ViewChild('coreEditorRef') coreEditorRef:jqxEditorComponent;
    @ViewChild('labEditorRef') labEditorRef:jqxEditorComponent;




    constructor(private dialogRef: MatDialogRef<LibraryPrepStepsDialogComponent>,
                public constService:ConstantsService, private fb: FormBuilder,
                private expPlatformService: ExperimentPlatformService,
                private dictionaryService: DictionaryService,
                private protocolService:ProtocolService,
                private dialogService:DialogsService,
                @Inject(MAT_DIALOG_DATA) private data) {
        if (this.data) {
            this.rowData = this.data.rowData;
            this.applyStepsFn = this.data.applyStepsFn;
        }
    }

    ngOnInit(){
        this.formGroup = this.fb.group({
            }
        );

    }
    applyChanges(){
        this.applyStepsFn(this.coreEditorRef.val(), this.labEditorRef.val());
        this.dialogRef.close();
    }

    changedVal(event:any){
        this.formGroup.markAsDirty();
    }

    ngAfterViewInit(){
        this.coreEditorRef.val( this.rowData.coreSteps ? this.rowData.coreSteps : '');
        this.labEditorRef.val( this.rowData.coreStepsNoLibPrep ? this.rowData.coreStepsNoLibPrep : '');
    }






}