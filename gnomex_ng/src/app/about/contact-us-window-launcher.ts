import {Component, OnInit} from "@angular/core";
import {MatDialog, MatDialogRef} from "@angular/material";
import {Router} from "@angular/router";
import {ContactUsComponent} from "./contact-us.component";

@Component({
    selector: 'contact-us-window-launcher',
    template: `<h6></h6>`,
})

export class ContactUsWindowLauncher implements OnInit {
    aboutDialogRef: MatDialogRef<ContactUsComponent>;

    constructor(private dialog: MatDialog, private router: Router) {
    }

    ngOnInit() {
        setTimeout(() => {
            this.aboutDialogRef = this.dialog.open(ContactUsComponent);
        });

        setTimeout(() =>
            this.aboutDialogRef.afterClosed()
                .subscribe(() => {
                    this.router.navigate([{ outlets: { modal: null }}]);
                })
        );
    }

}
