import {ICellRendererAngularComp} from "ag-grid-angular";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

/**
 * This class' purpose is to place FormControls on cells in the grid, and to link them by rows, and rows to the grid as a whole.
 * It allows you to add validators for a cells' value and link an error type to an error message to display in a tooltip, or
 * you can provide a function to test some information about the row and provide an error message.
 *
 * The class works off of a number of properties added to the columnDefs in the ag-grid.
 *
 * We are looking for the following properties:
 *   1. errorMessageHeader : a string to display at the top of the list of any errors found for the cell
 *   2. validators : an array of angular validators to describe the cell value
 *   3. errorNameErrorMessageMap : an array of objects with "errorName"s and "errorMessage"s that are used to create a displayed list for the user
 *   4. setErrors: a function with the signature:
 *                 (value: any, data: any, node: any, colDef: any, rowIndex: any, gridApi: any) => string
 *                 which is called to generate a custom error message, if needed. An empty or null string
 *                 is treated as not being an error.
 *
 * Example column definition:
 *      {
 *          headerName: "Name",
 *          editable: false,
 *          width: 600,
 *          cellRendererFramework: TextAlignLeftMiddleRenderer,
 *          setErrors: (value: any,
 *                      data: any,
 *                      node: any,
 *                      colDef: any,
 *                      rowIndex: any,
 *                      gridApi: any) => {
 *              return (value && value === 'TEST') ? 'Invalid name' : '';
 *          },
 *          validators: [ Validators.minLength(10) ],
 *          errorMessageHeader: 'TestingTestingTesting',
 *          errorNameErrorMessageMap: [
 *              { errorName: 'minlength', errorMessage: 'Name is too short' }
 *          ],
 *          field: "name"
 *      }
 *
 * To use with a new renderer, extend this class, do not override agInit, or call super.agInit(params) first.
 * (You can use agInit2 instead, called right after agInit).
 *
 * To display a tooltip with the error messages, include an element with a matTooltip pointing to this.errorMessage, like:
 *      <div [matTooltip]="this.errorMessage" [matTooltipShowDelay]="300" [matTooltipHideDelay]="300" ...
 * For cell highlighting, you can add a CSS class something like :
 *      .error {
 *      	background: linear-gradient(rgba(255,0,0,0.25), rgba(255,0,0,0.25), rgba(255,0,0,0.25));
 *      	border: solid red 2px;
 *      }
 *   and a conditional class on an element in the template, like :
 *      class="{{this.errorMessage && this.errorMessage !== '' ? 'error' : ''}}"
 */
export abstract class CellRendererValidation implements ICellRendererAngularComp {

    protected params: any;

    protected errorMessage: string = '';

    formBuilder: FormBuilder;


    agInit(params: any): void {
        this.params = params;
        this.formBuilder = new FormBuilder();

        this.createAllFormControls();

        if (this.params
            && this.params.node
            && this.params.node.formGroup
            && this.params.node.formGroup.controls
            && this.params.column
            && this.params.column.colDef
            && this.params.column.colDef.field) {

            // In case of editing and re-creating renderers.
            this.errorMessage = CellRendererValidation.updateErrorMessage(
                this.params.node.formGroup.controls[this.params.column.colDef.field + "_formControl"],
                this.params.node,
                this.params.column.colDef
            );

            this.errorMessage = this.params.node[this.params.column.colDef.field + "_errorMessage"];
        }

        this.agInit2(params);
    }

    abstract agInit2(params): void;


    refresh(params: any): boolean {
        return false;
    }

    // This function iterates over every cell in the grid and prepares all their needed formGroups and formControls
    // After the first run, further calls should do nothing because the grid's formGroup is defined.
    //
    // This was done this way (in the cell renderer) for three reasons :
    //   1. We need to wait until the column and row data have been provided to the grid
    //   2. We don't want the programmer to have to implement it themselves every time they create a grid
    //   3. The grid does not create all the cell renderers in advance, just those that fit on the screen
    //      (plus a few nearby) meaning we can't just use the cell renderer's constructor, since we don't
    //      know if the information we start with is valid on every screen, and because we have some calls
    //      that send back the entire grid's worth of data.
    //
    // There may be a better way to do this, in which case this should probably be replaced!
    createAllFormControls(): void {
        if (this.params
            && this.params.column
            && this.params.column.colDef
            && this.params.data
            && this.params.node
            && this.params.node.gridApi
            && this.params.node.gridApi.formGroup === undefined
            && this.params.node.gridApi.getModel()) {

            this.params.node.gridApi.formGroup = new FormGroup({});

            let allNodes = this.params.node.gridApi.getModel().rowsToDisplay;
            let columns: any[];

            if (this.params && this.params.columnApi && this.params.columnApi.columnController) {
                columns = this.params.columnApi.columnController.gridColumns;
            }

            for (let node of allNodes) {

                if (node.formGroup === undefined) {
                    node.formGroup = new FormGroup({});
                }

                for (let column of columns) {
                    if (column.colDef && column.colDef.field) {

                        node[column.colDef.field + "_errorMessage"] = '';

                        let formControl: FormControl = new FormControl(column.colDef.field + '_formControl', []);
                        node.formGroup.addControl(column.colDef.field + '_formControl', formControl);

                        if (column.colDef.validators) {
                            if (!Array.isArray(column.colDef.validators)) {
                                column.colDef.validators = [column.colDef.validators];
                            }

                            formControl.setValidators(column.colDef.validators);
                        }

                        CellRendererValidation.updateErrorMessage(formControl, node, column.colDef);
                    }
                }

                this.params.node.gridApi.formGroup.addControl('RowGroup_' + node.rowIndex, node.formGroup);
            }
        }
    }

    static refreshFormControlValue(formControl: FormControl, data: any, fieldName: string): void {
        if (formControl && data && fieldName && data[fieldName] !== undefined) {
            formControl.setValue(data[fieldName]);
            formControl.updateValueAndValidity();
        }
    }

    static updateErrorMessage(formControl: FormControl, node: any, columnDefinition: any): string {
        if (!formControl || !node || !columnDefinition) {
            return '';
        }

        let customErrorMessage: string = '';

        if (columnDefinition.setErrors) {
            customErrorMessage = columnDefinition.setErrors(
                node.data[columnDefinition.field],
                node.data,
                node,
                columnDefinition,
                node.rowIndex,
                node.gridApi
            );
        }

        CellRendererValidation.refreshFormControlValue(formControl, node.data, columnDefinition.field);

        node[columnDefinition.field + "_errorMessage"] = '';

        if (formControl.invalid || (customErrorMessage && customErrorMessage != '')) {
            if (columnDefinition.errorMessageHeader) {
                node[columnDefinition.field + "_errorMessage"] += '' + columnDefinition.errorMessageHeader + '\n';
            } else {
                node[columnDefinition.field + "_errorMessage"] +=
                    'Invalid value "' + node.data[columnDefinition.field] + '" for field (' + columnDefinition.field + ')\n';
            }
        }

        if (columnDefinition.errorNameErrorMessageMap) {
            if (!Array.isArray(columnDefinition.errorNameErrorMessageMap)) {
                columnDefinition.errorNameErrorMessageMap = [columnDefinition.errorNameErrorMessageMap];
            }

            for (let errorNameErrorMessagePair of columnDefinition.errorNameErrorMessageMap) {
                if (!!errorNameErrorMessagePair.errorName && !!errorNameErrorMessagePair.errorMessage) {
                    if (formControl.hasError(errorNameErrorMessagePair.errorName)) {
                        node[columnDefinition.field + "_errorMessage"] += errorNameErrorMessagePair.errorMessage +'\n';
                    }
                }
            }
        }

        node[columnDefinition.field + "_errorMessage"] += customErrorMessage;

        return node[columnDefinition.field + "_errorMessage"];
    }

}