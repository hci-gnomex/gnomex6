import {Component, Input, OnInit, SimpleChanges, ViewChild} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import {Observable} from "rxjs";
import {DataSource} from '@angular/cdk/collections';
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";
import {of} from "rxjs";
import {UserPreferencesService} from "../../services/user-preferences.service";

@Component({
    selector: 'membership-tab',
    templateUrl: './membership-tab.html',
    styles: [`
        div.form {
        display: flex;
        flex-direction: column;
        padding: 0 1%;
        }
    div.formColumn {
        display: flex;
        flex-direction: column;
        margin: 0.5% 0;
        width: 80%;
    }
        .flex-row-container {
            display: flex;
            flex-direction: row;
        }
        .flex-column-container {
            display: flex;
            flex-direction: column;
            background-color: white;
            height: 100%;
        }
        .users-groups-row-one {
            display: flex;
            flex-grow: 1;
        }
        .highlight{
            background: deepskyblue;
        }
        mat-form-field.halfFormField {
            width: 50%;
            margin: 0 0.5%;

        }
        mat-form-field.fortyFormField {
            width: 40%;
            margin: 0 0.5%;

        }
        mat-form-field.thirtyFormField {
            width: 30%;
            margin: 0 0.5%;

        }
    .formField {
        width: 50%;
        margin: 0 0.5%;
    }
    .billing-admin-row-one {
        display: flex;
        flex-grow: 1;
    }
    .flex-container{

        display: flex;
        justify-content: space-between;
        margin-left: auto;
        margin-top: 1em;
        padding-left: 1em;
    }
    .edit-button {
        color: blue;
        
    }
        .example-container {
            display: flex;
            flex-direction: column;
            max-height: 500px;
            min-width: 300px;
        }

        .mat-table {
            overflow: auto;
            max-height: 500px;
        }
    `]
})

export class MembershipTabComponent implements OnInit {
    @Input()
    memberGroup: any;

    @Input()
    users: any[];

    public membershipForm: FormGroup;
    private showSpinner: boolean = false;
    private displayedColumns = ['name'];
    public membersDataSource: MyDataSource;
    public managersDataSource: MyDataSource;
    public collaboratorsDataSource: MyDataSource;
    private selectedMemberRowIndex: number = -1;
    private selectedCollRowIndex: number = -1;
    private selectedManRowIndex: number = -1;
    private memberUser: string;
    private collUser: string;
    private manUser: string;
    private membersFC: FormControl;
    private collaboratorsFC: FormControl;
    private managersFC: FormControl;
    private showInactive: boolean = false;
    constructor(private securityAdvisor: CreateSecurityAdvisorService,
                public prefService: UserPreferencesService) {

    }

    ngOnInit() {
        this.membersDataSource = new MyDataSource(this.arrayize(this.memberGroup.members), this.prefService);
        this.managersDataSource = new MyDataSource(this.arrayize(this.memberGroup.managers), this.prefService);
        this.collaboratorsDataSource = new MyDataSource(this.arrayize(this.memberGroup.collaborators), this.prefService);
        this.filterByInactive();
        this.createMembershipForm();
        this.resetFields();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.membershipForm) {
            if (changes['memberGroup']) {
                this.resetFields();
            }
        }
        this.membersDataSource = new MyDataSource(this.arrayize(this.memberGroup.members), this.prefService);
        this.managersDataSource = new MyDataSource(this.arrayize(this.memberGroup.managers), this.prefService);
        this.collaboratorsDataSource = new MyDataSource(this.arrayize(this.memberGroup.collaborators), this.prefService);
        this.filterByInactive();
    }

    ngAfterViewInit() {
    }

    filterByInactive() {
        if (this.showInactive) {
            this.membersDataSource = new MyDataSource(this.arrayize(this.memberGroup.members), this.prefService);
            this.managersDataSource = new MyDataSource(this.arrayize(this.memberGroup.managers), this.prefService);
            this.collaboratorsDataSource = new MyDataSource(this.arrayize(this.memberGroup.collaborators), this.prefService);
        } else {
            this.membersDataSource.data = this.membersDataSource.data.filter((row => row.isActive === 'Y'));
            this.membersDataSource = new MyDataSource(this.membersDataSource.data, this.prefService);
            this.collaboratorsDataSource.data = this.collaboratorsDataSource.data.filter((row => row.isActive === 'Y'));
            this.collaboratorsDataSource = new MyDataSource(this.collaboratorsDataSource.data, this.prefService);
            this.managersDataSource.data = this.managersDataSource.data.filter((row => row.isActive === 'Y'));
            this.managersDataSource = new MyDataSource(this.managersDataSource.data, this.prefService);
        }
    }

    onShowInactiveChange(event: any) {
        this.filterByInactive();
    }

    resetFields() {
        this.membershipForm.markAsPristine();
        this.selectedMemberRowIndex = -1;
        this.selectedCollRowIndex = -1;
        this.selectedManRowIndex = -1;
    }

    createMembershipForm() {
        this.membersFC = new FormControl("");
        this.collaboratorsFC = new FormControl("");
        this.managersFC = new FormControl("");
        this.membershipForm = new FormGroup({
            members: this.membersFC,
            collaborators: this.collaboratorsFC,
            managers: this.managersFC
        });
    }

    arrayize(obj: any): any {
        if (!this.securityAdvisor.isArray(obj)) {
            obj = [obj.AppUser];
        }
        return obj;
    }

    selectMemberRow(row: any) {
        this.selectedMemberRowIndex = row.idAppUser;
    }

    selectCollRow(row: any) {
        this.selectedCollRowIndex = row.idAppUser;
    }

    selectManRow(row: any) {
        this.selectedManRowIndex = row.idAppUser;
    }

    addUser(userType: string) {
        switch(userType) {
            case "member": {
                if (!this.sourceHasItem(this.membersDataSource.data, this.memberUser)) {
                    this.membershipForm.controls['members'].markAsDirty();
                    let addedMember = this.users.filter((row => row[this.prefService.userDisplayField] === this.memberUser));
                    this.membersDataSource.data = this.membersDataSource.data.concat(addedMember);
                    this.membersDataSource = new MyDataSource(this.membersDataSource.data, this.prefService);
                }
                this.memberUser = "";
                break;
            }
            case "collaborator": {
                if (!this.sourceHasItem(this.collaboratorsDataSource.data, this.collUser)) {
                    this.membershipForm.controls['collaborators'].markAsDirty();
                    let addedMember = this.users.filter((row => row[this.prefService.userDisplayField] === this.collUser));
                    this.collaboratorsDataSource.data = this.collaboratorsDataSource.data.concat(addedMember);
                    this.collaboratorsDataSource = new MyDataSource(this.collaboratorsDataSource.data, this.prefService);
                }
                this.collUser = "";
                break;
            }
            case "manager": {
                if (!this.sourceHasItem(this.managersDataSource.data, this.manUser)) {
                    this.membershipForm.controls['managers'].markAsDirty();
                    let addedMember = this.users.filter((row => row[this.prefService.userDisplayField] === this.manUser));
                    this.managersDataSource.data = this.managersDataSource.data.concat(addedMember);
                    this.managersDataSource = new MyDataSource(this.managersDataSource.data, this.prefService);
                }
                this.manUser = "";
                break;
            }
        }
    }

    sourceHasItem(source: any[], name: string): boolean {
        let found: boolean = false;
        for (let item of source) {
            if (item[this.prefService.userDisplayField] === name) {
                found = true;
                break;
            }
        }
        return found;
    }

    deleteUser(userType: string) {
        switch(userType) {
            case "member": {
                this.membershipForm.controls['members'].markAsDirty();
                this.membersDataSource.data = this.membersDataSource.data.filter((row => row.idAppUser !== this.selectedMemberRowIndex));
                this.membersDataSource = new MyDataSource(this.membersDataSource.data, this.prefService);
                this.selectedMemberRowIndex = -1;
                break;
            }
            case "collaborator": {
                this.membershipForm.controls['collaborators'].markAsDirty();
                this.collaboratorsDataSource.data = this.collaboratorsDataSource.data.filter((row => row.idAppUser !== this.selectedCollRowIndex));
                this.collaboratorsDataSource = new MyDataSource(this.collaboratorsDataSource.data, this.prefService);
                this.selectedCollRowIndex = -1;
                break;
            }
            case "manager": {
                this.membershipForm.controls['managers'].markAsDirty();
                this.managersDataSource.data = this.managersDataSource.data.filter((row => row.idAppUser !== this.selectedManRowIndex));
                this.managersDataSource = new MyDataSource(this.managersDataSource.data, this.prefService);
                this.selectedManRowIndex = -1;
                break;
            }
        }
    }

}

export class MyDataSource extends DataSource<any> {
    constructor(public data: any[],
                public prefService: UserPreferencesService) {
        super();
    }

    connect(): Observable<any[]> {
        return of(this.data.sort((a, b) => {
            if (a[this.prefService.userDisplayField] < b[this.prefService.userDisplayField]) return -1;
            else if (a[this.prefService.userDisplayField] > b[this.prefService.userDisplayField]) return 1;
            else {
                return 0;
            }
        }));
    }

    disconnect() {}
}

