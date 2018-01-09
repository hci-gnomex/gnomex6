import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";

import {jqxButtonComponent} 	from "../../../assets/jqwidgets-ts/angular_jqxbuttons";
import {jqxInputComponent} 		from "../../../assets/jqwidgets-ts/angular_jqxinput";
import {jqxTextAreaComponent} from "../../../assets/jqwidgets-ts/angular_jqxtextarea";
import {jqxWindowComponent} 	from "../../../assets/jqwidgets-ts/angular_jqxwindow";

import {EmailRelatedUsersService} from "./email-related-users.service";
import {Subscription} from "rxjs/Subscription";

@Component({
	selector: "emailRelatedUsersPopup",
	templateUrl: "email-related-users-popup.component.html",
	styles: [`
			img {
          margin-right:0.2em;
			}
			
			.block {
					display: block;
			}
			
			.popup-body {
          background-color: #eeeeeb;
			}
			
			.t {
					display: table;
			}
			
			.tr {
					display: table-row;
			}
			
			.td {
					display: table-cell;
			
			}
			
			.full-width {
					width: 100%;
			}
			
			.full-height {
					height: 100%;
			}

      .button-container {
          padding: 0.2em 0 0.2em 0.6em;
			}
			
			.align-center-center {
					text-align: center;
					vertical-align: middle;
			}
	`]
})
export class EmailRelatedUsersPopupComponent implements OnInit, OnDestroy {

	@ViewChild("subjectInput") 		subject:jqxInputComponent;
	@ViewChild("bodyTextArea") 		body:jqxTextAreaComponent;

	@ViewChild("windowReference") 				window:jqxWindowComponent;
	@ViewChild("emailSentSuccessWindow") 	emailSentSuccessWindow:jqxWindowComponent;
	@ViewChild("emailSentFailureWindow") 	emailSentFailureWindow:jqxWindowComponent;

	@ViewChild("sendEmailButton") 			sendEmailButton:jqxButtonComponent;
	@ViewChild("cancelSendEmailButton") cancelSendEmailButton:jqxButtonComponent;

	private disableSendEmailButton = false;

	private idRequests: number[] = null;

	private emailRelatedUsersSubscription:Subscription;

	constructor(private emailRelatedUsersService:EmailRelatedUsersService) { }

	ngOnInit(): void {
		this.emailRelatedUsersSubscription = this.emailRelatedUsersService.getEmailSentSubscription().subscribe((response) => {
			this.onEmailServiceResponse(response);
		});
	}

	ngOnDestroy(): void {
		this.emailRelatedUsersSubscription.unsubscribe();
	}

	public setIdRequests(idRequests: number[]) {
		this.idRequests = idRequests;
	}

	public getIdRequests(): number[] {
		return this.idRequests;
	}

	sendEmailButtonClicked(): void {
		// console.log("sendEmailButton clicked!");
		// console.log("Current values :");
		// console.log("  Subject    : " + this.subject.val());
		// console.log("  Body       : " + this.body.val());
		// console.log("  idRequests : " + this.idRequests);

		this.emailRelatedUsersService.sendEmailToRequestRelatedUsers(this.idRequests, this.subject.val(), this.body.val());
	}

	cancelButtonClicked(): void {
		this.window.close();
	}

	onSuccessWindowOkClicked(): void {
		this.emailSentSuccessWindow.close();
		this.window.close();
		this.resetWindow();
	}

	onFailureWindowOkClicked(): void {
		this.emailSentFailureWindow.close();
		this.resetWindow();
	}

	private onEmailServiceResponse(response:boolean) {
		console.log(response);

		if(response) {
			this.disableWindow();
			this.emailSentSuccessWindow.open();
			this.emailSentSuccessWindow.bringToFront()
		} else {
			this.disableWindow();
			this.emailSentFailureWindow.open();
			this.emailSentFailureWindow.bringToFront();
		}
	}

	resetWindow(): void {
		this.window.enable();
		this.subject.val("");
		this.body.val("");
		this.enableWindow();
	}

	enableWindow(): void {
		this.window.enable();
		this.subject.disabled(false);
		this.body.disabled(false);
		this.sendEmailButton.disabled(false);
		this.cancelSendEmailButton.disabled(false);
	}

	disableWindow(): void {
		this.window.disable();
		this.subject.disabled(true);
		this.body.disabled(true);
		this.sendEmailButton.disabled(true);
		this.cancelSendEmailButton.disabled(true);
	}

	private emailIsInvalid(): boolean {
		if(this.subject.val() != "" && this.body.val() != "") {
			return false;
		} else {
			return true;
		}
	}
}