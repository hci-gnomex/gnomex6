import {Component} from "@angular/core";
import {Response} from "@angular/http";
import {MatDialogRef, MatSnackBar} from "@angular/material";
import {LabListService} from "../services/lab-list.service";
import {LabMembershipRequestService} from "../services/lab-membership-request.service";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";
import {GDAction} from "../util/interfaces/generic-dialog-action.model";

@Component({
    selector: 'lab-membership-request',
    template: `
        <div class="double-padded full-width">
            <ag-grid-angular style="width: 460px; height: 400px;"
                             class="ag-theme-fresh"
                             [enableFilter]="true"
                             (gridReady)="this.onLabGridReady($event)"
                             [rowSelection]="'multiple'"
                             [rowData]="this.labGridRowData"
                             [columnDefs]="this.labGridColumnDefs">
            </ag-grid-angular>
        </div>
    `,
})

export class LabMembershipRequestComponent extends BaseGenericContainerDialog {
    public primaryDisable: (action?: GDAction) => boolean;
    public labGridColumnDefs: any[];
    public labGridRowData: any[];
    private labGridApi: any;

    constructor(private dialogRef: MatDialogRef<LabMembershipRequestComponent>,
                private labListService: LabListService,
                private labMembershipRequestService: LabMembershipRequestService,
                private snackBar: MatSnackBar) {
        super();
        this.labGridColumnDefs = [
            {headerName: "Group", field: "name", checkboxSelection: true, headerCheckboxSelection: false, width: 100},
        ];
        this.labGridRowData = [];

        this.labListService.getAllLabs().subscribe((response: any[]) => {
            this.labGridRowData = response.filter((lab: any) => {
                return lab.isMyLab === "N";
            });
        });
    }

    public onLabGridReady(params: any): void {
        this.labGridApi = params.api;
        this.labGridApi.sizeColumnsToFit();
        this.primaryDisable = (action) => {
            return this.labGridApi.getSelectedRows().length < 1;
        };
    }

    public request(): void {
        let selectedLabs: any[] = this.labGridApi.getSelectedRows();
        if (selectedLabs.length > 0) {
            this.showSpinner = true;
            let idLabs: string = "";
            for (let i = 0; i < selectedLabs.length; i++) {
                idLabs += selectedLabs[i].idLab + ",";
            }
            idLabs = idLabs.substring(0, idLabs.lastIndexOf(","));
            this.labMembershipRequestService.requestLabMembership(idLabs).subscribe((response: Response) => {
                this.showSpinner = false;
                if (response.status === 200) {
                    let responseJSON: any = response.json();
                    if (responseJSON.result && responseJSON.result === "SUCCESS") {
                        this.snackBar.open("Request(s) Sent", "Lab Membership", {
                            duration: 5000,
                        });
                        this.dialogRef.close();
                    }
                }
            });
        }
    }

}
