import {
	AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit,
	Output, ViewChild
} from "@angular/core";

import { jqxInputComponent } from "../../../assets/jqwidgets-ts/angular_jqxinput"
import { jqxWindowComponent } from "../../../assets/jqwidgets-ts/angular_jqxwindow";

import { GnomexStyledGridComponent } from "../../util/gnomexStyledJqxGrid/gnomex-styled-grid.component";

@Component({
	selector: "multiple-selector",
	templateUrl: "./multiple-selector.component.html",
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
}) export class MultipleSelectorComponent implements OnInit, OnDestroy, AfterViewInit {

	@ViewChild('gridReference') grid: GnomexStyledGridComponent;
	@ViewChild('windowRef') window: jqxWindowComponent;

	@Input() placeholder: string = 'Click to Edit...';
	private displayString: string = '';
	private recordedIndexes: Array<Number> = [];

	@Input() disable: boolean = false;

	@Input() title: string = 'Title';

	@Output() onSave: EventEmitter<any> = new EventEmitter();

	private columns: any[] = [
		{text: "Option", datafield: "display"}
	];

	private source = {
		datatype: "json",
		localdata: [
			{display: "Testing 1,2,3 Testing"}
		],
		datafields: [
			{name: "display", type: "string"}
		]
	};

	private isFirstOpening: boolean = true;

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

		if (this.disable) {
			return;
		}

		this.window.open();

		// This is needed on the first opening of the selector to refresh the contents of the grid,
		// which seems not to visually update after it's datasource is changed if it is being hidden at that time.
		if (this.isFirstOpening) {
			// setTimeout(() => {
				let tempSource : any = {
					datatype: "json",
					localdata: [],
					datafields: [
						{name: "display", type: "string"}
					]
				};
			// 	this.grid.setDataAdapterSource(tempSource);
			// }, 200);

			setTimeout(() => { this.grid.setDataAdapterSource(this.source); }, 400);

			this.isFirstOpening = false;
		}
	}

	closeUserSelectPopup(): void {
		this.window.close();
	}

	clearSelection(): void {
		this.displayString = '';
		this.grid.selectedrowindexes([]);
	}

	private resetSelected(): void {

		let copyRecordedIndexes: Array<Number> = [];

		for (let i:number = 0; i < this.recordedIndexes.length; i++) {
			copyRecordedIndexes.push(this.recordedIndexes[i]);
		}

		this.grid.selectedrowindexes(copyRecordedIndexes);
	}

	private saveButtonClicked(): void {
		this.displayString = '';

		let selectedIndexes: Array<Number> = this.grid.getselectedrowindexes();
		this.recordedIndexes = [];

		let selectedData: Array<any> = [];

		for (let i: number = 0; i < selectedIndexes.length; i++) {
			let selectedIndex: number = selectedIndexes[i] != null ? selectedIndexes[i].valueOf() : -1;
			if (i > 0) {
				this.displayString += ', ';
			}
			this.displayString += this.source.localdata[selectedIndex].display;
			selectedData.push(this.source.localdata[selectedIndex]);

			this.recordedIndexes.push(selectedIndexes[i]);
		}

		this.closeUserSelectPopup();
		this.onSave.next(selectedData);
	}

	private cancelButtonClicked(): void {
		this.closeUserSelectPopup();
	}

	setTitle(title: string): void {
		this.title = title;
	}
	getTitle(): string {
		return this.title;
	}

	setSource(source: any): void {
		this.clearSelection();
		this.source = source;
		this.grid.setDataAdapterSource(this.source);
	}
	getSource(): any {
		return this.source;
	}

	setLocalData(data: any[]) {
		let newSource: any = {};

		//FIXME DOES NOT WORK
		newSource.datatype = this.source.datatype;

		newSource.datafields = [];
		if (this.source != null && this.source.datafields != null) {
			for (let i = 0; i < this.source.datafields.length; i++) {
				newSource.datafields.push(this.source.datafields[i]);
			}
		}

		newSource.localdata = [];
		if (data != null) {
			for (let i = 0; i < data.length; i++) {
				newSource.localdata.push(data[i]);
			}
		}

		this.setSource(newSource);
	}
	getLocalData(): any[] {
		return this.source.localdata;
	}
}