import {Component, ElementRef, OnDestroy, OnInit, AfterViewInit, ViewChild} from "@angular/core";

import { jqxButtonComponent } from "../../../assets/jqwidgets-ts/angular_jqxbuttons"
import { jqxCheckBoxComponent } from "../../../assets/jqwidgets-ts/angular_jqxcheckbox"
import { jqxComboBoxComponent } from "../../../assets/jqwidgets-ts/angular_jqxcombobox"
import { jqxInputComponent } from "../../../assets/jqwidgets-ts/angular_jqxinput"
import { jqxWindowComponent } from "../../../assets/jqwidgets-ts/angular_jqxwindow";

import { GnomexStyledDatePickerComponent } from "../../util/gnomexStyledDatePicker/gnomex-styled-date-picker.component";

// This component is a container for a jqxgrid given a specific style, and equipped to modify the
// grid's size on the page correctly automatically.

@Component({
	selector: "new-billing-account-window",
	templateUrl: "./new-billing-account.component.html",
	styles: [`
			button {
          height: 1.6em;
          width: 4.5em;
          border-radius: 4px;
          text-align: center;
					
					font-size: small;

          background: #e4e0e0;
          background: -webkit-linear-gradient(white, #e4e0e0);
          background: -o-linear-gradient(white, #e4e0e0);
          background: -moz-linear-gradient(white, #e4e0e0);
          background: linear-gradient(white, #e4e0e0);
			}
			
			.save-button {
					
			}
			
			.save-button:focus {
					border-style: solid;
					border-color: #009dff;
			}

      div.t {
          display: table;
      }

      div.tr {
          display: table-row;
      }

      div.td {
          display: table-cell;
      }
			
			.full-height {
					height: 100%;
			}
			
			.full-width {
					width: 100%;
			}
			
			.cell-label {
          width: 8rem;
          height: 2.6em;
					vertical-align: middle;
					font-style: italic;
					color: #1601db;
			}

      .radio-button {
          min-width: 3em;
          padding: 0.5em;
      }

      .vertical-spacer {
          width: 100%;
          height: 3px;
      }

      .background {
          display: block;
          position: relative;
          overflow: auto;
          background-color: white;
          border: #d2d2d2 solid 1px;
      }
			
			.inline-block {
					display: inline-block;
			}
			
			.sub-header {
					font-size: small;
					padding-bottom: 0.2rem;
			}
			
			.row-content {
			}

      .row-spacer {
					height: 0.4em;
			}
			
			.center-vertical-align {
					vertical-align: middle;
			}
			
			.checkbox-container {
					display: inline-block;
					vertical-align: middle;
					width: fit-content;
			}
			
			.checkbox-label {
          height: 2.6em;
          vertical-align: middle;
          color: #1601db;
			}
			
			.horizontal-break {
					display: inline-block;
					height: 5em;
					width: 1px;
					background-color: #c4cccc;
					margin: 0 0.5em;
			}
			
			.agreement {
          color: #1601db;
					font-weight: bold;
			}
	`]
})
export class NewBillingAccountComponent implements OnInit, OnDestroy, AfterViewInit {

	@ViewChild('windowRef') window: jqxWindowComponent;

	@ViewChild('windowHeader') windowHeader: ElementRef;
	@ViewChild('windowBody') windowBody: ElementRef;

	ngOnInit(): void {

	}

	ngAfterViewInit(): void {
		this.window.height(this.windowHeader.nativeElement.offsetHeight + this.windowBody.nativeElement.offsetHeight + 12);
	}

	ngOnDestroy(): void {

	}
}