import {AfterViewInit, Component, OnInit} from "@angular/core";
import {MatDialog, MatDialogRef} from "@angular/material";
import {Router} from "@angular/router";
import {EmailAllUsersComponent} from "./email-all-users.component";

@Component({
    selector: 'email-all-users-launcher',
    template: `<h6></h6>`,
})


export class EmailAllUsersLauncherComponent implements OnInit, AfterViewInit {
    emailAllUsersDialogRef: MatDialogRef<EmailAllUsersComponent>;

    constructor(private dialog: MatDialog, private router: Router) {
    }

    ngOnInit() {
        setTimeout(() => this.emailAllUsersDialogRef = this.dialog.open(EmailAllUsersComponent, {
            height: '700px',
            width: '800px',
        }));

        setTimeout(() =>
            this.emailAllUsersDialogRef.afterClosed()
                .subscribe(() => {
                    this.router.navigate([{ outlets: { modal: null }}]);
                })
        );
    }

    ngAfterViewInit() {
    }

}
