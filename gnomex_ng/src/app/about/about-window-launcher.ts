import {Component, OnInit} from "@angular/core";
import {AboutComponent} from "./about.component";
import {Router} from "@angular/router";
import {DialogsService} from "../util/popup/dialogs.service";
import {ActionType} from "../util/interfaces/generic-dialog-action.model";

@Component({
    selector: 'about-window-launcher',
    template: `<h6></h6>`,
})

export class AboutWindowLauncher implements OnInit {

    constructor(private dialogsService: DialogsService, private router: Router) {
    }

    ngOnInit() {

        setTimeout(() => {
            this.dialogsService.genericDialogContainer(AboutComponent, " About", null, null,
                {actions: [
                        {type: ActionType.SECONDARY, name: "Close", internalAction: "onClose"}
                    ]}).subscribe(() => {
                this.router.navigate([{ outlets: { modal: null }}]);
            });
        });
    }

}
