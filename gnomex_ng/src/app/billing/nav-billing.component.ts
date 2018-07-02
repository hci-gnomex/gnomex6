import {Component, OnInit} from "@angular/core";
import {BillingFilterEvent} from "./billing-filter.component";

@Component({
    selector: 'nav-billing',
    templateUrl: "./nav-billing.component.html",
    styles: [`
    `]
})

export class NavBillingComponent implements OnInit {

    constructor() {
    }

    ngOnInit() {
    }

    public onFilterChange(event: BillingFilterEvent): void {
        // TODO
    }

}
