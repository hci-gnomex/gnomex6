import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {ContactUsComponent} from "./contact-us.component";
import {DialogsService} from "../util/popup/dialogs.service";
import {ActionType} from "../util/interfaces/generic-dialog-action.model";

@Component({
    selector: 'contact-us-window-launcher',
    template: `<h6></h6>`,
})

export class ContactUsWindowLauncher implements OnInit {

    constructor(private dialogsService: DialogsService, private router: Router) {
    }

    ngOnInit() {

        this.dialogsService.genericDialogContainer(ContactUsComponent, "Contact Us", null, null,
            {actions: [
                    {type: ActionType.SECONDARY, name: "Close", internalAction: "onClose"}
                ]}).subscribe(() => {
                    this.router.navigate([{ outlets: { modal: null }}]);
        });
    }

}
