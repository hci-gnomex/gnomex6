import {Component, Inject, OnDestroy, OnInit, ViewChild} from "@angular/core";

import {EmailRelatedUsersService} from "./email-related-users.service";
import {Subscription} from "rxjs";
import {DialogsService, DialogType} from "../popup/dialogs.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {BaseGenericContainerDialog} from "../popup/base-generic-container-dialog";
import {GDAction} from "../interfaces/generic-dialog-action.model";
import {AngularEditorComponent, AngularEditorConfig} from "@kolkov/angular-editor";

@Component({
	selector: "emailRelatedUsersPopup",
	template: `
        <div class="full-height full-width padded">
            <mat-form-field class="full-width">
                <input matInput
                       class="full-width"
                       [(ngModel)]="subject"
                       placeholder="Subject"/>
            </mat-form-field>
			<label class="label" for="emailEditor">Email Body:</label>
			<angular-editor #emailEditorRef class="full-width" [(ngModel)]="body"
							[config]="editorConfig" id="emailEditor">
			</angular-editor>
        </div>
	`,
	styles: [`
        :host /deep/ angular-editor#emailEditor #editor {
            resize: none;
        }

        :host /deep/ angular-editor#emailEditor .angular-editor-button[title="Insert Image"],
        :host /deep/ angular-editor#emailEditor .angular-editor-button[title="Unlink"],
        :host /deep/ angular-editor#emailEditor .angular-editor-button[title="Horizontal Line"],
        :host /deep/ angular-editor#emailEditor #strikeThrough-emailEditor,
        :host /deep/ angular-editor#emailEditor #subscript-emailEditor,
        :host /deep/ angular-editor#emailEditor #superscript-emailEditor,
        :host /deep/ angular-editor#emailEditor #link-emailEditor,
        :host /deep/ angular-editor#emailEditor #underline-emailEditor,
        :host /deep/ angular-editor#emailEditor #justifyLeft-emailEditor,
        :host /deep/ angular-editor#emailEditor #justifyCenter-emailEditor,
        :host /deep/ angular-editor#emailEditor #justifyRight-emailEditor,
        :host /deep/ angular-editor#emailEditor #justifyFull-emailEditor,
        :host /deep/ angular-editor#emailEditor #foregroundColorPicker-emailEditor,
        :host /deep/ angular-editor#emailEditor #backgroundColorPicker-emailEditor,
        :host /deep/ angular-editor#emailEditor #toggleEditorMode-emailEditor,
        :host /deep/ angular-editor#emailEditor #customClassSelector-emailEditor {
            display: none;
        }
	`]
})
export class EmailRelatedUsersPopupComponent extends BaseGenericContainerDialog implements OnInit, OnDestroy {

	@ViewChild("emailEditorRef") emailEditor: AngularEditorComponent;
	public primaryDisable: (action?: GDAction) => boolean;
	protected subject: string = "";
	protected body: string = "";

    editorConfig: AngularEditorConfig = {
        height: "15em",
        minHeight: "5em",
        maxHeight: "15em",
        width: "100%",
        minWidth: "5em",
        editable: true,
        defaultFontName: "Arial",
        defaultFontSize: "2",
	};

	private idRequests: number[] = null;

	private emailRelatedUsersSubscription: Subscription;

	constructor(private dialogService: DialogsService,
				private emailRelatedUsersService: EmailRelatedUsersService,
				private dialogRef: MatDialogRef<EmailRelatedUsersPopupComponent>,
				@Inject(MAT_DIALOG_DATA) public data: any) {
		super();
	}

	ngOnInit(): void {
		this.emailRelatedUsersSubscription = this.emailRelatedUsersService.getEmailSentSubscription().subscribe((response) => {
			this.onEmailServiceResponse(response);
		});

		if (this.data && this.data.idRequests && Array.isArray(this.data.idRequests)) {
            this.idRequests = this.data.idRequests;
		} else {
			setTimeout(() => {
				this.dialogRef.close();
			});
		}

		this.primaryDisable = () => {
			return !(this.subject && this.body);
		};
	}

	ngOnDestroy(): void {
		this.emailRelatedUsersSubscription.unsubscribe();
	}

	sendEmailButtonClicked(): void {
		this.emailRelatedUsersService.sendEmailToRequestRelatedUsers(this.idRequests, this.subject, this.body);
	}

	private onEmailServiceResponse(response: boolean) {
		if(response) {
			this.dialogService.alert("Email sent!", null, DialogType.SUCCESS).subscribe(() => {
                this.dialogRef.close();
			});
		} else {
            this.dialogService.error("There was a problem sending the email.");
		}
	}

}
