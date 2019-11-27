import {Component, Inject, OnInit} from "@angular/core";
import {HttpParams} from "@angular/common/http";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material";
import {UserService} from "../services/user.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";
import {IGnomexErrorResponse} from "../util/interfaces/gnomex-error.response.model";

@Component({
    selector: "delete-user-dialog",
    template: `
        <div class="padded">
            <p>Delete {{userName}}?</p>
        </div>
    `,
})

export class DeleteUserDialogComponent extends BaseGenericContainerDialog implements OnInit {

    public userName: string = "";
    private readonly idAppUser: string = "";

    constructor(public dialogRef: MatDialogRef<DeleteUserDialogComponent>,
                private dialogsService: DialogsService,
                private userService: UserService,
                @Inject(MAT_DIALOG_DATA) private data: any) {
        super();
        this.idAppUser = data.idAppUser;
        this.userName = data.userName;
    }

    ngOnInit() {
    }

    public delete(): void {
        this.showSpinner = true;
        let params: HttpParams = new HttpParams()
            .set("idAppUser", this.idAppUser);

        this.userService.deleteAppUser(params).subscribe((response: any) => {
            this.showSpinner = false;
            this.dialogRef.close(true);
        }, (err: IGnomexErrorResponse) => {
            this.showSpinner = false;
        });
    }


}
