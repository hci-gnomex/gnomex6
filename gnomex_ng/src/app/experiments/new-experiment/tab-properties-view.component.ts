import {Component, OnInit} from "@angular/core";
import {DictionaryService} from "../../services/dictionary.service";
import {NewExperimentService} from "../../services/new-experiment.service";
import {OrderType} from "../../util/annotation-tab.component";

@Component({
    selector: "tabPropertiesView",
    templateUrl: "./tab-properties-view.html",
    styles: [`
    `]
})

export class TabPropertiesViewComponent implements OnInit {
    private _state: string;

    constructor(private dictionaryService: DictionaryService,
                private newExperimentService: NewExperimentService) {

    }

    ngOnInit() {

    }

    setState(state: string) {
        this._state = state;
    }

}