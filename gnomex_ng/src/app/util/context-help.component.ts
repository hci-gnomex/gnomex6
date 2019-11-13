import {Component, Input, OnInit} from "@angular/core";
import {DictionaryService} from "../services/dictionary.service";
import {MatDialogConfig, TooltipPosition} from "@angular/material";
import {ContextHelpPopupComponent} from "./context-help-popup.component";
import {DialogsService} from "./popup/dialogs.service";

@Component({
    selector: "context-help",
    template: `
        <button mat-button 
                class="minimize"
                [matTooltip]="tooltip" 
                [matTooltipPosition]="tooltipPosition" 
                (click)="showPopup()">
            <img [src]="'./assets/information.png'" class="{{ !!label ? 'icon' : ''}}" alt="">
            {{ label }}
        </button>
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
    @Input() public tooltipPosition: TooltipPosition = "below";

    public tooltip: string = "";
    private dictionary: any;

    constructor(private dictionaryService: DictionaryService,
                private dialogsService: DialogsService) {
    }

    ngOnInit() {
        this.loadDictionary();
    }

    private loadDictionary(): void {
        let entries: any[] = this.dictionaryService.getEntries(DictionaryService.CONTEXT_SENSITIVE_HELP).filter((dict: any) => {
            return dict.value &&
                dict.context1 === this.name &&
                (!this.idCoreFacility || dict.context2 === this.idCoreFacility) &&
                (!this.codeRequestCategory || dict.context3 === this.codeRequestCategory);
        });
        if (entries.length === 1) {
            this.dictionary = entries[0];
            this.tooltip = this.dictionary.toolTipText;
        } else if(entries.length === 0) {
            this.dictionary = {};
            this.dictionary.context1 = this.name;
            this.dictionary.context2 = this.idCoreFacility ? this.idCoreFacility : "";
            this.dictionary.context3 = this.codeRequestCategory ? this.codeRequestCategory : "";
        } else if (entries.length > 1) {
        //    Not acceptable
            this.dialogsService.error("An error occurred while getting context help. Please contact GNomEx team.");
        }
    }

    public showPopup(): void {
        if(!this.dictionary) {
            this.dialogsService.error("An error occurred while getting context help. Please contact GNomEx team.");
            return;
        }
        let config: MatDialogConfig = new MatDialogConfig();
        config.minWidth = "30em";
        config.data = {
            popupTitle: this.popupTitle,
            dictionary: this.dictionary,
            isEditMode: this.isEditMode
        };
        let icon: string = "";
        if(this.isEditMode) {
            icon = "<i class='fa fa-wrench fa-1x' style='color: var(--bluewarmvivid-medlight);'></i>";
        } else {
            icon = "<i class='fa fa-info-circle fa-1x' style='color: var(--bluewarmvivid-medlight);'></i>";
        }
        this.dialogsService.genericDialogContainer(ContextHelpPopupComponent, "", icon, config)
            .subscribe((result: any) => {
                if (result) {
                    this.dialogsService.startDefaultSpinnerDialog();
                    this.dictionaryService.reloadAndRefresh(() => {
                        this.loadDictionary();
                        this.dialogsService.stopAllSpinnerDialogs();
                    }, null, DictionaryService.CONTEXT_SENSITIVE_HELP);
                }
        });
    }

}
