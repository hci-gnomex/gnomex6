import {AfterViewInit, Component, Inject, OnInit, ViewChild} from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {ConstantsService} from "../../services/constants.service";
import {FormBuilder, FormGroup} from "@angular/forms";
import {ExperimentPlatformService} from "../../services/experiment-platform.service";
import {DictionaryService} from "../../services/dictionary.service";
import {ProtocolService} from "../../services/protocol.service";
import {DialogsService} from "../../util/popup/dialogs.service";
import {jqxEditorComponent} from "../../../assets/jqwidgets-ts/angular_jqxeditor";
import {BaseGenericContainerDialog} from "../../util/popup/base-generic-container-dialog";



@Component({
    template: `
        <form [formGroup]="formGroup">
            <div class="flex-container-col full-width full-height">
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
                        <label class="gx-label" style="margin-bottom:0.5em;" for="labStepsLabel" > Core Steps(No Lib Prep) </label>
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
        </form>
    `,
})
export class LibraryPrepStepsDialogComponent extends BaseGenericContainerDialog implements OnInit, AfterViewInit{

    applyStepsFn:any;
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
        super();
        if (this.data) {
            this.rowData = this.data.rowData;
            this.applyStepsFn = this.data.applyStepsFn;
        }
    }

    ngOnInit(){
        this.formGroup = this.fb.group({
            }
        );

        this.dirty = () => {return this.formGroup.dirty; };
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
