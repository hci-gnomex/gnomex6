import {Component, OnInit} from "@angular/core";
import {DictionaryService} from "../../services/dictionary.service";
import {NewExperimentService} from "../../services/new-experiment.service";
import {AnnotationTabComponent, OrderType} from "../../util/annotation-tab.component";
import {MatDialog} from "@angular/material";
import {BrowseOrderValidateService} from "../../services/browse-order-validate.service";

@Component({
    selector: "tabPropertiesView",
    templateUrl: "./tab-properties-view.html",
    styles: [`
    `]
})

export class TabPropertiesViewComponent extends AnnotationTabComponent implements OnInit {

    constructor(private dictionaryService: DictionaryService,
                private newExperimentService: NewExperimentService,
                dialog: MatDialog, orderValidateService: BrowseOrderValidateService
    ) {
        super(dialog, orderValidateService);
    }

    ngOnInit() {
    }


}