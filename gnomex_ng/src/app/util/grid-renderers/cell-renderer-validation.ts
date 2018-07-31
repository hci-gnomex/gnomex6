import {ICellRendererAngularComp} from "ag-grid-angular";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";

export abstract class CellRendererValidation implements ICellRendererAngularComp {

    protected params: any;

    protected errorMessage: string = '';

    formBuilder: FormBuilder;
    // constructor(private formBuilder: FormBuilder) { }

    agInit(params: any): void {
        this.params = params;
        this.formBuilder = new FormBuilder();

        this.createAllFormControls();

        if (this.params
            && this.params.node
            && this.params.node.formGroup
            && this.params.column
            && this.params.column.colDef
            && this.params.column.colDef.field) {
            this.errorMessage = this.params.node[this.params.column.colDef.field + "_errorMessage"];
            // this.params.node.formGroup.updateValueAndValidity();
        }

        this.agInit2(params);
    }

    abstract agInit2(params): void;

    refresh(params: any): boolean {
        return false;
    }

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

                        if (column.colDef.validators) {
                            if (!Array.isArray(column.colDef.validators)) {
                                column.colDef.validators = [column.colDef.validators];
                            }

                            if (column.colDef.validators.length > 0) {
                                let formControl: FormControl = new FormControl(column.colDef.field + '_formControl', []);
                                formControl.setValidators(column.colDef.validators);

                                node.formGroup.addControl(column.colDef.field + '_formControl', formControl);

                                formControl.setValue(node.data[column.colDef.field]);
                                formControl.updateValueAndValidity();

                                if (formControl.invalid) {
                                    node[column.colDef.field + "_errorMessage"] +=
                                        'Invalid value "' + node.data[column.colDef.field] + '" for field (' + column.colDef.field + ')\n';
                                }
                            }
                        }

                        if (column.colDef.setErrors) {
                            node[column.colDef.field + "_errorMessage"] += column.colDef.setErrors(
                                node.data[column.colDef.field],
                                node.data,
                                node,
                                column.colDef,
                                node.rowIndex,
                                node.gridApi
                            );
                        }
                    }
                }
            }
        }
    }

}