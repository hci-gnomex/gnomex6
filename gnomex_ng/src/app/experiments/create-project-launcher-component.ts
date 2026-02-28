import {AfterViewInit, Component, OnInit} from "@angular/core";
import {MatDialog, MatDialogConfig} from "@angular/material";
import {Router} from "@angular/router";
import {CreateProjectComponent} from "./create-project.component";
import {GnomexService} from "../services/gnomex.service";
import {ActionType} from "../util/interfaces/generic-dialog-action.model";
import {DialogsService} from "../util/popup/dialogs.service";
import {ConstantsService} from "../services/constants.service";

@Component({
    selector: 'create-project-launcher',
    template: ``,
})


export class CreateProjectLauncherComponent implements OnInit, AfterViewInit {

    constructor(private dialog: MatDialog, private router: Router,
                private gnomexService: GnomexService,
                private dialogsService: DialogsService,
                private constantsService: ConstantsService) {
    }

    /**
     *
     */
    ngOnInit() {

        setTimeout(() => {
            let configuration: MatDialogConfig = new MatDialogConfig();
            configuration.width = "45em";
            configuration.autoFocus = false;
            configuration.data = {
                labList: this.gnomexService.submitRequestLabList,
                items: [],
                selectedLabItem: ""
            };

            this.dialogsService.genericDialogContainer(CreateProjectComponent, "New Project", this.constantsService.ICON_FOLDER_ADD, configuration,
                {actions: [
                        {type: ActionType.PRIMARY, icon: this.constantsService.ICON_SAVE, name: "Save", internalAction: "save"},
                        {type: ActionType.SECONDARY, name: "Cancel", internalAction: "cancel"}
                    ]}).subscribe((result: any) => {
                        this.router.navigate([{ outlets: { modal: null }}]);
            });
        });
    }

    ngAfterViewInit() {

    }

}
