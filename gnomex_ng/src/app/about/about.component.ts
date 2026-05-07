import {Component, OnInit} from "@angular/core";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";


@Component({
    selector: 'about',
    templateUrl: "./about.component.html",
    styleUrls: ['./about.component.scss']
})
export class AboutComponent extends BaseGenericContainerDialog implements OnInit {

    constructor() {
        super();
    }

    ngOnInit() {
    }

}
