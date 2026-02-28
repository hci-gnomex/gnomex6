import {Component} from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";

@Component({
    template: `
		<div class="full-width full-height">
			<div class="t full-width full-height fix-table">
				<div class="tr">
					<div class="td cell-text-container ellipsis">
						{{display}}
					</div>
				</div>
			</div>
		</div>
	`,
    styles: [`
			.t  { display: table;      }
			.tr { display: table-row;  }
			.td { display: table-cell; }
			
			.cell-text-container { 
					vertical-align: middle;
					padding-left: 0.3rem;
			}
			
			.full-width  { width:  100%; } 
			.full-height { height: 100%; }

            .fix-table { table-layout:fixed; }

            .ellipsis {
                overflow: hidden;
                text-overflow: ellipsis;
            }
	`]
}) export class MultiSelectRenderer implements ICellRendererAngularComp {
    private params: any;
    value: string;
    display: string = "";
    options: any;
    optionsValueField: string;
    optionsDisplayField: string;
    defaultDisplayField: string;
    defaultDisplayValue: string;
    defaultOption: any;

    agInit(params: any): void {
        this.params = params;
        this.options = [];
        this.value = "";
        this.optionsValueField = "";
        this.optionsDisplayField = "";
        this.defaultDisplayField = "";
        this.defaultDisplayValue = "";
        this.display = "";
        if (this.params) {
            this.value = this.params.value;
        }

        if (this.params && this.params.column && this.params.column.colDef) {
            this.options             = this.params.column.colDef.selectOptions;
            this.optionsValueField   = this.params.column.colDef.selectOptionsValueField;
            this.optionsDisplayField = this.params.column.colDef.selectOptionsDisplayField;
            this.defaultDisplayField = this.params.column.colDef.defaultDisplayField;
            this.defaultDisplayValue = this.params.column.colDef.defaultDisplayValue;
        }
        if (this.defaultDisplayField) {
            for (let option of this.options) {
                if (option[this.defaultDisplayField] === this.defaultDisplayValue) {
                    this.defaultOption = option;
                    break;
                }
            }
        }
        if (this.value && this.value != ""
            && this.options && this.options.length > 0
            && this.optionsValueField && this.optionsValueField != ""
            && this.optionsDisplayField && this.optionsDisplayField != "") {

            let foundOption: boolean = false;

            let choices = this.value.split(',');
            for (let choice of choices) {
                for (let option of this.options) {
                    if (option[this.optionsValueField] && option[this.optionsValueField] === choice) {
                        if (option[this.optionsDisplayField]) {
                            this.display = this.display.concat(option[this.optionsDisplayField]+', ');
                            foundOption = true;
                        } else {
                            this.display = this.display.concat(choice);
                        }
                        break;
                    }
                }
            }
            // if we didn't find the item in the dictionary, check if the items are strings in different cases
            if (!foundOption) {
                for (let choice of choices) {
                    for (let option of this.options) {
                        if (option[this.optionsValueField] && ('' + option[this.optionsValueField]).toLowerCase() === ('' + choice).toLowerCase()) {
                            if (option[this.optionsDisplayField]) {
                                this.display = option[this.optionsDisplayField];
                                foundOption = true;
                            } else {
                                this.display = this.display.concat(choice + ', ');
                            }
                            break;
                        }
                    }
                }
            }

            // if we still didn't find the item, at least display the id.
            if (!foundOption) {
                this.display = this.value;
            }
        } else if (this.defaultOption && this.value != "") {
            this.display = this.defaultOption[this.optionsDisplayField];
        } else {
            this.display = this.value;
        }
        if (this.display) {
            this.display = this.display.substr(0, this.display.lastIndexOf(','));
        }
    }

    refresh(): boolean {
        return false;
    }
}