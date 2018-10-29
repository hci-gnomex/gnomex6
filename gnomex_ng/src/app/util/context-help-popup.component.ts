import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {jqxEditorComponent} from "../../assets/jqwidgets-ts/angular_jqxeditor";
import {FormControl} from "@angular/forms";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {CookieUtilService} from "../services/cookie-util.service";
import {DialogsService} from "./popup/dialogs.service";

@Component({
    selector: 'context-help-popup',
    template: `
        <h6 mat-dialog-title>{{this.popupTitle}}</h6>
        <mat-dialog-content>
            <div class="editor-grid">
                <jqxEditor #editorReference
                           width="100%"
                           [height]="230"
                           [editable]="this.isEditMode"
                           [tools]="this.toolbarSettings"
                           [toolbarPosition]="'top'">
                </jqxEditor>
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
        div.editor-grid {
            width: 450px;
            height: 250px;
        }
    `]
})

export class ContextHelpPopupComponent implements OnInit, AfterViewInit {

    private readonly NO_HELP_TEXT: string = "No help available";
    private readonly DEFAULT_TOOLBAR_SETTINGS: string = "bold italic underline | format font size | color background | left center right | outdent indent | ul ol | link | clean";

    public popupTitle: string = "";
    private dictionary: any;
    public isEditMode: boolean = false;

    public toolbarSettings: string = "";
    private descriptionControl: FormControl;
    private tooltipControl: FormControl;

    @ViewChild('editorReference') private editorRef: jqxEditorComponent;

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

        this.descriptionControl = new FormControl(this.dictionary && this.dictionary.helpText ? this.dictionary.helpText : this.NO_HELP_TEXT);
        this.tooltipControl = new FormControl(this.dictionary && this.dictionary.toolTipText ? this.dictionary.toolTipText : '');

        if (this.isEditMode) {
            this.toolbarSettings = this.DEFAULT_TOOLBAR_SETTINGS;
        } else {
            this.descriptionControl.disable();
            this.tooltipControl.disable();
        }
    }

    ngAfterViewInit() {
        this.editorRef.val(this.descriptionControl.value);
    }

    public save(): void {
        this.descriptionControl.setValue(this.editorRef.val() ? this.editorRef.val() : '');

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
