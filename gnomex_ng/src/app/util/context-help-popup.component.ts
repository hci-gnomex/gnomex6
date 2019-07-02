import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {FormControl} from "@angular/forms";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {CookieUtilService} from "../services/cookie-util.service";
import {DialogsService} from "./popup/dialogs.service";
import {AngularEditorComponent, AngularEditorConfig} from "@kolkov/angular-editor";

@Component({
    selector: 'context-help-popup',
    template: `
        <h6 mat-dialog-title>{{this.popupTitle}}</h6>
        <mat-dialog-content>
            <div class="editor-grid">
                <angular-editor #descEditorRef id="descEditor" [formControl]="descriptionControl" [config]="this.editorConfig">
                </angular-editor>
            </div>
            <div *ngIf="this.isEditMode">
                <mat-form-field class="full-width">
                    <textarea matInput placeholder="Tooltip" [formControl]="this.tooltipControl"
                              matTextareaAutosize matAutosizeMinRows="3" matAutosizeMaxRows="3"></textarea>
                </mat-form-field>
            </div>
        </mat-dialog-content>
        <mat-dialog-actions>
            <button *ngIf="this.isEditMode" color="primary" mat-button (click)="this.save()">Save</button>
            <button mat-button mat-dialog-close>Close</button>
        </mat-dialog-actions>
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

export class ContextHelpPopupComponent implements OnInit {

    private readonly NO_HELP_TEXT: string = "No help available";
    public popupTitle: string = "";
    private dictionary: any;
    public isEditMode: boolean = false;
    public editorConfig: AngularEditorConfig;
    public descriptionControl:FormControl;

    @ViewChild("descEditorRef") descEditor: AngularEditorComponent;
    private tooltipControl: FormControl;


    constructor(@Inject(MAT_DIALOG_DATA) private data: any,
                private httpClient: HttpClient,
                private cookieUtilService: CookieUtilService,
                private dialogsService: DialogsService,
                private dialogRef: MatDialogRef<ContextHelpPopupComponent>) {
    }

    ngOnInit() {
        this.popupTitle = this.data.popupTitle;
        this.dictionary = this.data.dictionary;
        this.isEditMode = this.data.isEditMode;

        this.editorConfig = {
            spellcheck: true,
            height: "15em",
            enableToolbar: true,
        };

        this.descriptionControl = new FormControl(this.dictionary && this.dictionary.helpText ? this.dictionary.helpText : this.NO_HELP_TEXT);
        this.tooltipControl = new FormControl(this.dictionary && this.dictionary.toolTipText ? this.dictionary.toolTipText : '');

        if (this.isEditMode) {
            //this.toolbarSettings = this.DEFAULT_TOOLBAR_SETTINGS;
            this.descEditor.editorToolbar.showToolbar = this.isEditMode;
            this.descriptionControl.enable();

        } else {
            this.descEditor.editorToolbar.showToolbar = this.isEditMode;
            this.descriptionControl.disable();
            this.tooltipControl.disable();
        }
    }


    public save(): void {

        if (this.dictionary) {
            this.cookieUtilService.formatXSRFCookie();
            let params: HttpParams = new HttpParams()
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
                    this.dialogRef.close(true);
                } else {
                    let message: string = "";
                    if (result && result.message) {
                        message = ": " + result.message;
                    }
                    this.dialogsService.confirm("An error occurred while saving the context help" + message, null);
                }
            });
        }
    }

}
