import {Component, Input, OnDestroy} from "@angular/core";
import {Response, URLSearchParams} from "@angular/http";
import {FormBuilder, FormGroup} from "@angular/forms";
import {MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material";

import {GridApi} from "ag-grid-community";

import {first} from "rxjs/internal/operators";
import {Subscription} from "rxjs/index";

import {Experiment, NewExperimentService} from "../../services/new-experiment.service";
import {annotType, PropertyService} from "../../services/property.service";
import {DialogsService} from "../../util/popup/dialogs.service";
import {GnomexService} from "../../services/gnomex.service";
import {SelectRenderer} from "../../util/grid-renderers/select.renderer";
import {SelectEditor} from "../../util/grid-editors/select.editor";
import {MultiSelectEditor} from "../../util/grid-editors/multi-select.editor";
import {MultiSelectRenderer} from "../../util/grid-renderers/multi-select.renderer";
import {UrlAnnotEditor} from "../../util/grid-editors/url-annot-editor";
import {UrlAnnotRenderer} from "../../util/grid-renderers/url-annot-renderer";
import {CheckboxRenderer} from "../../util/grid-renderers/checkbox.renderer";
import {ConfigAnnotationDialogComponent} from "../../util/config-annotation-dialog.component";
import {OrderType} from "../../util/annotation-tab.component";
import {TextAlignLeftMiddleRenderer} from "../../util/grid-renderers/text-align-left-middle.renderer";


@Component({
    selector: "tabAnnotationView",
    templateUrl: "./tab-annotation-view.component.html",
    styles: [`
        
        .short-width {
            width: 10em;
            min-width: 10em;
        }
        .moderate-width {
            width: 40em;
            min-width: 20em;
        }
        
    `]
})

export class TabAnnotationViewComponent implements OnDestroy {

    @Input("experiment") set experiment(value: Experiment) {
        this._experiment = value;

        if (this._experiment && !this.experimentSubscription) {
            this.experimentSubscription = value.onChange_PropertyEntries.subscribe((value) =>{
                if (value && this.addAnnotationGridApi) {
                    // this.annotations = this.newExperimentService.propertyEntriesForUser;
                    // this.annotations = this._experiment.PropertyEntries;
                    this.addAnnotationGridApi.setRowData(this._experiment.PropertyEntries);

                    for (let i = 0; i < this._experiment.PropertyEntries.length; i++) {
                        // "Required" annotations are selected by default. (? States?)
                        if (this.addAnnotationGridApi.getRowNode('' + i).data.isSelected
                            && this.addAnnotationGridApi.getRowNode('' + i).data.isSelected === "true") {

                            this.addAnnotationGridApi.getRowNode('' + i).setSelected(true);
                            this.addAnnotationGridApi.getRowNode('' + i).data.boldDisplay = 'Y';
                        }
                    }

                    this.removeAnnotationGridApi.setRowData([]);

                    if (this.newExperimentService.propEntriesChanged.value === true) {
                        this.newExperimentService.propEntriesChanged.next(false);
                    }
                }
            });
        }
    }

    private _experiment: Experiment;

    private experimentSubscription: Subscription;

    public addAnnotationGridApi: GridApi;
    public removeAnnotationGridApi: GridApi;
    public annotGridRowData: any[] = [];

    public customAnnotLabel: string = "Add Annotation";
    public editAnnotLabel: string = "Edit Annotations";
    public form: FormGroup;

    public currentUsers: any[] = [];

    // private currentAnnotColumn: number = 5;

    // public annotations: any[] = [];

    private get addAnnotationColumnDefs(): any[] {
        return [
            {
                headerName: "Available Annotations",
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                field: "name",
                width: 500
            }
        ];
    }
    private get removeAnnotationColumnDefs(): any[] {
        return [
            {
                headerName: "Sample Annotations to use",
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                field: "name",
                width: 500
            }
        ];
    }

    constructor(private fb: FormBuilder,
                private propertyService: PropertyService,
                private dialogsService: DialogsService,
                private gnomexService: GnomexService,
                private matDialog: MatDialog,
                private newExperimentService: NewExperimentService) {

        this.form = this.fb.group({
            customAnnot: [''],
        });
    }

    ngOnDestroy() {
        if (this.experimentSubscription) {
            this.experimentSubscription.unsubscribe();
        }
    }

    public onGridSizeChanged(event: any) {
        if (event && event.api) {
            event.api.sizeColumnsToFit();
        }
    }

    public onAddAnnotationGridReady(params: any): void {
        this.addAnnotationGridApi = params.api;
        this.addAnnotationGridApi.setColumnDefs(this.addAnnotationColumnDefs);
        this.addAnnotationGridApi.sizeColumnsToFit();
    }

    public onRemoveAnnotationGridReady(params: any): void {
        this.removeAnnotationGridApi = params.api;
        this.removeAnnotationGridApi.setColumnDefs(this.removeAnnotationColumnDefs);
        this.removeAnnotationGridApi.sizeColumnsToFit();
    }

    public onAddAnnotationGridRowSelected(event: any): void {
        let annot = Object(this.gnomexService.getSampleProperty(event.data.idProperty));
        if (event.node.selected) {
            // this.addColumnToSampleGrid(annot); // need to remove this
            event.node.data.isSelected = 'true';
        } else {
            // this.deleteColumnFromSampleGrid(annot); // need to remove this
            event.node.data.isSelected = 'false';
        }

        if (this.removeAnnotationGridApi
            && this.addAnnotationGridApi
            && event
            && event.data) {

            this.removeAnnotationGridApi.setRowData(this.addAnnotationGridApi.getSelectedRows());
        }
    }

    public onRemoveAnnotationGridRowSelected(event: any): void {
        if (event && event.node && event.node.data) {
            let selectedRows = this.addAnnotationGridApi.getSelectedNodes();

            if (selectedRows && selectedRows.length > 0) {
                let theNode = selectedRows.find((value) => {
                    return value && value.data.idProperty === event.node.data.idProperty;
                });

                if (!!theNode) {
                    this.addAnnotationGridApi.deselectNode(theNode);
                }
            }
        }
    }

    public editAnnotations(event?: any): void {
        let configuration: MatDialogConfig = new MatDialogConfig();
        configuration.height = '80%';
        configuration.data = { orderType: OrderType.EXPERIMENT };

        let dialogRef: MatDialogRef<ConfigAnnotationDialogComponent> = this.matDialog.open(ConfigAnnotationDialogComponent, configuration);

        dialogRef.afterClosed().subscribe(() => {
            this._experiment.refreshSampleAnnotationList();
        });
    }


    // deleteColumnFromSampleGrid(annot: any) {
    //     for (let i = 0; i < this.newExperimentService.samplesGridColumnDefs.length; i++) {
    //         if (this.newExperimentService.samplesGridColumnDefs[i].headerName === annot.name) {
    //             this.newExperimentService.samplesGridColumnDefs.splice(i, 1);
    //             this.currentAnnotColumn--;
    //         }
    //     }
    //     let propName = "a" + annot.idProperty;
    //     for (let i = 0; i< this.newExperimentService.samplesGridRowData.length; i++) {
    //         delete this.newExperimentService.samplesGridRowData[i][propName];
    //     }
    // }
    //
    // // TODO : move this logic to samples grid screen(?)
    // addColumnToSampleGrid(annot: any) {
    //     let column: any;
    //     switch(annot.codePropertyType) {
    //         case annotType.CHECK :
    //             column = this.createCheckColumn(annot);
    //             break;
    //         case annotType.MOPTION :
    //             column = this.createMoptionColumn(annot);
    //             break;
    //         case annotType.OPTION :
    //             column = this.createOptionColumn(annot);
    //             break;
    //         case annotType.TEXT :
    //             column = this.createTextColumn(annot);
    //             break;
    //         case annotType.URL :
    //             column = this.createUrlColumn(annot);
    //             break;
    //     }
    //     annot.currentAnnotColumn = this.currentAnnotColumn;
    //     this.newExperimentService.samplesGridColumnDefs.splice(this.currentAnnotColumn, 0, column);
    //     // this.newExperimentService.samplesGridApi.setColumnDefs(this.newExperimentService.samplesGridColumnDefs);
    //     this.currentAnnotColumn++;
    // }
    //
    // createCheckColumn(annot: any) {
    //     return {
    //         headerName: annot.display,
    //         editable: false,
    //         checkboxEditable: true,
    //         width: 50,
    //         field: "a"+annot.idProperty,
    //         cellRendererFramework: CheckboxRenderer,
    //     };
    // }
    //
    // createTextColumn(annot: any): any {
    //     return {
    //         headerName: annot.display,
    //         field: "a"+annot.idProperty,
    //         width: 100,
    //         editable: true
    //     };
    // }
    //
    // createUrlColumn(annot: any): any {
    //     return {
    //         headerName: annot.display,
    //         editable: true,
    //         width: 150,
    //         field: "a"+annot.idProperty,
    //         cellEditorFramework: UrlAnnotEditor,
    //         cellRendererFramework: UrlAnnotRenderer,
    //         annotation: annot
    //     };
    // }
    //
    // createMoptionColumn(annot: any): any{
    //     return {
    //         headerName: annot.display,
    //         editable: true,
    //         width: 150,
    //         field: "a"+annot.idProperty,
    //         cellRendererFramework: MultiSelectRenderer,
    //         cellEditorFramework: MultiSelectEditor,
    //         selectOptions: annot.options,
    //         selectOptionsDisplayField: "option",
    //         selectOptionsValueField: "idPropertyOption",
    //         showFillButton: true,
    //         fillGroupAttribute: 'idProperty'
    //     };
    //
    // }
    //
    // createOptionColumn(annot: any): any {
    //     return {
    //         headerName: annot.display,
    //         editable: true,
    //         width: 150,
    //         field: "a" + annot.idProperty,
    //         cellRendererFramework: SelectRenderer,
    //         cellEditorFramework: SelectEditor,
    //         selectOptions: annot.options,
    //         selectOptionsDisplayField: "option",
    //         selectOptionsValueField: "idPropertyOption",
    //         showFillButton: true,
    //         fillGroupAttribute: 'idProperty'
    //     };
    // }

    onCustomAnnot(event) {
        this.dialogsService.startDefaultSpinnerDialog();
        this.currentUsers = [];
        let userObj = {idAppUser: this.newExperimentService.idAppUser};
        this.currentUsers.push(userObj);
        let params: URLSearchParams = new URLSearchParams();
        params.set("idProperty", "");
        params.set("name", this.form.get("customAnnot").value);
        params.set("isActive", "Y");
        params.set("isRequired", "N");
        params.set("forSample", "Y");
        params.set("forDataTrack", "N");
        params.set("forAnalysis", "N");
        params.set("forRequest", "N");
        params.set("idCoreFacility", this._experiment.idCoreFacility);
        params.set("idAppUser", this.newExperimentService.idAppUser);
        params.set("codePropertyType", "TEXT");
        params.set("noJSONToXMLConversionNeeded", "Y");
        params.set("optionsJSONString", JSON.stringify([]));
        params.set("organismsJSONString", JSON.stringify([]));
        params.set("platformsJSONString", JSON.stringify([]));
        params.set("analysisTypesJSONString", JSON.stringify([]));
        params.set("appUsersJSONString", JSON.stringify(this.currentUsers));

        this.propertyService.savePropertyAnnotation(params).pipe(first()).subscribe((response: Response) => {
            let error: boolean = false;

            if (response) {
                let responseJSON: any = response.json();
                if (responseJSON && responseJSON.result && responseJSON.result === "SUCCESS") {
                    if (responseJSON.inactivate === "true") {
                        this.dialogsService.confirm("Certain options were inactivated instead of deleted because they are associated with existing samples", null);
                    }
                } else {
                    error = true;
                }
            } else {
                error = true;
            }

            if (error) {
                this.dialogsService.confirm("An error occurred while saving the annotation", null);
            }

            this._experiment.refreshSampleAnnotationList();

            this.propertyService.getPropertyList(false).pipe(first()).subscribe((response: any[]) => {
                this.gnomexService.propertyList = response;
                // this.newExperimentService.buildPropertiesByUser();
                this._experiment.refreshSampleAnnotationList();
                this.dialogsService.stopAllSpinnerDialogs();
            });

        });
    }
}