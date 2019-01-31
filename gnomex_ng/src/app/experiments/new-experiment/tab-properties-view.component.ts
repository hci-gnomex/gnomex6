import {Component, OnInit} from "@angular/core";
import {AnnotationTabComponent} from "../../util/annotation-tab.component";
import {MatDialog} from "@angular/material";
import {BrowseOrderValidateService} from "../../services/browse-order-validate.service";

@Component({
    selector: "tabPropertiesView",
    templateUrl: "./tab-properties-view.component.html",
    styles: [`
    `]
})

export class TabPropertiesViewComponent extends AnnotationTabComponent implements OnInit {

    constructor(dialog: MatDialog, orderValidateService: BrowseOrderValidateService
    ) {
        super(dialog, orderValidateService);
    }

    ngOnInit() {
    }
}