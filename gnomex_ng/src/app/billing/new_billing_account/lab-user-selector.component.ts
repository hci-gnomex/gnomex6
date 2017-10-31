import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";

import { jqxInputComponent } from "../../../assets/jqwidgets-ts/angular_jqxinput"
import { jqxWindowComponent } from "../../../assets/jqwidgets-ts/angular_jqxwindow";

import { GnomexStyledGridComponent } from "../../util/gnomexStyledJqxGrid/gnomex-styled-grid.component"

@Component({
	selector: "lab-user-selector",
	templateUrl: "./lab-user-selector.component.html",
	styles: [`
			.t {
					display: table;
			}
			
			.tr {
					display: table-row;
			}
			
			.td {
					display: table-cell;
			}
			
			.full-width {
					width: 100%;
			}
			
			.full-height {
          height: 100%;
      }
	`]
}) export class LabUserSelectorComponent implements OnInit, OnDestroy, AfterViewInit {

	@ViewChild('gridReference') grid: GnomexStyledGridComponent;
	@ViewChild('windowRef') window: jqxWindowComponent;

	private inputDisplayString: string = '';
	private recordedIndexes: Array<Number> = [];

	private columns: any[] = [
		{text: "Option", datafield: "name"}
	];

	private source = {
		datatype: "json",
		localdata: [
			{name: "Testing 1,2,3 Testing"}
		],
		datafields: [
			{name: "name", type: "string"}
		]
	};


	ngOnInit() {
		// this.grid.theGrid.showstatusbar(false);
		this.grid.setColumns(this.columns);
		this.grid.setDataAdapterSource(this.source);
	}

	ngAfterViewInit() {
		// this.window.open();
		this.window.close();
	}

	ngOnDestroy() {

	}

	openUserSelectPopup(): void {
		// this.grid.selectedrowindexes(this.recordedIndexes);
		this.window.open();
	}

	closeUserSelectPopup(): void {
		this.window.close();
	}

	private resetSelected(): void {

		let copyRecordedIndexes: Array<Number> = [];

		for (let i:number = 0; i < this.recordedIndexes.length; i++) {
			copyRecordedIndexes.push(this.recordedIndexes[i]);
		}

		this.grid.selectedrowindexes(copyRecordedIndexes);
	}

	private saveButtonClicked(): void {
		this.inputDisplayString = '';

		let selectedIndexes: Array<Number> = this.grid.getselectedrowindexes();
		this.recordedIndexes = [];

		for (let i: number = 0; i < selectedIndexes.length; i++) {
			if (i > 0) {
				this.inputDisplayString += ', ';
			}
			this.inputDisplayString += this.source.localdata[i].name;

			this.recordedIndexes.push(selectedIndexes[i]);
		}

		this.closeUserSelectPopup();
	}

	private cancelButtonClicked(): void {
		this.closeUserSelectPopup();
	}
}