import {Component, OnInit} from "@angular/core";
import {MatDialog, MatDialogRef} from "@angular/material";
import {AboutComponent} from "./about.component";
import {Router} from "@angular/router";

@Component({
    selector: 'about-window-launcher',
    template: `<h6></h6>`,
})

export class AboutWindowLauncher implements OnInit {
    aboutDialogRef: MatDialogRef<AboutComponent>;

    constructor(private dialog: MatDialog, private router: Router) {
    }

    ngOnInit() {
        setTimeout(() => {
            this.aboutDialogRef = this.dialog.open(AboutComponent);
        });

        setTimeout(() =>
            this.aboutDialogRef.afterClosed()
                .subscribe(() => {
                    this.router.navigate([{ outlets: { modal: null }}]);
                })
        );
    }

}
