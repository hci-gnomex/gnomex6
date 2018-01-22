import {AfterViewInit, Component, OnInit} from "@angular/core";
import {MatDialog, MatDialogRef} from "@angular/material";
import {Router} from "@angular/router";
import {CreateProjectComponent} from "./create-project.component";
import {GnomexService} from "../services/gnomex.service";

@Component({
    selector: 'create-project-launcher',
    template: ``,
})


export class CreateProjectLauncherComponent implements OnInit, AfterViewInit {
    createProjectDialogRef: MatDialogRef<CreateProjectComponent>;

    constructor(private dialog: MatDialog, private router: Router,
                private gnomexService: GnomexService,
    ) {

    }

    /**
     *
     */
    ngOnInit() {

        setTimeout(() => this.createProjectDialogRef= this.dialog.open(CreateProjectComponent, {
            data: {
                labList: this.gnomexService.submitRequestLabList,
                items: [],
                selectedLabItem: ''
            }

            })

        );
        setTimeout(() =>
            this.createProjectDialogRef.afterClosed()
            .subscribe(result => {
                console.log("after close");
                this.router.navigate([{ outlets: { modal: null }}]);
            })
        );
    }

    ngAfterViewInit() {

    }

}
