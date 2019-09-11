import {AfterViewInit, Component, OnDestroy, OnInit} from "@angular/core";
import {MatDialogConfig} from "@angular/material";
import {Router} from "@angular/router";
import {ReportProblemComponent} from "./report-problem.component";
import {GnomexService} from "../../services/gnomex.service";
import * as html2canvas from 'html2canvas';
import {DialogsService} from "../../util/popup/dialogs.service";
import {ActionType} from "../../util/interfaces/generic-dialog-action.model";
import {ConstantsService} from "../../services/constants.service";

@Component({
    selector: 'report-problem-launcher',
    template: ``,
})

export class CreateReportProblemLauncherComponent implements OnInit, OnDestroy {
    private smallImgData: any;
    private bigImgData: any;

    constructor(private dialogsService: DialogsService,
                private router: Router,
                private gnomexService: GnomexService,
                private constService: ConstantsService) {
        let elems = document.body.querySelectorAll("tree-viewport");
        let myElement = <HTMLElement[]><any>document.querySelectorAll('tree-viewport');

        for (let i = 0; i < myElement.length; ++i) {
            myElement[i].style.overflow = "hidden";
        }
    }

    ngOnInit() {
        html2canvas(document.body).then( canvas => {
            let littleCanvas = document.createElement("canvas");
            let bigCanvas = document.createElement("canvas");

            littleCanvas.width = 500;
            littleCanvas.height = 300;
            bigCanvas.width = 2400;
            bigCanvas.height = 1500;
            bigCanvas.style.width = "1200px";
            bigCanvas.style.height = "750px";
            let context = littleCanvas.getContext('2d');
            let context2 = bigCanvas.getContext('2d');
            context.drawImage(canvas,0,0,canvas.width, canvas.height,0,0,500,300);
            context2.drawImage(canvas,0,0,canvas.width, canvas.height,0,0,2400,1500);
            context2.scale(2,2);
            this.smallImgData = littleCanvas.toDataURL("image/png");
            this.bigImgData = bigCanvas.toDataURL("image/png");

            setTimeout(() => {
                let config: MatDialogConfig = new MatDialogConfig();
                config.width = "45em";
                config.data = {
                    labList: this.gnomexService.submitRequestLabList,
                    items: [],
                    selectedLabItem: "",
                    smallImgData: this.smallImgData,
                    bigImgData: this.bigImgData,
                };
                this.dialogsService.genericDialogContainer(ReportProblemComponent, "Send Email to GNomEx Team", this.constService.EMAIL_GO_LINK, config,
                    {actions: [
                            {type: ActionType.PRIMARY, icon: this.constService.EMAIL_GO_LINK, name: "Send Email", internalAction: "send"},
                            {type: ActionType.SECONDARY, name: "Cancel", internalAction: "onClose"}
                        ]}).subscribe((result: any) => {
                            this.router.navigate([{outlets: {modal: null}}]);
                    });
            });
        });
    }

    ngOnDestroy(): void {
        let elems = document.body.querySelectorAll("tree-viewport");
        let myElement = <HTMLElement[]><any>document.querySelectorAll('tree-viewport');

        for (let i = 0; i < myElement.length; ++i) {
            myElement[i].style.overflow = "auto";
        }
    }
}
