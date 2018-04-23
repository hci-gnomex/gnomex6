/*
 * Copyright (c) 2016 Huntsman Cancer Institute at the University of Utah, Confidential and Proprietary
 */
import {Component, OnInit} from "@angular/core";


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
export class AboutComponent implements OnInit {

    constructor() {
    }

    ngOnInit() {
    }

}
