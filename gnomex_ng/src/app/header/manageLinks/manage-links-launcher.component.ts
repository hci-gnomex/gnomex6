import {AfterViewInit, Component, OnInit} from "@angular/core";
import {MatDialog, MatDialogRef} from "@angular/material";
import {Router} from "@angular/router";
import {GnomexService} from "../../services/gnomex.service";
import {ManageLinksComponent} from "./manage-links.component";
import {Subscription} from "rxjs/Subscription";

@Component({
    selector: 'report-problem-launcher',
    template: ``,
})

export class ManageLinksLauncherComponent implements OnInit, AfterViewInit {
    manageLinksDialogRef: MatDialogRef<ManageLinksComponent>;
    private rebuildFAQSubscription: Subscription;

    constructor(private dialog: MatDialog, private router: Router,
                private gnomexService: GnomexService,
    ) {
    }

    /**
     *
     */
    ngOnInit() {
            setTimeout(() => {
            this.manageLinksDialogRef = this.dialog.open(ManageLinksComponent, {
                height: '41em',
                width: '60em',

            })
            this.manageLinksDialogRef.afterClosed()
                .subscribe(result => {
                    if (this.manageLinksDialogRef.componentInstance.dirty) {
                        this.gnomexService.emitFaqUpdateObservable();
                    }
                    console.log("after close");
                    this.router.navigate([{outlets: {modal: null}}]);
                })


        });

    }

    ngAfterViewInit() {

    }

    ngOnDestroy(): void {
    }
}
