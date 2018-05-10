import {
    AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, ElementRef, OnInit, ViewChild
} from "@angular/core";
import {MatSidenav} from "@angular/material";
import {ActivatedRoute} from "@angular/router";
import {QcWorkflowComponent} from "./qc-workflow.component";
import {LibprepWorkflowComponent} from "./libprep-workflow.component";
import {GnomexService} from "../services/gnomex.service";
import {LibprepQcWorkflowComponent} from "./libprepqc-workflow.component";

@Component({
    selector: 'workflow',
    templateUrl: 'workflow.html',
    styles: [`
        .flex-column-container {
            display: flex;
            flex-direction: column;
            background-color: white;
            height: 100%;
            width: 100%;
        }
        .sidenav-container {
            height: 100%;
        }
        .workflow {
            display: flex;
            height: 95%;
        }
        .sidebutton {
            height: 5%;
            background-color: white;
        }
        #groupTabGroup ::ng-deep.mat-tab-label, ::ng-deep.mat-tab-label-active{
            width: 25%;
            min-width: 0;
            padding: 3px;
            margin: 3px;
        }
    `]
})

export class WorkflowComponent implements OnInit, AfterViewInit {
    @ViewChild('sidenav') sidenav: MatSidenav;
    @ViewChild('qcWorkflow') qcWorkflow: QcWorkflowComponent;
    @ViewChild('libPrepWorkflow') libPrepWorkflow: LibprepWorkflowComponent;
    @ViewChild('libPrepQcWorkflow') libPrepQcWorkflow: LibprepQcWorkflowComponent;

    private showNav: boolean = true;
    private codeStepNext: any = 'QC';
    private selectedTab = 0;
    private resetTab = 0;
    private combinedQCTabItems: any[] = [];
    constructor(private route: ActivatedRoute,
                private gnomexService: GnomexService,
                private changeRef:ChangeDetectorRef) {

    }

    ngOnInit() {
        this.sidenav.open();
        this.route
            .data
            .subscribe(v => {
                console.log(v);
                this.codeStepNext = v.codeStepNext;
            });
        this.buildCombinedQCTabItems();
    }

    buildCombinedQCTabItems() {
        let allObj = {label: 'All', code: 'all'};
        this.combinedQCTabItems.push(allObj);
        if (this.gnomexService.usesExperimentType('HISEQ')) {
            allObj = {label: 'Illumina', code: 'illseq'};
            this.combinedQCTabItems.push(allObj);
        }
        if (this.gnomexService.usesExperimentType('SOLEXA')) {
            allObj = {label: 'GAIIX', code: 'solexa'};
            this.combinedQCTabItems.push(allObj);
        }
        if (this.gnomexService.usesExperimentType('MICROARRAY')) {
            allObj = {label: 'Microarray', code: 'microarray'};
            this.combinedQCTabItems.push(allObj);
        }
        if (this.gnomexService.usesExperimentType('QC')) {
            allObj = {label: 'Sample Quality', code: 'qc'};
            this.combinedQCTabItems.push(allObj);
        }
        if (this.gnomexService.usesExperimentType('NANOSTRING')) {
            allObj = {label: 'Nano String', code: 'nano'};
            this.combinedQCTabItems.push(allObj);
        }
    }

    ngAfterViewInit() {
        switch (this.codeStepNext) {
            case 'QC' :
                this.resetTab = 0;
                break;
            case 'LIBPREP' :
                this.resetTab = 1;
                break;
            case 'LIBPREPQC' :
                this.resetTab = 1;
                break;

        }
    }

    onClickQC (event) {
        switch(event.currentTarget.innerText) {
            case 'All' :
                this.qcWorkflow.onClickAll(event);
                break;
            case 'Illumina' :
                this.qcWorkflow.onClickIlluminaQC(event);
                break;
            case 'Microarray' :
                this.qcWorkflow.onClickMicroarrayQC(event);
                break;
            case 'Sample Quality' :
                this.qcWorkflow.onClickSampleQualityQC(event);
                break;
            case 'Nano String' :
                this.qcWorkflow.onClickNanostringQC(event);
                break;

        }
        console.log("qc");
    }

    ngAfterViewChecked() {
        let detectChanges: boolean = false;

        if (this.selectedTab != this.resetTab) {
            this.selectedTab = this.resetTab;
            detectChanges = true;
        }
        if (detectChanges) {
            this.changeRef.detectChanges();
        }
    }

    toggle(event) {
        if (this.showNav) {
            this.sidenav.close();
            this.showNav = false;

        } else {
            this.sidenav.open();
            this.showNav = true;
        }
    }

    onGroupsTabChange(event) {
        console.log("tabh");
        switch (event.index) {
            case 0 :
                this.codeStepNext = 'QC';
                break;
            case 1 :
                if (this.codeStepNext === 'QC') {
                    this.libPrepWorkflow.initialize();
                    this.codeStepNext = 'LIBPREP';
                }
                break;
        }
    }

    onClickLibPrep(event) {
        this.codeStepNext = 'LIBPREP';
        this.libPrepWorkflow.onClickLibPrep(event);
    }

    onClickLibPrepQC(event) {
        this.codeStepNext = 'LIBPREPQC';
        this.libPrepQcWorkflow.onClickLibPrepQc(event);
    }

    onClickFlowCellAssem(event) {
    }

    onClickFinalizedFlowCell(event) {
    }

    onClickDataPipeline(event) {
    }

}