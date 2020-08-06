import {Component, Inject, OnInit, ViewChild} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {FormControl} from "@angular/forms";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {CookieUtilService} from "../services/cookie-util.service";
import {DialogsService} from "./popup/dialogs.service";
import {ConstantsService} from "../services/constants.service";
import {ActionType} from "./interfaces/generic-dialog-action.model";
import {AngularEditorComponent, AngularEditorConfig} from "@kolkov/angular-editor";
import {BaseGenericContainerDialog} from "./popup/base-generic-container-dialog";
import {DictionaryService} from "../services/dictionary.service";
import {HttpUriEncodingCodec} from "../services/interceptors/http-uri-encoding-codec";

@Component({
    selector: "context-help-popup",
    template: `
        <div class="flex-container-col full-width full-height double-padded">
            <div class="editor-grid">
                <angular-editor #descEditorRef id="descEditor" [formControl]="descriptionControl"
                                [config]="editorConfig">
                </angular-editor>
            </div>
            <div class="flex-container-row align-center">
                <mat-form-field class="flex-grow">
                    <textarea matInput
                              placeholder="Tooltip"
                              [formControl]="this.tooltipControl"
                              matTextareaAutosize
                              matAutosizeMinRows="3"
                              matAutosizeMaxRows="3">
                    </textarea>
                </mat-form-field>
                <div *ngIf="hasEditPermission" class="padded">
                    <button mat-raised-button
                            class="minimize"
                            [disabled]="!hasEditPermission"
                            (click)="onClickEdit()">
                        {{ editorConfig.editable ? 'View' : 'Edit' }}
                    </button>
                </div>
            </div>
        </div>
        <div class="flex-container-row justify-flex-end generic-dialog-footer-colors">
            <save-footer *ngIf="hasEditPermission"
                         name="Save"
                         [icon]="constService.ICON_SAVE"
                         [showSpinner]="showSpinner"
                         (saveClicked)="save()">
            </save-footer>
            <save-footer name="Close"
                         [actionType]="actionType.SECONDARY"
                         (saveClicked)="onClose()">
            </save-footer>
        </div>
    `,
    styles: [`
        :host /deep/ angular-editor #editor {
            resize: none;
        }
        :host /deep/ angular-editor .angular-editor-button[title="Insert Image"] {
            display: none;
        }
    `]
})

export class ContextHelpPopupComponent extends BaseGenericContainerDialog implements OnInit {
    @ViewChild("descEditorRef") descEditor: AngularEditorComponent;

    public tooltipControl: FormControl;
    public actionType: any = ActionType;
    public hasEditPermission: boolean = false;
    public editorConfig: AngularEditorConfig;
    public descriptionControl: FormControl;
    public popupTitle: string = "";

    private readonly NO_HELP_TEXT: string = "No help available";
    private readonly dictionary: any;

    constructor(@Inject(MAT_DIALOG_DATA) private data: any,
                private httpClient: HttpClient,
                private cookieUtilService: CookieUtilService,
                private dialogsService: DialogsService,
                public constService: ConstantsService,
                private dictionaryService: DictionaryService,
                private dialogRef: MatDialogRef<ContextHelpPopupComponent>) {
        super();
        if(this.data) {
            this.innerTitle = this.data.popupTitle;
            this.dictionary = this.data.dictionary;
            this.hasEditPermission = this.data.hasEditPermission;
        }
    }

    ngOnInit() {
        this.editorConfig = {
            spellcheck: true,
            height: "15em",
            enableToolbar: true,
            defaultFontSize: '2'
        };

        this.descriptionControl = new FormControl(this.dictionary && this.dictionary.helpText ? this.dictionary.helpText : this.NO_HELP_TEXT);
        this.tooltipControl = new FormControl(this.dictionary && this.dictionary.toolTipText ? this.dictionary.toolTipText : "");

        if (this.hasEditPermission) {
            this.descriptionControl.enable();

        } else {
            this.descriptionControl.disable();
            this.tooltipControl.disable();
        }

        this.descEditor.editorToolbar.showToolbar = this.hasEditPermission;
        this.editorConfig.editable = false;
    }


    public save(): void {
        if (this.dictionary) {
            this.showSpinner = true;
            this.cookieUtilService.formatXSRFCookie();
            let params: HttpParams = new HttpParams({encoder: new HttpUriEncodingCodec()})
                .set("idContextSensitiveHelp", this.dictionary.idContextSensitiveHelp ? this.dictionary.idContextSensitiveHelp : "")
                .set("context1", this.dictionary.context1)
                .set("context2", this.dictionary.context2)
                .set("context3", this.dictionary.context3)
                .set("helpText", this.descriptionControl.value)
                .set("toolTipText", this.tooltipControl.value);
            let headers: HttpHeaders = new HttpHeaders()
                .set("Content-Type", "application/x-www-form-urlencoded");
            this.httpClient.post("/gnomex/UpdateContextSensitiveHelp.gx", params.toString(), {headers: headers}).subscribe((result: any) => {
                if (result && result.idContextSensitiveHelp) {
                    this.dictionaryService.reloadAndRefresh(() => {
                        this.dialogRef.close(true);
                        this.showSpinner = false;
                    }, null, DictionaryService.CONTEXT_SENSITIVE_HELP);

                } else {
                    let message: string = "";
                    if (result && result.message) {
                        message = ": " + result.message;
                    }
                    this.showSpinner = false;
                    this.dialogsService.error("An error occurred while saving the context help" + message);
                }
            });
        }
    }

    public onClose(): void {
        this.dialogRef.close();
    }

    public onClickEdit(): void {
        this.editorConfig.editable = !this.editorConfig.editable;
    }
}
