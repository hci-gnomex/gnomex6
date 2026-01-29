import {Component, Inject, OnInit} from "@angular/core";
import {IconLinkButtonRenderer} from "../../../util/grid-renderers/icon-link-button.renderer";
import {DateRenderer} from "../../../util/grid-renderers/date.renderer";
import {DateParserComponent} from "../../../util/parsers/date-parser.component";
import {TextAlignLeftMiddleRenderer} from "../../../util/grid-renderers/text-align-left-middle.renderer";
import {CheckboxRenderer} from "../../../util/grid-renderers/checkbox.renderer";
import {SelectRenderer} from "../../../util/grid-renderers/select.renderer";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";

import * as _ from "lodash";
import {UploadViewRemoveRenderer} from "../../../util/grid-renderers/upload-view-remove.renderer";
import {BaseGenericContainerDialog} from "../../../util/popup/base-generic-container-dialog";

@Component({
    selector: 'copy-accounts-dialog',
    templateUrl: './copy-accounts-dialog.component.html',
    styles: [`
        .vertical-spacer {
            height: 0.3em;
        }

        .fixed-height {
            height: 30em;
        }

        .small-font {
            font-size: x-small;
        }
    `]
})
export class CopyAccountsDialogComponent extends BaseGenericContainerDialog implements OnInit {

    context: any;

    private chartfieldGridApi: any;
    private chartfieldGridColumnApi: any;

    private poGridApi: any;
    private poGridColumnApi: any;

    private creditCardGridApi: any;
    private creditCardGridColumnApi: any;

    private usesCustomChartfields: string = 'N';

    private includeInCustomField_startDate: string = 'N';
    private includeInCustomField_expirationDate: string = 'N';

    private internalAccountFieldsConfiguration: any[] = [];

    private readonly creditCardCompanies: any[] = [];
    private readonly coreFacilities: any[] = [];

    private readonly selectedCoreFacility: any;

    private readonly labInfo: any;

    constructor(private dialogRef: MatDialogRef<CopyAccountsDialogComponent>,
                @Inject(MAT_DIALOG_DATA) private data) {
        super();
        if (data) {
            this.labInfo = data.labInfo;
            this.creditCardCompanies = data.creditCardCompanies;
            this.selectedCoreFacility = data.selectedCoreFacility;
            this.coreFacilities = data.coreFacilities;
        }
    }

    ngOnInit(): void {
        this.context = this;
        this.innerTitle = this.selectedCoreFacility ? "Copy Billing Account to " + this.selectedCoreFacility.display : "Copy Billing Account";
    }

    // Cell size calculations
    //          50	400	700	800	900	1400	1500
    //  chart	50	350	300	100	100	500	100
    //      50	400	700	800	900	1400	1500
    //  po	50	350	300	100	100	500	100
    //      50	400	700	900	1150	1400	1500
    //  cc	50	350	300	200	250	250	100

    private get chartfieldColumnDefs(): any[] {
        let columnDefinitions = [];

        columnDefinitions.push({
            checkboxSelection: true,
            headerCheckboxSelection: true,
            width: 50
        });
        columnDefinitions.push({
            headerName: "Account name",
            editable: false,
            width: 350,
            cellRendererFramework: IconLinkButtonRenderer,
            icon: "./assets/pricesheet.png",
            field: "accountName"
        });
        columnDefinitions.push({
            headerName: "Core Facility",
            editable: false,
            width: 300,
            field: "idCoreFacility",
            cellRendererFramework: SelectRenderer,
            selectOptions: this.coreFacilities,
            selectOptionsDisplayField: "display",
            selectOptionsValueField: "idCoreFacility"
        });

        if (this.usesCustomChartfields === 'Y') {
            if (this.includeInCustomField_startDate) {
                columnDefinitions.push({
                    headerName: "Starts",
                    editable: false,
                    width: 100,
                    cellRendererFramework: DateRenderer,
                    dateParser: new DateParserComponent("YYYY-MM-DD", "MM/DD/YYYY"),
                    field: "startDate"
                });
            }
            if (this.includeInCustomField_expirationDate) {
                columnDefinitions.push({
                    headerName: "Expires",
                    editable: false,
                    width: 100,
                    cellRendererFramework: DateRenderer,
                    dateParser: new DateParserComponent("YYYY-MM-DD", "MM/DD/YYYY"),
                    field: "expirationDate"
                });
            }

            if (Array.isArray(this.internalAccountFieldsConfiguration)) {
                for (let item of this.internalAccountFieldsConfiguration) {
                    if(item.include && item.include.toLowerCase() !== 'n') {
                        let fieldName: string = "";

                        switch(item.fieldName) {
                            case 'project' : fieldName = 'accountNumberProject'; break;
                            case 'account' : fieldName = 'accountNumberAccount'; break;
                            case 'custom1' : fieldName = 'custom1'; break;
                            case 'custom2' : fieldName = 'custom2'; break;
                            case 'custom3' : fieldName = 'custom3'; break;
                            default : // do nothing.
                        }

                        columnDefinitions.push({
                            headerName: item.displayName,
                            editable: false,
                            width: 100,
                            cellRendererFramework: TextAlignLeftMiddleRenderer,
                            field: fieldName
                        });
                    }
                }
            }
        } else {
            columnDefinitions.push({
                headerName: "Starts",
                editable: false,
                width: 100,
                cellRendererFramework: DateRenderer,
                dateParser: new DateParserComponent("YYYY-MM-DD", "MM/DD/YYYY"),
                field: "startDate"
            });
            columnDefinitions.push({
                headerName: "Expires",
                editable: false,
                width: 100,
                cellRendererFramework: DateRenderer,
                dateParser: new DateParserComponent("YYYY-MM-DD", "MM/DD/YYYY"),
                field: "expirationDate"
            });
            columnDefinitions.push({
                headerName: "Bus",
                editable: false,
                width: 55,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                field: "accountNumberBus"
            });
            columnDefinitions.push({
                headerName: "Org",
                editable: false,
                width: 75,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                field: "accountNumberOrg"
            });
            columnDefinitions.push({
                headerName: "Fund",
                editable: false,
                width: 65,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                field: "accountNumberFund"
            });
            columnDefinitions.push({
                headerName: "Activity",
                editable: false,
                width: 75,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                field: "accountNumberActivity"
            });
            columnDefinitions.push({
                headerName: "Project",
                editable: false,
                width: 100,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                field: "accountNumberProject"
            });
            columnDefinitions.push({
                headerName: "Acct",
                editable: false,
                width: 75,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                field: "accountNumberAccount"
            });
            columnDefinitions.push({
                headerName: "AU",
                editable: false,
                width: 55,
                cellRendererFramework: TextAlignLeftMiddleRenderer,
                field: "accountNumberAu"
            });
        }

        columnDefinitions.push({
            headerName: "Active",
            editable: false,
            width: 100,
            cellRendererFramework: CheckboxRenderer,
            field: "activeAccount"
        });

        return columnDefinitions;
    }
    private get poColumnDefs(): any[] {
        let columnDefinitions = [];

        columnDefinitions.push({
            checkboxSelection: true,
            headerCheckboxSelection: true,
            width: 50
        });
        columnDefinitions.push({
            headerName: "PO",
            editable: false,
            width: 350,
            cellRendererFramework: IconLinkButtonRenderer,
            icon: "./assets/email_open.png",
            field: "accountName"
        });
        columnDefinitions.push({
            headerName: "Core Facility",
            editable: false,
            width: 300,
            field: "idCoreFacility",
            cellRendererFramework: SelectRenderer,
            selectOptions: this.coreFacilities,
            selectOptionsDisplayField: "display",
            selectOptionsValueField: "idCoreFacility"
        });
        columnDefinitions.push({
            headerName: "Starts",
            editable: false,
            width: 100,
            cellRendererFramework: DateRenderer,
            dateParser: new DateParserComponent("YYYY-MM-DD", "MM/DD/YYYY"),
            field: "startDate"
        });
        columnDefinitions.push({
            headerName: "Expires",
            editable: false,
            width: 100,
            cellRendererFramework: DateRenderer,
            dateParser: new DateParserComponent("YYYY-MM-DD", "MM/DD/YYYY"),
            field: "expirationDate"
        });
        columnDefinitions.push({
            headerName: "Purchase Order Form",
            editable:  false,
            cellRendererFramework: UploadViewRemoveRenderer,
            disableEdit: true,
            width: 500,
            field: "purchaseOrderForm"
        });
        columnDefinitions.push({
            headerName: "Active",
            editable: false,
            width:  100,
            field: "activeAccount",
            cellRendererFramework: CheckboxRenderer
        });

        return columnDefinitions;
    }
    private get creditCardColumnDefs(): any[] {
        let columnDefinitions = [];

        columnDefinitions.push({
            checkboxSelection: true,
            headerCheckboxSelection: true,
            width: 50
        });
        columnDefinitions.push({
            headerName: "Credit Card Last 4 digits",
            editable: false,
            width: 350,
            cellRendererFramework: IconLinkButtonRenderer,
            icon: "./assets/creditcards.png",
            field: "accountName"
        });
        columnDefinitions.push({
            headerName: "Core Facility",
            editable: false,
            width: 300,
            field: "idCoreFacility",
            cellRendererFramework: SelectRenderer,
            selectOptions: this.coreFacilities,
            selectOptionsDisplayField: "display",
            selectOptionsValueField: "idCoreFacility"
        });
        columnDefinitions.push({
            headerName: "Expires",
            editable: false,
            width: 200,
            cellRendererFramework: DateRenderer,
            dateParser: new DateParserComponent("YYYY-MM-DD", "MM/DD/YYYY"),
            field: "expirationDate"
        });
        columnDefinitions.push({
            headerName: "Credit Card Company",
            editable: false,
            width: 250,
            field: "idCreditCardCompany",
            cellRendererFramework: SelectRenderer,
            selectOptions: this.creditCardCompanies,
            selectOptionsDisplayField: "display",
            selectOptionsValueField: "idCreditCardCompany"
        });
        columnDefinitions.push({
            headerName: "Zip",
            editable: false,
            width: 250,
            field: "zipCode"
        });
        columnDefinitions.push({
            headerName: "Active",
            editable: false,
            width:  100,
            field: "activeAccount",
            cellRendererFramework: CheckboxRenderer
        });

        return columnDefinitions;
    }

    private assignChartfieldGridContents() {
        if (this.chartfieldGridApi) {
            // Because the filtering can be time intensive, it is important to make local variables to
            // store this information, so that we don't get null pointer exceptions if users click between labs quickly.
            let shownGridData;

            if (this.labInfo) {

                shownGridData = _.cloneDeep(this.labInfo.internalBillingAccounts);

                if (!shownGridData) {
                    shownGridData = [];
                } else if (!Array.isArray(shownGridData)) {
                    shownGridData = [ shownGridData.BillingAccount ];
                }
            } else {
                shownGridData = [];
            }

            this.chartfieldGridApi.setRowData(shownGridData);
            this.chartfieldGridApi.setColumnDefs(this.chartfieldColumnDefs);
            this.chartfieldGridApi.sizeColumnsToFit();
        }
    }
    private assignPoGridContents() {
        if (this.poGridApi) {
            // Because the filtering can be time intensive, it is important to make local variables to
            // store this information, so that we don't get null pointer exceptions if users click between labs quickly.
            let shownGridData;

            if (this.labInfo) {

                shownGridData = _.cloneDeep(this.labInfo.pOBillingAccounts);

                if (!shownGridData) {
                    shownGridData = [];
                } else if (!Array.isArray(shownGridData)) {
                    shownGridData = [ shownGridData.BillingAccount ];
                }
            } else {
                shownGridData = [];
            }

            this.poGridApi.setRowData(shownGridData);
            this.poGridApi.setColumnDefs(this.poColumnDefs);
            this.poGridApi.sizeColumnsToFit();
        }
    }
    private assignCreditCardGridContents() {
        if (this.creditCardGridApi) {
            // because the filtering can be time intensive, it is important to make local variables to
            // store this information, so that we don't get null pointer exceptions if users click between labs quickly.
            let shownGridData;

            if (this.labInfo) {

                shownGridData = _.cloneDeep(this.labInfo.creditCardBillingAccounts);

                if (!shownGridData) {
                    shownGridData = [];
                } else if (!Array.isArray(shownGridData)) {
                    shownGridData = [ shownGridData.BillingAccount ];
                }
            } else {
                shownGridData = [];
            }

            this.creditCardGridApi.setColumnDefs(this.creditCardColumnDefs);
            this.creditCardGridApi.setRowData(shownGridData);
            this.creditCardGridApi.sizeColumnsToFit();
        }
    }

    onClickSaveButton(): void {

        let chartfieldAccountRowsToCopy: any[] = [];
        let poAccountRowsToCopy: any[] = [];
        let creditCardAccountRowsToCopy: any[] = [];

        if (this.chartfieldGridApi) {
            chartfieldAccountRowsToCopy = this.chartfieldGridApi.getSelectedRows();
        }
        if (this.poGridApi) {
            poAccountRowsToCopy = this.poGridApi.getSelectedRows();
        }
        if (this.creditCardGridApi) {
            creditCardAccountRowsToCopy = this.creditCardGridApi.getSelectedRows();
        }

        if (this.selectedCoreFacility) {
            for (let account of chartfieldAccountRowsToCopy) {
                account.idCoreFacility = this.selectedCoreFacility.value;
            }
            for (let account of poAccountRowsToCopy) {
                account.idCoreFacility = this.selectedCoreFacility.value;
            }
            for (let account of creditCardAccountRowsToCopy) {
                account.idCoreFacility = this.selectedCoreFacility.value;
            }
        }

        this.dialogRef.close({
            chartfieldAccountRowsToCopy: chartfieldAccountRowsToCopy,
            poAccountRowsToCopy:         poAccountRowsToCopy,
            creditCardAccountRowsToCopy: creditCardAccountRowsToCopy
        });
    }

    onGridSizeChanged(event: any): void {
        if (event && event.api) {
            event.api.sizeColumnsToFit();
        }
    }

    onChartfieldGridReady(event: any): void {
        this.chartfieldGridApi = event.api;
        this.chartfieldGridColumnApi = event.columnApi;

        this.assignChartfieldGridContents();
        this.onGridSizeChanged(event);
        this.chartfieldGridApi.hideOverlay();
    }
    onPoGridReady(event: any): void {
        this.poGridApi = event.api;
        this.poGridColumnApi = event.columnApi;

        // set the data
        this.assignPoGridContents();
        this.onGridSizeChanged(event);
        this.poGridApi.hideOverlay();
    }
    onCreditCardGridReady(event: any): void {
        this.creditCardGridApi = event.api;
        this.creditCardGridColumnApi = event.columnApi;

        // set the data
        this.assignCreditCardGridContents();
        this.onGridSizeChanged(event);
        this.creditCardGridApi.hideOverlay();
    }
}
