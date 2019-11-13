import {Component} from "@angular/core";
import {BrowseFilterBasicComponent} from "../util/browse-filter-basic.component";

@Component({
    selector: "browse-analysis-filter",
    templateUrl: "browse-analysis-filter.component.html",
    styles: [`

        .min-width-header {
            min-width: 11em;
        }
        
        

        .children-spaced > *:not(:last-child) {
            margin-right: 1em;
        }

        label.following-label {
            margin-left: 0.3em;
        }

        .collapse-expand-button {
            background: none;
            border: none;
            cursor: pointer;
        }

        .collapse-expand-icon {
            height: 1.5em;
        }
        
    `]
})
export class BrowseFilterAnalysisComponent extends BrowseFilterBasicComponent {

}