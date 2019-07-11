import {AfterViewInit, Component, OnInit} from "@angular/core";
import {MatDialogConfig} from "@angular/material";
import {Router} from "@angular/router";
import {EmailAllUsersComponent} from "./email-all-users.component";
import {DialogsService} from "../util/popup/dialogs.service";
import {ConstantsService} from "../services/constants.service";
import {ActionType} from "../util/interfaces/generic-dialog-action.model";

@Component({
    selector: 'email-all-users-launcher',
    template: `<h6></h6>`,
})


export class EmailAllUsersLauncherComponent implements OnInit, AfterViewInit {

    constructor(private dialogsService: DialogsService,
                private router: Router,
                private constService: ConstantsService) {
    }

    ngOnInit() {
        setTimeout(() => {
            let config: MatDialogConfig = new MatDialogConfig();
            config.width = "45em";
            config.height = "41em";
            config.autoFocus = false;
            this.dialogsService.genericDialogContainer(EmailAllUsersComponent, "Send Email To All GNomEx Users",
                this.constService.EMAIL_GO_LINK, config, {actions: [
                        {type: ActionType.PRIMARY, icon: this.constService.EMAIL_GO_LINK, name: "Send Email", internalAction: "send"},
                        {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                    ]}).subscribe(() => {
                this.router.navigate([{ outlets: { modal: null }}]);
            });
        });
    }

    ngAfterViewInit() {
    }

}
