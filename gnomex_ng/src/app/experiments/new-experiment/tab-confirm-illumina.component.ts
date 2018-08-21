import {Component, OnInit} from "@angular/core";
import {DictionaryService} from "../../services/dictionary.service";
import {NewExperimentService} from "../../services/new-experiment.service";
import {AnnotationTabComponent, OrderType} from "../../util/annotation-tab.component";
import {MatDialog} from "@angular/material";
import {BrowseOrderValidateService} from "../../services/browse-order-validate.service";
import {FormBuilder, FormGroup} from "@angular/forms";
import {CreateSecurityAdvisorService} from "../../services/create-security-advisor.service";

@Component({
    selector: "tabConfirmIllumina",
    templateUrl: "./tab-confirm-illumina.html",
    styles: [`
        .confirm-instructions {
            background-color: lightyellow;
            width: 25%;
            font-size: 80%;
        }
    `]
})

export class TabConfirmIlluminaComponent implements OnInit {
    private form: FormGroup;
    private submitterName: string;
    private labName: string;
    private billingAccountName: string;
    private billingAccountNumber: string;
    private preppedByClient: boolean = false;
    private clientPrepString: string = "Library Prepared By Client";
    private protoName: string;

    constructor(private dictionaryService: DictionaryService,
                private newExperimentService: NewExperimentService,
                private securityAdvisor: CreateSecurityAdvisorService,
                private fb: FormBuilder
    ) {
    }

    ngOnInit() {
        this.newExperimentService.ownerChanged.subscribe((value) => {
            if (this.newExperimentService.ownerChanged.value === true) {
                this.newExperimentService.ownerChanged.next(false);
            }
            this.submitterName = this.newExperimentService.getSubmitterName();
        });
        this.newExperimentService.labChanged.subscribe((value) => {
            if (this.newExperimentService.labChanged.value === true) {
                this.newExperimentService.labChanged.next(false);
            }
            if (this.newExperimentService.lab) {
                this.labName = this.newExperimentService.lab.nameFirstLast;
            }
        });
        this.newExperimentService.protoChanged.subscribe((value) => {
            if (this.newExperimentService.protoChanged.value === true) {
                this.newExperimentService.protoChanged.next(false);
            }
            if (this.newExperimentService.selectedProto) {
                this.protoName = this.newExperimentService.selectedProto.display;
            }
        });
        this.newExperimentService.preppedChanged.subscribe((value) => {
            if (this.newExperimentService.preppedChanged.value === true) {
                this.newExperimentService.preppedChanged.next(false);
            }
            this.preppedByClient = this.newExperimentService.preppedByClient;
            this.setClientPrepString();
        });
        this.newExperimentService.accountChanged.subscribe((value) => {
            if (this.newExperimentService.accountChanged.value === true) {
                this.newExperimentService.accountChanged.next(false);
            }
            if (this.newExperimentService.billingAccount) {
                this.billingAccountName = this.newExperimentService.billingAccount.accountName;
                this.billingAccountNumber = this.newExperimentService.billingAccount.accountNumber;
            }
        });

        this.form = this.fb.group({
        });

    }

    setClientPrepString() {
        if (this.preppedByClient) {

        }
    }
}