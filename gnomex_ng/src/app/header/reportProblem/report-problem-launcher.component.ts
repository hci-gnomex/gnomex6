import {AfterViewInit, Component, OnInit} from "@angular/core";
import {MatDialog, MatDialogRef} from "@angular/material";
import {Router} from "@angular/router";
import {ReportProblemComponent} from "./report-problem.component";
import {GnomexService} from "../../services/gnomex.service";
import * as html2canvas from 'html2canvas';

@Component({
    selector: 'report-problem-launcher',
    template: ``,
})

export class CreateReportProblemLauncherComponent implements OnInit, AfterViewInit {
    reportProblemDialogRef: MatDialogRef<ReportProblemComponent>;
    private smallImgData: any;
    private bigImgData: any;

    constructor(private dialog: MatDialog, private router: Router,
                private gnomexService: GnomexService,
    ) {
        var elems = document.body.querySelectorAll("tree-viewport");
        let myElement = <HTMLElement[]><any>document.querySelectorAll('tree-viewport');

        var i;
        for (i = 0; i < myElement.length; ++i) {
            myElement[i].style.overflow = "hidden";
        }
    }

    /**
     *
     */
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
            context2.scale(2,2)
            this.smallImgData = littleCanvas.toDataURL("image/png");
            this.bigImgData = bigCanvas.toDataURL("image/png");

            setTimeout(() => {
                this.reportProblemDialogRef = this.dialog.open(ReportProblemComponent, {

                    data: {
                        labList: this.gnomexService.submitRequestLabList,
                        items: [],
                        selectedLabItem: '',
                        smallImgData: this.smallImgData,
                        bigImgData: this.bigImgData,
                    }
                })
                this.reportProblemDialogRef.afterClosed()
                    .subscribe(result => {
                        console.log("after close");
                        this.router.navigate([{outlets: {modal: null}}]);
                    })


            });
        });
    }

    ngAfterViewInit() {

    }

    ngOnDestroy(): void {
        var elems = document.body.querySelectorAll("tree-viewport");
        let myElement = <HTMLElement[]><any>document.querySelectorAll('tree-viewport');

        var i;
        for (i = 0; i < myElement.length; ++i) {
            myElement[i].style.overflow = "auto";
        }
    }
}
