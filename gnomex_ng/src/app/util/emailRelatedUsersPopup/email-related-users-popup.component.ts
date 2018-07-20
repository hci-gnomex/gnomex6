import {Component, Inject, OnDestroy, OnInit} from "@angular/core";

import {EmailRelatedUsersService} from "./email-related-users.service";
import {Subscription} from "rxjs/Subscription";
import {DialogsService} from "../popup/dialogs.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";

@Component({
	selector: "emailRelatedUsersPopup",
	templateUrl: "email-related-users-popup.component.html",
	styles: [`
		
		img { margin-right:0.2em; }

        .popup-body { 
			background-color: #eeeeeb;
			height: 15em;
		}
		
		.no-padding { padding: 0; }
		.no-margin  { margin:  0; }

        .block { display: block; }
			
		.t  { display: table;      }
		.tr { display: table-row;  }
		.td { display: table-cell; }
			
		.full-width  { width: 100%;  }
		.full-height { height: 100%; }
		
		.button-container { padding: 0.2em 0 0.2em 0.6em; }
			
		.align-center-center {
			text-align: center;
			vertical-align: middle;
		}
		.right-align { text-align: right; }
		
		.plain-background { background-color: white; }

		.bordered { border: 1px solid #b7babc; }
		
		.top-bottom-padded   { padding:0.4rem 0; }
        
		.padded { padding:0.4rem; }
		
		.header {
            background-color: #88b47c; 
			color: #ffffff;
			padding: 0.4rem 0.8rem;
		}
		
	`]
})
export class EmailRelatedUsersPopupComponent implements OnInit, OnDestroy {

	protected subject: string = '';
	protected body: string = '';

	private disableSendEmailButton = false;

	private idRequests: number[] = null;

	private emailRelatedUsersSubscription:Subscription;

	constructor(private dialogService: DialogsService,
				private emailRelatedUsersService:EmailRelatedUsersService,
				private dialogRef: MatDialogRef<EmailRelatedUsersPopupComponent>,
				@Inject(MAT_DIALOG_DATA) public data: any) { }

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
	}

	ngOnDestroy(): void {
		this.emailRelatedUsersSubscription.unsubscribe();
	}

	sendEmailButtonClicked(): void {
		this.emailRelatedUsersService.sendEmailToRequestRelatedUsers(this.idRequests, this.subject, this.body);
	}

	cancelButtonClicked(): void {
		this.dialogRef.close();
	}

	private onEmailServiceResponse(response:boolean) {
		if(response) {
			this.dialogService.alert('Email sent!').subscribe(() => {
                this.dialogRef.close();
			});
		} else {
            this.dialogService.alert('Error : There was a problem sending the email.');
		}
	}

	protected emailIsInvalid(): boolean {
        if(this.subject
			&& this.subject !== ""
			&& this.body
			&& this.body !== "") {
            return false;
        } else {
            return true;
        }
	}
}