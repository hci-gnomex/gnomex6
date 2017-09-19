import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";

import { jqxGridComponent } from "../../../assets/jqwidgets-ts/angular_jqxgrid";

// This component is a container for a jqxgrid given a specific style, and equipped to modify the
// grid's size on the page correctly automatically.

@Component({
	selector: "GnomexStyledGrid",
	template: `
		<div #boundingParent style="display: block; width: 100%; height: 100%">
			<div #artificialGridBounding
					 style="display: block; width: 100%; border: solid 1px darkgrey; border-radius:4px"
					 [style.height]="artificialGridBoundingStretch ? '100%' : '' + savedHeight + 'px'">
				<div style="position:relative; display:block; height:100%; width:100%; max-height:100%; overflow: auto">
					<jqxGrid #theGrid
									 (onBindingcomplete)="onGridBindingComplete()"
									 [width]="'calc(100% - 2px)'"
									 [height]="600"
									 [source]="dataAdapter"
									 [pageable]="true"
									 [autoheight]="true"
									 [autorowheight]="true"
									 [editable]="false"
									 [sortable]="true"
									 [columns]="columns"
									 [altrows]="true"
									 [columnsresize]="true"
									 [selectionmode]="'checkbox'"
									 #gridReference>
					</jqxGrid>
				</div>
			</div>
		</div>
	`,
	styles: []
})
export class GnomexStyledGridComponent implements OnInit, OnDestroy {

	@ViewChild('theGrid') theGrid: jqxGridComponent;
	@ViewChild('artificialGridBounding') artificialGridBounding: ElementRef;
	@ViewChild('boundingParent') boundingParent: ElementRef;

	private isResizing: boolean = false;
	private isGridDrawn: boolean = false;

	autoresize: boolean = true;

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
		pagesize: 1000
	};
	private dataAdapter: any = new jqx.dataAdapter(this.source);

	ngOnInit(): void {
		this.interval = setInterval(() => { this.onTimer(); }, 100);
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
		this.theGrid.pagesizeoptions(['100', '1000']);
		this.theGrid.pagesize(1000);

		// It is important that the child is smaller than the parent, so that we can detect resizing.
		this.savedHeight = this.boundingParent.nativeElement.offsetHeight - 1;
		this.artificialGridBoundingStretch = false;
	}

	resizeIfNeeded(): void {
		if(this.isGridDrawn && !this.isResizing) {
			this.isResizing = true;

			if (this.boundingParent.nativeElement.offsetHeight - 1 === this.savedHeight) {
				// Do nothing
			} else if (this.boundingParent.nativeElement.offsetHeight - 1 > this.savedHeight) {
				// Grow! Growing is easy because we know what we need to expand to.
				this.savedHeight = this.boundingParent.nativeElement.offsetHeight - 1;
			} else {
				// Shrink!
				this.savedHeight = this.boundingParent.nativeElement.offsetHeight * 97 / 100;

				setTimeout(() => {
					// It is important that the child is smaller than the parent, so that we can detect resizing.
					console.log('Resetting height');
					this.savedHeight = this.boundingParent.nativeElement.offsetHeight - 1;

					setTimeout(() => {
						this.resizeIfNeeded();
					}, 15);

				}, 15);
			}

			this.isResizing = false;
		}
	}

	private onTimer(): void {
		console.log("onTimerCalled");

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
		this.source = source;
		this.dataAdapter = new jqx.dataAdapter(this.source);
	}
}
