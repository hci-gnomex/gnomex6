import {Component, Input, OnInit} from "@angular/core";
import {DictionaryService} from "../services/dictionary.service";
import {MatDialog, MatDialogConfig, MatDialogRef, TooltipPosition} from "@angular/material";
import {ContextHelpPopupComponent} from "./context-help-popup.component";

@Component({
    selector: 'context-help',
    template: `
        <button mat-button [matTooltip]="this.tooltip" [matTooltipPosition]="this.tooltipPosition" (click)="this.showPopup()"><img src="../../assets/information.png" class="icon">{{this.label}}</button>
    `,
    styles: [`
        * {
            max-width: 80em;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    `]
})
export class ContextHelpComponent implements OnInit {

    @Input() public name: string = "";
    @Input() public idCoreFacility: string = "";
    @Input() public codeRequestCategory: string = "";

    @Input() public isEditMode: boolean = false;
    @Input() public label: string = "";
    @Input() public popupTitle: string = "";
    @Input() public tooltipPosition: TooltipPosition = 'below';

    private dictionary: any;
    public tooltip: string = "";

    constructor(private dictionaryService: DictionaryService,
                private dialog: MatDialog) {
    }

    ngOnInit() {
        this.loadDictionary();
    }

    private loadDictionary(): void {
        let entries: any[] = this.dictionaryService.getEntries(DictionaryService.CONTEXT_SENSITIVE_HELP).filter((dict: any) => {
            return dict.value && dict.context1 === this.name && dict.context2 === this.idCoreFacility && dict.context3 === this.codeRequestCategory;
        });
        if (entries.length === 1) {
            this.dictionary = entries[0];
            this.tooltip = this.dictionary.toolTipText;
        }
    }

    public showPopup(): void {
        let config: MatDialogConfig = new MatDialogConfig();
        config.data = {
            popupTitle: this.popupTitle,
            dictionary: this.dictionary,
            isEditMode: this.isEditMode
        };
        let dialogRef: MatDialogRef<ContextHelpPopupComponent> = this.dialog.open(ContextHelpPopupComponent, config);
        dialogRef.afterClosed().subscribe((result: any) => {
            if (result) {
                // TODO reload dictionary
            }
        });
    }

}
