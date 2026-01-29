import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import {UrlAnnotationComponent} from "../../url-annotation.component";
import {FormControl} from "@angular/forms";

@Component({
    selector: "url-annot-dialog",
    templateUrl: "url-annot-dialog.component.html",
    styles: [`
			.full-width  { width  : 100%; }
			.full-height { height : 100%; }
			
			.t  { display: table;      }
			.tr { display: table-row;  }
			.td { display: table-cell; }
			
			.flex-vertical-container {
					display: flex;
					flex-direction: column;
			}
			
			.stretch {
					flex: 1;
			}
			
			.vertical-center { vertical-align: middle; }
			.center { text-align: center; }
            .inline-block { display: inline-block; }
			
			.no-margin { margin : 0; }

			.horizontal-padding { padding: 0 1em; }
			
			.left-align  { text-align: left;  }
			.right-align { text-align: right; }
			
			.error-message { color: red; }
	`]
})
export class UrlAnnotDialogComponent {
    gridApi: any;
    gridColumnApi: any;
    urlFormControl: FormControl;
    annot: any;

    value: string;
    okWasClicked: boolean = false;

    constructor(private dialogRef: MatDialogRef<UrlAnnotDialogComponent>,
                @Inject(MAT_DIALOG_DATA) private data) {
        if (data) {
            this.annot = data.annot;
            if (data.propertyValue) {
                this.annot.PropertyEntryValue = data.propertyValue.PropertyEntryValue;
            }
        }

        this.urlFormControl = new FormControl(this.annot);
    }

    onGridSizeChanged(): void {
        if (this.gridApi) {
            this.gridApi.sizeColumnsToFit();
        }
    }

    onGridReady(event: any): void {
        this.gridApi = event.api;
        this.gridColumnApi = event.columnApi;

        setTimeout(() => {
            if (this.gridApi) {
                this.gridApi.sizeColumnsToFit();
            }
        });
   }

    updateButtonClicked() {
        console.log("update");
        this.okWasClicked = true;

        this.value = this.getValue();

        this.dialogRef.close();

    }

    cancelButtonClicked() {
        this.dialogRef.close();
    }

    getValue(): string {
        return "";
    }
}