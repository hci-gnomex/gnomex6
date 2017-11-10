import {
    AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output,
    ViewChild
} from "@angular/core";

import { jqxGridComponent } from "../../../assets/jqwidgets-ts/angular_jqxgrid";

// This component is a container for a jqxgrid given a specific style, and equipped to modify the
// grid's size on the page correctly automatically.

@Component({
	selector: "GnomexStyledGrid",
	templateUrl: "./gnomex-styled-grid.component.html",
	styles: []
})
export class GnomexStyledGridComponent implements OnInit, OnDestroy, AfterViewInit {


	private _selectionSetting:string ="checkbox";
	@Input() set selectionSetting(value:string){
		this._selectionSetting = value;
	}
	get selectionSetting():string{
		return this._selectionSetting;
	}
	@Input() styleForTheme:string ="gnomex5";


    @Output() rowDoubleClicked: EventEmitter<any> = new EventEmitter();

	@ViewChild('theGrid') theGrid: jqxGridComponent;
	@ViewChild('artificialGridBounding') artificialGridBounding: ElementRef;
	@ViewChild('boundingParent') boundingParent: ElementRef;

	private isResizing: boolean = false;
	private isGridDrawn: boolean = false;

	autoresize: boolean = true;
	pageable: boolean = false;

	// Due to the way jqxwidget grids render, and because of the graphical glitches associated with
	// placing the grid in a css flexbox, we needed to be able to restrict the size of a cell within
	// a table to create cells of the correct size. To do this, we switch the height of a div
	// from 100% to a fixed pixel size before we load data into the grid.
	private savedHeight: number = 0;
	private artificialGridBoundingStretch: boolean = true;

	private interval: any;

	private columns: any[] = [
		{text: "# "}
	];
	private source = {
		datatype: "json",
		localdata: [ ],
		datafields: [ ],
		pagesize: 250
	};
	private dataAdapter: any = new jqx.dataAdapter(this.source);

	ngOnInit(): void {

	}

	ngAfterViewInit(): void {
		this.interval = setInterval(() => { this.onTimer(); }, 100);
		this.dataAdapter = new jqx.dataAdapter(this.source);
	}

	ngOnDestroy(): void {
		if (this.interval) {
			clearInterval(this.interval);
		}
	}

	getcell(rowBoundIndex: number, datafield: string): any {
		return this.theGrid.getcell(rowBoundIndex, datafield);
	}

	selectedrowindexes(selectedrowindexes: Array<Number>) {
		this.theGrid.selectedrowindexes(selectedrowindexes);
	}
	getselectedrowindexes(): Array<Number> {
		// This check is needed by some windows with grids, which count the number of selected items
		// and render them. Trying to use this function before the grid is bound causes errors on these
		// windows
		if (this.isGridDrawn) {
			return this.theGrid.getselectedrowindexes();
		} else {
			return [];
		}
	}

	private onGridBindingComplete() {
		this.isGridDrawn = true;
		this.theGrid.pagesizeoptions(['100', '250', '1000']);
		this.theGrid.pagesize(250);

		// It is important that the child is smaller than the parent, so that we can detect resizing.
		this.savedHeight = this.boundingParent.nativeElement.offsetHeight - 3;
		this.artificialGridBoundingStretch = false;
	}

	resizeIfNeeded(): void {
		if(this.isGridDrawn && !this.isResizing) {
			this.isResizing = true;

			if (this.boundingParent.nativeElement.offsetHeight - 3 === this.savedHeight) {
				// Do nothing
			} else if (this.boundingParent.nativeElement.offsetHeight - 3 > this.savedHeight) {
				// Grow! Growing is easy because we know what we need to expand to.
				this.savedHeight = this.boundingParent.nativeElement.offsetHeight - 3;
			} else {
				// Shrink!
				this.savedHeight = this.boundingParent.nativeElement.offsetHeight * 97 / 100;

				setTimeout(() => {
					// It is important that the child is smaller than the parent, so that we can detect resizing.
					this.savedHeight = this.boundingParent.nativeElement.offsetHeight - 3;

					setTimeout(() => {
						this.resizeIfNeeded();
					}, 15);

				}, 15);
			}

			this.isResizing = false;
		}
	}

	private onTimer(): void {
		if(this.autoresize) {
			this.resizeIfNeeded();
		}
	}

	getColumns(): any[] {
		return this.columns;
	}
	setColumns(columns: any[]): void {
		this.columns = columns;
	}

	getDataAdapterSource(): any {
		return this.source;
	}
	setDataAdapterSource(source: any): void {
		if(!this.pageable) {
			this.pageable = source.localdata.length > 250;
		}

		this.source = source;
		this.dataAdapter = new jqx.dataAdapter(this.source);

		//this.theGrid.pageable(source.localdata.length > 250);

		//this.pageable = source.localdata.length > 250;
	}
    doubleClickedRow($event:any){
		this.rowDoubleClicked.emit($event);

	}
}
