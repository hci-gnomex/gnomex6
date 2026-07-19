import {Component, ElementRef, OnDestroy, OnInit, ViewChild, Input} from "@angular/core";

import {MatDatepicker, MatDatepickerInput} from "@angular/material/datepicker";
import { MatDialog } from "@angular/material/dialog";
import { MatSuffix } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import {TestingDialogComponent} from "./testing-dialog.component";

@Component({
	selector: "testPage",
	templateUrl: "./test-page.component.html",
	styles: [``]
}) export class TestPageComponent {

	animal: string = 'dolphin';
	name: string;

	constructor(public dialog: MatDialog) { }

	public openDialog(): void {
		let dialogRef = this.dialog.open(TestingDialogComponent, {
			width: '250px',
			data: {name: this.name, animal: this.animal}
		});

		dialogRef.afterClosed().subscribe((result) => {
			console.log('Test dialog closed!');
			this.animal = result;
		});
	}
}
