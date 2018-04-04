import {Component, Input, OnInit, SimpleChanges, ViewChild} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import {MatAutocomplete} from "@angular/material";
import {Observable} from "rxjs/Observable";
import {DataSource} from '@angular/cdk/collections';
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";

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
    mat-form-field.formField {
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

    // @ViewChild(MatAutocomplete) matAutocomplete: MatAutocomplete;
    @ViewChild("autoMem") memAutoComplete: MatAutocomplete;
    @ViewChild("autoColl") collAutoComplete: MatAutocomplete;
    @ViewChild("autoMan") manAutoComplete: MatAutocomplete;

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
    constructor(private securityAdvisor: CreateSecurityAdvisorService) {

    }

    ngOnInit() {
        this.membersDataSource = new MyDataSource(this.arrayize(this.memberGroup.members));
        this.managersDataSource = new MyDataSource(this.arrayize(this.memberGroup.managers));
        this.collaboratorsDataSource = new MyDataSource(this.arrayize(this.memberGroup.collaborators));
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
        this.membersDataSource = new MyDataSource(this.arrayize(this.memberGroup.members));
        this.managersDataSource = new MyDataSource(this.arrayize(this.memberGroup.managers));
        this.collaboratorsDataSource = new MyDataSource(this.arrayize(this.memberGroup.collaborators));
        this.filterByInactive();
    }

    ngAfterViewInit() {
    }

    filterByInactive() {
        if (this.showInactive) {
            this.membersDataSource = new MyDataSource(this.arrayize(this.memberGroup.members));
            this.managersDataSource = new MyDataSource(this.arrayize(this.memberGroup.managers));
            this.collaboratorsDataSource = new MyDataSource(this.arrayize(this.memberGroup.collaborators));
        } else {
            this.membersDataSource.data = this.membersDataSource.data.filter((row => row.isActive === 'Y'));
            this.membersDataSource = new MyDataSource(this.membersDataSource.data);
            this.collaboratorsDataSource.data = this.collaboratorsDataSource.data.filter((row => row.isActive === 'Y'));
            this.collaboratorsDataSource = new MyDataSource(this.collaboratorsDataSource.data);
            this.managersDataSource.data = this.managersDataSource.data.filter((row => row.isActive === 'Y'));
            this.managersDataSource = new MyDataSource(this.managersDataSource.data);
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

    filterUsers(name: any): any[] {
        let fUsers: any[];
        if (name) {
            fUsers = this.users.filter(user =>
                user.displayName.toLowerCase().indexOf(name.toLowerCase()) >= 0);
            return fUsers;
        } else {
            return this.users;
        }
    }

    addUser(userType: string) {
        switch(userType) {
            case "member": {
                if (!this.sourceHasItem(this.membersDataSource.data, this.memberUser)) {
                    this.membershipForm.controls['members'].markAsDirty();
                    let addedMember = this.users.filter((row => row.displayName === this.memberUser));
                    this.membersDataSource.data = this.membersDataSource.data.concat(addedMember);
                    this.membersDataSource = new MyDataSource(this.membersDataSource.data);
                }
                this.memberUser = "";
                break;
            }
            case "collaborator": {
                if (!this.sourceHasItem(this.collaboratorsDataSource.data, this.collUser)) {
                    this.membershipForm.controls['collaborators'].markAsDirty();
                    let addedMember = this.users.filter((row => row.displayName === this.collUser));
                    this.collaboratorsDataSource.data = this.collaboratorsDataSource.data.concat(addedMember);
                    this.collaboratorsDataSource = new MyDataSource(this.collaboratorsDataSource.data);
                }
                this.collUser = "";
                break;
            }
            case "manager": {
                if (!this.sourceHasItem(this.managersDataSource.data, this.manUser)) {
                    this.membershipForm.controls['managers'].markAsDirty();
                    let addedMember = this.users.filter((row => row.displayName === this.manUser));
                    this.managersDataSource.data = this.managersDataSource.data.concat(addedMember);
                    this.managersDataSource = new MyDataSource(this.managersDataSource.data);
                }
                this.manUser = "";
                break;
            }
        }
    }

    sourceHasItem(source: any[], name: string): boolean {
        let found: boolean = false;
        for (let item of source) {
            if (item.displayName === name) {
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
                this.membersDataSource = new MyDataSource(this.membersDataSource.data);
                this.selectedMemberRowIndex = -1;
                break;
            }
            case "collaborator": {
                this.membershipForm.controls['collaborators'].markAsDirty();
                this.collaboratorsDataSource.data = this.collaboratorsDataSource.data.filter((row => row.idAppUser !== this.selectedCollRowIndex));
                this.collaboratorsDataSource = new MyDataSource(this.collaboratorsDataSource.data);
                this.selectedCollRowIndex = -1;
                break;
            }
            case "manager": {
                this.membershipForm.controls['managers'].markAsDirty();
                this.managersDataSource.data = this.managersDataSource.data.filter((row => row.idAppUser !== this.selectedManRowIndex));
                this.managersDataSource = new MyDataSource(this.managersDataSource.data);
                this.selectedManRowIndex = -1;
                break;
            }
        }
    }

    highlightMemFirstOption(event): void {
        if (event.key == "ArrowDown" || event.key == "ArrowUp") {
            return;
        }
        if (this.memAutoComplete.options.first) {
            this.memAutoComplete.options.first.setActiveStyles();
        }
    }

    highlightCollFirstOption(event): void {
        if (event.key == "ArrowDown" || event.key == "ArrowUp") {
            return;
        }
        if (this.collAutoComplete.options.first) {
            this.collAutoComplete.options.first.setActiveStyles();
        }
    }

    highlightManFirstOption(event): void {
        if (event.key == "ArrowDown" || event.key == "ArrowUp") {
            return;
        }
        if (this.manAutoComplete.options.first) {
            this.manAutoComplete.options.first.setActiveStyles();
        }
    }


    selectOption(event) {
        this.memberUser = event.value;
    }

    selectCollOption(event) {
        this.collUser = event.value;
    }

    selectManOption(event) {
        this.collUser = event.value;
    }

    chooseFirstMemOption(): void {
        this.memAutoComplete.options.first.select();
    }

    chooseFirstCollOption(): void {
        this.collAutoComplete.options.first.select();
    }

    chooseFirstManOption(): void {
        this.manAutoComplete.options.first.select();
    }
}

export class MyDataSource extends DataSource<any> {
    constructor(public data: any[]) {
        super();
    }

    connect(): Observable<any[]> {
        return Observable.of(this.data.sort((a, b) => {
            if (a.displayName < b.displayName) return -1;
            else if (a.displayName > b.displayName) return 1;
            else {
                return 0;
            }
        }));
    }

    disconnect() {}
}

