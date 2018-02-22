import {
	AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit,
	ViewChild
} from "@angular/core";

import { jqxInputComponent } from "../../../../../assets/jqwidgets-ts/angular_jqxinput"
import { jqxWindowComponent } from "../../../../../assets/jqwidgets-ts/angular_jqxwindow";

import { GnomexStyledGridComponent } from "../../../../util/gnomexStyledJqxGrid/gnomex-styled-grid.component";

@Component({
	selector: "user-multiple-selector",
	templateUrl: "./user-multiple-selector.component.html",
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
			
			.hidden {
					display: none;
					visibility: hidden;
			}
	`]
}) export class UserMultipleSelectorComponent implements OnInit, OnDestroy, AfterViewInit {

	@ViewChild('gridReference') grid: GnomexStyledGridComponent;
	@ViewChild('windowRef') window: jqxWindowComponent;

	@Input() placeholder: string = 'Click to Edit...';
	private displayString: string = '';
	private recordedIndexes: Array<Number> = [];

	@Input() title: string = 'Title';

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

	private isFirstOpening: boolean = true;
	private addingUsersFromAnotherLab = false;
	private addingUsersFromListClasses: string = ' ';
	private addingUsersFromAnotherLabClasses: string = ' hidden';

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

		// This is needed on the first opening of the selector to refresh the contents of the grid,
		// which seems not to visually update after it's datasource is changed if it is being hidden at that time.
		if (this.isFirstOpening) {
			setTimeout(() => {
				let tempSource : any = {
					datatype: "json",
					localdata: [],
					datafields: [
						{name: "name", type: "string"}
					]
				};
				this.grid.setDataAdapterSource(tempSource);
			}, 100);

			setTimeout(() => { this.grid.setDataAdapterSource(this.source); }, 200);

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

		for (let i: number = 0; i < selectedIndexes.length; i++) {
			if (i > 0) {
				this.displayString += ', ';
			}
			this.displayString += this.source.localdata[i].name;

			this.recordedIndexes.push(selectedIndexes[i]);
		}

		this.closeUserSelectPopup();
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

	showUserListPane(): void {
		this.addingUsersFromListClasses = ' ';
		this.addingUsersFromAnotherLabClasses = ' hidden';
	}

	showOtherUserPane(): void {
		//this.addingUsersFromAnotherLab = true;
		this.addingUsersFromListClasses = ' hidden';
		this.addingUsersFromAnotherLabClasses = ' ';
	}
}