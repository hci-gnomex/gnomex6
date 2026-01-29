import {Component, OnInit} from "@angular/core";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";


@Component({
    selector: 'about',
    templateUrl: "./about.component.html",
    styles: [`
        div.flex-container-row {
            display: flex;
            flex-direction: row;
        }
        .justify-center {
            justify-content: center;
        }
        .justify-space-evenly {
            justify-content: space-evenly;
        }
    `]
})
export class AboutComponent extends BaseGenericContainerDialog implements OnInit {

    constructor() {
        super();
    }

    ngOnInit() {
    }

}
