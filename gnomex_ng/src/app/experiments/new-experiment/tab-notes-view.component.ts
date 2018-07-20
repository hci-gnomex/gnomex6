import {Component, OnInit} from "@angular/core";

@Component({
    selector: "tabNotesView",
    templateUrl: "./tab-notes-view.html",
    styles: [`
    `]
})

export class TabNotesViewComponent implements OnInit {
    private _state;
    public label: string = "World";

    constructor() {
        this.label = "world";

    }

    ngOnInit() {
    }

    setState(state: string) {
        this._state = state;
    }
}