import {Component, Input, OnInit} from "@angular/core";
import {DictionaryService} from "../services/dictionary.service";
import {MatDialogConfig, TooltipPosition} from "@angular/material";
import {ContextHelpPopupComponent} from "./context-help-popup.component";
import {DialogsService} from "./popup/dialogs.service";

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
                private dialogsService: DialogsService) {
    }

    ngOnInit() {
        this.loadDictionary();
    }

    private loadDictionary(): void {
        let entries: any[] = this.dictionaryService.getEntries(DictionaryService.CONTEXT_SENSITIVE_HELP).filter((dict: any) => {
            return
                dict.value &&
                dict.context1 === this.name &&
                (!this.idCoreFacility || dict.context2 === this.idCoreFacility) &&
                (!this.codeRequestCategory || dict.context3 === this.codeRequestCategory);
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
        let icon: string = "";
        if(this.isEditMode) {
            icon = "<i class='fas fa-wrench fa-1x' style='color: var(--bluewarmvivid-medlight);'></i>";
        } else {
            icon = "<i class='fas fa-info-circle fa-1x' style='color: var(--bluewarmvivid-medlight);'></i>";
        }
        this.dialogsService.genericDialogContainer(ContextHelpPopupComponent, "", icon, config)
            .subscribe((result: any) => {
                if (result) {
                    this.dictionaryService.reloadAndRefresh(() => {
                        this.loadDictionary();
                    }, null, DictionaryService.CONTEXT_SENSITIVE_HELP);
                }
        });
    }

}
