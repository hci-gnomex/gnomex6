import {AfterViewInit, Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {GnomexService} from "../../services/gnomex.service";
import {ManageLinksComponent} from "./manage-links.component";
import {DialogsService} from "../../util/popup/dialogs.service";
import {MatDialogConfig} from "@angular/material";
import {ActionType} from "../../util/interfaces/generic-dialog-action.model";
import {ConstantsService} from "../../services/constants.service";

@Component({
    selector: 'report-problem-launcher',
    template: ``,
})

export class ManageLinksLauncherComponent implements OnInit, AfterViewInit {

    constructor(private dialogsService: DialogsService,
                private router: Router,
                private gnomexService: GnomexService,
                private constService: ConstantsService) {
    }

    ngOnInit() {
            setTimeout(() => {
                let config: MatDialogConfig = new MatDialogConfig();
                config.autoFocus = false;
                config.width = "60em";
                config.height = "35em";
                this.dialogsService.genericDialogContainer(ManageLinksComponent, "Manage Quick Links", this.constService.ICON_FLAG_YELLOW, config,
                    {actions: [
                            {type: ActionType.PRIMARY, icon: this.constService.ICON_SAVE, name: "Save", internalAction: "save"},
                            {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                        ]}).subscribe((result: any) => {
                            if(result) {
                                this.gnomexService.emitFaqUpdateObservable();
                            }
                            this.router.navigate([{outlets: {modal: null}}]);
                });
        });

    }

    ngAfterViewInit() {

    }

    ngOnDestroy(): void {
    }
}
