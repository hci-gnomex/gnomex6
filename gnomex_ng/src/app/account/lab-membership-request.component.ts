import {Component} from "@angular/core";
import {Response} from "@angular/http";
import {MatDialogRef, MatSnackBar} from "@angular/material";
import {LabListService} from "../services/lab-list.service";
import {LabMembershipRequestService} from "../services/lab-membership-request.service";

@Component({
    selector: 'lab-membership-request',
    templateUrl: "./lab-membership-request.component.html",
})

export class LabMembershipRequestComponent {
    public labGridColumnDefs: any[];
    public labGridRowData: any[];
    private labGridApi: any;
    public showSpinner: boolean = false;

    constructor(private dialogRef: MatDialogRef<LabMembershipRequestComponent>,
                private labListService: LabListService,
                private labMembershipRequestService: LabMembershipRequestService,
                private snackBar: MatSnackBar,) {
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
        } else {
            this.dialogRef.close();
        }
    }

}
