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

        if (this.params
            && this.params.node
            && this.params.node.gridApi
            && this.params.node.gridApi.formGroup === undefined) {

            let foundDelayValidationProperty: boolean = false;

            for (let columnDef of params.node.gridApi.columnController.columnDefs) {
                if (columnDef.delayValidation && columnDef.delayValidation === true) {
                    foundDelayValidationProperty = true;
                }
            }

            if (!foundDelayValidationProperty) {
                this.determineIfAllRowsNeedValidationInAdvance();
                this.createAllFormControls();
            }
        }

        this.getErrorMessage();

        this.agInit2(params);
    }

    abstract agInit2(params): void;


    refresh(params: any): boolean {
        return false;
    }

    // This function iterates over every cell in the grid and prepares all their needed formGroups and formControls.
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
            && this.params.node.gridApi.getModel()) {

            if (this.params.node.gridApi.gridOptionsWrapper
                && this.params.node.gridApi.gridOptionsWrapper.gridOptions
                && !this.params.node.gridApi.gridOptionsWrapper.gridOptions._eventsChangedByCellRendererValidation) {

                this.changeGridOptionsEvents();

                this.params.node.gridApi.gridOptionsWrapper.gridOptions._eventsChangedByCellRendererValidation = true;
            }

            let allNodes = [];

            if (this.params.node.gridApi.mode_needToValidateOnlyRenderedCells) {
                allNodes = this.params.node.gridApi.getRenderedNodes();
            } else {
                allNodes = this.params.node.gridApi.getModel().rowsToDisplay;
            }

            if (!this.params.node.gridApi.formGroup
                || (this.params.node.gridApi.formGroup
                    && this.params.node.gridApi.formGroup.controls
                    && this.params.node.gridApi.formGroup.controls.length != allNodes.length)) {

                this.params.node.gridApi.formGroup = new FormGroup({});
            }

            if (this.params.node.gridApi.columnController
                && this.params.node.gridApi.columnController.columnDefs) {

                for (let columnDef of this.params.node.gridApi.columnController.columnDefs) {
                    if (columnDef.outerForm && columnDef.formName) {
                        if (!columnDef.outerForm.get(columnDef.formName)) {
                            columnDef.outerForm.addControl(columnDef.formName, this.params.node.gridApi.formGroup);
                        } else {
                            columnDef.outerForm.setControl(columnDef.formName, this.params.node.gridApi.formGroup);
                        }
                    }
                }
            }

            let columns: any[];

            if (this.params && this.params.columnApi && this.params.columnApi.columnController) {
                columns = this.params.columnApi.columnController.gridColumns.filter((column) => {
                    return column.colDef
                        && column.colDef.field
                        && (column.colDef.validators || column.colDef.setErrors);
                });
            }

            for (let node of allNodes) {
                for (let column of columns) {
                    if (column.colDef
                        && column.colDef.field
                        && (column.colDef.validators || column.colDef.setErrors)) {
                        node[column.colDef.field + "_errorMessage"] = '';

                        let formControl: FormControl = new FormControl(column.colDef.field + '_formControl', []);

                        if (!node.formGroup) {
                            node.formGroup = new FormGroup({});
                        }

                        node.formGroup.addControl(column.colDef.field + '_formControl', formControl);

                        if (!Array.isArray(column.colDef.validators)) {
                            column.colDef.validators = [column.colDef.validators];
                        }

                        formControl.setValidators(column.colDef.validators);

                        this.updateErrorMessage(formControl, node, column.colDef);
                    }
                }

                if (!this.params.node.gridApi.formGroup.contains('RowGroup_' + node.rowIndex)) {
                    if (!node.formGroup) {
                        node.formGroup = new FormGroup({});
                    }
                    this.params.node.gridApi.formGroup.addControl('RowGroup_' + node.rowIndex, node.formGroup);
                }
            }
        }
    }

    private changeGridOptionsEvents(): void {
        if (!this.params
            || !this.params.node
            || !this.params.node.gridApi
            || !this.params.node.gridApi.gridOptionsWrapper
            || !this.params.node.gridApi.gridOptionsWrapper.gridOptions) {
            return;
        }

        if (this.params.node.gridApi.gridOptionsWrapper.gridOptions.onRowDataChanged) {
            this.params.node.gridApi.gridOptionsWrapper.gridOptions.onRowDataChanged2 = this.params.node.gridApi.gridOptionsWrapper.gridOptions.onRowDataChanged;
        }

        this.params.node.gridApi.gridOptionsWrapper.gridOptions.onRowDataChanged = ((event: any) => {
            this.createAllFormControls();
            this.fetchErrorMessagesForCurrentlyRenderedCells();

            if (this.params.node.gridApi.gridOptionsWrapper.gridOptions.onRowDataChanged2) {
                this.params.node.gridApi.gridOptionsWrapper.gridOptions.onRowDataChanged2(event);
            }
        });


        if (this.params.node.gridApi.gridOptionsWrapper.gridOptions.onGridColumnsChanged) {
            this.params.node.gridApi.gridOptionsWrapper.gridOptions.onGridColumnsChanged2 = this.params.node.gridApi.gridOptionsWrapper.gridOptions.onGridColumnsChanged;
        }

        this.params.node.gridApi.gridOptionsWrapper.gridOptions.onGridColumnsChanged = ((event: any) => {
            this.determineIfAllRowsNeedValidationInAdvance();
            this.createAllFormControls();
            this.fetchErrorMessagesForCurrentlyRenderedCells();

            if (this.params.node.gridApi.gridOptionsWrapper.gridOptions.onGridColumnsChanged2) {
                this.params.node.gridApi.gridOptionsWrapper.gridOptions.onGridColumnsChanged2(event);
            }
        });
    }

    private getErrorMessage(): void {
        if (this.params
            && this.params.node
            && this.params.node.formGroup
            && this.params.column
            && this.params.column.colDef
            && this.params.column.colDef.field) {

            let formControl = this.params.node.formGroup.get(this.params.column.colDef.field + '_formControl');

            this.updateErrorMessage(formControl, this.params.node, this.params.column.colDef);

            this.errorMessage = this.params.node[this.params.column.colDef.field + "_errorMessage"];
        }
    }

    private refreshFormControlValue(formControl: FormControl, data: any, fieldName: string): void {
        if (formControl && data && fieldName && data[fieldName] !== undefined) {
            formControl.setValue(data[fieldName]);
            formControl.updateValueAndValidity();
        }
    }

    private updateErrorMessage(formControl: FormControl, node: any, columnDefinition: any): string {
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

        let errorMessageName: string = columnDefinition.field + "_errorMessage";

        this.refreshFormControlValue(formControl, node.data, columnDefinition.field);

        node[errorMessageName] = '';

        if (formControl.invalid || (customErrorMessage && customErrorMessage !== '')) {
            if (columnDefinition.errorMessageHeader) {
                node[errorMessageName] += '' + columnDefinition.errorMessageHeader + '\n';
            } else {
                node[errorMessageName] +=
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
                        node[errorMessageName] += errorNameErrorMessagePair.errorMessage +'\n';
                    }
                }
            }
        }

        node[errorMessageName] += customErrorMessage;

        return node[errorMessageName];
    }

    protected determineIfAllRowsNeedValidationInAdvance(): void {
        if (this.params
            && this.params.node
            && this.params.node.gridApi
            && this.params.columnApi
            && this.params.columnApi.columnController
            && this.params.columnApi.columnController.gridColumns) {

            let columns = this.params.columnApi.columnController.gridColumns.filter((column) => {
                return column.colDef
                    && column.colDef.field
                    && (column.colDef.validators || column.colDef.setErrors)
                    && column.colDef.editable === true
                    && !(column.colDef.validateOnlyRenderedCells
                        && column.colDef.validateOnlyRenderedCells === true);
            });

            this.params.node.gridApi.mode_needToValidateOnlyRenderedCells = Array.isArray(columns) && columns.length === 0;
        }
    }

    protected fetchErrorMessagesForCurrentlyRenderedCells(): void {
        if (this.params
            && this.params.node
            && this.params.node.gridApi) {

            let getCellRendererParams: any = { rowNodes: this.params.node.gridApi.getRenderedNodes() };

            for (let cellRenderer of this.params.node.gridApi.getCellRendererInstances(getCellRendererParams)) {
                if (cellRenderer._agAwareComponent && cellRenderer._agAwareComponent.getErrorMessage) {
                    cellRenderer._agAwareComponent.getErrorMessage();
                }
            }
        }
    }

    public updateValidation(): void {
        console.log("Successfully reached!");
        // add this form control

        let columns = this.params.columnApi.columnController.gridColumns.filter((column) => {
            return column.colDef
                && column.colDef.field
                && (column.colDef.validators || column.colDef.setErrors)
                && column.colDef.field === this.params.field;
        });

        if (this.params.colDef
            && this.params.colDef.field
            && (this.params.colDef.validators || this.params.colDef.setErrors)) {

            this.params.node[this.params.colDef.field + "_errorMessage"] = '';

            let formControl: FormControl = new FormControl(this.params.colDef.field + '_formControl', []);

            if (!this.params.node.formGroup) {
                this.params.node.formGroup = new FormGroup({});

                if (!this.params.node.gridApi.formGroup) {
                    this.params.node.gridApi.formGroup = new FormGroup({});
                } else {
                    // check for any removed nodes & remove their validators if needed.
                    for (let controlName of this.params.node.gridApi.formGroup.controls.keys()) {
                        if (('' + controlName).toLowerCase().substr(0, 9) === 'rowgroup_') {
                            let found: boolean = false;
                            for (let node of this.params.node.gridApi.getModel().rowsToDisplay) {
                                if (('' + node.rowIndex) === ('' + controlName).substr(9)) {
                                    found = true;
                                    break;
                                }
                            }
                            if (!found) {
                                this.params.node.gridApi.formGroup.removeControl(controlName);
                            }
                        }
                    }

                }

                this.params.node.gridApi.formGroup.addControl('RowGroup_' + this.params.node.rowIndex, this.params.node.formGroup);
            }

            if (!this.params.node.formGroup.controls[this.params.colDef.field + '_formControl']) {
                this.params.node.formGroup.addControl(this.params.colDef.field + '_formControl', formControl);

                if (Array.isArray(this.params.colDef.validators)) {
                    this.params.node.formGroup.controls[this.params.colDef.field + '_formControl'].setValidators(this.params.colDef.validators);
                }

                if (this.params.node.gridApi.columnController
                    && this.params.node.gridApi.columnController.columnDefs) {

                    for (let columnDef of this.params.node.gridApi.columnController.columnDefs) {
                        if (columnDef.outerForm && columnDef.formName) {
                            if (!columnDef.outerForm.get(columnDef.formName)) {
                                columnDef.outerForm.addControl(columnDef.formName, this.params.node.gridApi.formGroup);
                            } else {
                                columnDef.outerForm.setControl(columnDef.formName, this.params.node.gridApi.formGroup);
                            }
                        }
                    }
                }
            }

            this.updateErrorMessage(formControl, this.params.node, this.params.colDef);
        }

        // add column control groups if needed
        // add row control groups if needed
        // setup grid control group if needed
        // Might need to trigger cell validation to run with the new validation.
    }
}