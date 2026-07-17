import {Component, Input, OnDestroy, ViewChild} from "@angular/core";

import { ICellEditorAngularComp } from "ag-grid-angular";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material";
import {MultipleSelectDialogComponent} from "./popups/multiple-select-dialog.component";
import {UrlAnnotDialogComponent} from "./popups/url-annot-dialog.component";
import * as _ from "lodash";
import {BillingAdminTabComponent} from "../../usersGroups/billingAdminTab/billing-admin-tab.component";
import {UrlAnnotRenderer} from "../grid-renderers/url-annot-renderer";

@Component({
    templateUrl: "./url-annot.editor.html",
    styles: [`
			.eight-five-height { height: 85%; }
			
			.flex-column-container {
					display: flex;
					flex-direction: row;
			}
			.flex-row  {
					display: flex;
			}
			.flex-stretch { 
					display:flex; 
					flex: 1; 
			}
	`]
}) export class UrlAnnotEditor implements ICellEditorAngularComp, OnDestroy {
    params: any;
    value: any;
    options: any;
    annot: any;
    optionsValueField: string;
    optionsDisplayField: string;
    gridValueField: string;
    uniqueColumn: any;
    @ViewChild("urlRenderer") urlAnnotRenderer: UrlAnnotRenderer;

    constructor(private dialog: MatDialog) { }

    agInit(params: any): void {

        this.params = params;
        this.uniqueColumn = null;
        if (this.params && this.params.column && this.params.column.colDef) {
            this.annot = _.cloneDeep(this.params.column.colDef.annotation);
            this.annot.data = this.params.node.data;
            this.annot.PropertyEntryValue = [];
        }

        let attName = "a" + this.annot.value;

        let data: any = {
            annot: this.annot,
            propertyValue: this.params.node.data[attName]

    };
        this.urlAnnotRenderer.agInit(this.params);
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.height = '30em';
        configuration.width = '40em';
        configuration.data = data;

        let dialogRef: MatDialogRef<UrlAnnotDialogComponent> = this.dialog.open(UrlAnnotDialogComponent, configuration);

        dialogRef.afterClosed().subscribe(() => {
            this.value = dialogRef.componentInstance.urlFormControl.value;
            this.params.column.gridApi.stopEditing();
        })

    }

    ngOnDestroy(): void {
    }

    getValue(): any {
        return this.value;
    }

    isPopup(): boolean {
        return false;
    }

}
