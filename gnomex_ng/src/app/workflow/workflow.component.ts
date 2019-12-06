import {
    AfterViewInit, ChangeDetectorRef, Component, ComponentRef, ElementRef, OnInit, ViewChild
} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {QcWorkflowComponent} from "./qc-workflow.component";
import {LibprepWorkflowComponent} from "./libprep-workflow.component";
import {GnomexService} from "../services/gnomex.service";
import {LibprepQcWorkflowComponent} from "./libprepqc-workflow.component";
import {FlowcellAssemblyWorkflowComponent} from "./flowcell-assembly-workflow.component";
import {WorkflowService, qcModes} from "../services/workflow.service";
import {FinalizeWorkflowComponent} from "./finalize-workflow.component";
import {PipelineWorkflowComponent} from "./pipeline-workflow.component";
import {FlowcellWorkflowComponent} from "./flowcell-workflow.component";

@Component({
    selector: 'workflow',
    templateUrl: 'workflow.html',
    styles: [`
        
        .mat-tab-list .mat-tab-labels .mat-tab-label {
            min-width: 48px;
            flex: 1;
        }
        
        .vertical-spacer {
            height: 2em;
            max-height: 2em;
        }

        .no-height { height: 0; }

        .single-em { width: 1em; }
        
    `]
})
export class WorkflowComponent implements OnInit, AfterViewInit {
    @ViewChild('qcWorkflow') qcWorkflow: QcWorkflowComponent;
    @ViewChild('libPrepWorkflow') libPrepWorkflow: LibprepWorkflowComponent;
    @ViewChild('libPrepQcWorkflow') libPrepQcWorkflow: LibprepQcWorkflowComponent;
    @ViewChild('flowCellAssmWorkflow') flowCellAssmWorkflow: FlowcellAssemblyWorkflowComponent;
    @ViewChild('finalizeWorkflow') finalizeWorkflow: FinalizeWorkflowComponent;
    @ViewChild('oneEmWidth') oneEmWidth: ElementRef;

    public showNav: boolean = true;
    public microarrayDisabled: boolean = true;

    public sidenavSplitSize: number = 0;
    public combinedQCTabItems: any[] = [];
    public selectedTab = 0;

    public workflowOutlet: any = LibprepWorkflowComponent;

    public inputs = { mode: 'all' };

    private codeStepNext: any = 'QC';
    private resetTab = 0;
    private workflowComponent:any;
    private isATabChange: boolean = true;

    private emToPxConversionRate: number = 13;

    constructor(private route: ActivatedRoute,
                private router: Router,
                private workflowService: WorkflowService,
                private gnomexService: GnomexService,
                private changeRef:ChangeDetectorRef) { }

    ngOnInit() {
        this.sidenavSplitSize = this.showNav ? 15 * this.emToPxConversionRate : 0;
        this.route.data.subscribe((v) => { this.codeStepNext = v.codeStepNext; });

        this.buildCombinedQCTabItems();
        this.routeToWorkflow();
    }

    public onCreatedComponent(compRef:ComponentRef<any>): void {
        this.workflowComponent = compRef.instance;
    }

    private buildCombinedQCTabItems(): void {
        let allObj = {label: 'All', code: 'all'};
        this.combinedQCTabItems.push(allObj);

        if (this.gnomexService.usesExperimentType('HISEQ')
            || this.gnomexService.usesExperimentType('MISEQ')
            || this.gnomexService.usesExperimentType('NOSEQ')) {

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
            this.microarrayDisabled = false;
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
        this.isATabChange = false;

        switch (this.codeStepNext) {
            case this.workflowService.QC :                   this.resetTab = 0; break;
            case this.workflowService.ILLSEQ_PREP :          this.resetTab = 1; break;
            case this.workflowService.ILLSEQ_PREP_QC :       this.resetTab = 1; break;
            case this.workflowService.ILLSEQ_CLUSTER_GEN :   this.resetTab = 1; break;
            case this.workflowService.ILLSEQ_FINALIZE_FC :   this.resetTab = 1; break;
            case this.workflowService.ILLSEQ_DATA_PIPELINE : this.resetTab = 1; break;
            case this.workflowService.FLOWCELL :             this.resetTab = 1; break;
        }

        if (this.oneEmWidth && this.oneEmWidth.nativeElement) {
            this.emToPxConversionRate = this.oneEmWidth.nativeElement.offsetWidth;
        }
    }

    private routeToWorkflow(): void {
        switch (this.codeStepNext) {
            case this.workflowService.QC :                   this.routeToQC();                break;
            case this.workflowService.ILLSEQ_PREP :          this.onClickLibPrep();           break;
            case this.workflowService.ILLSEQ_PREP_QC :       this.onClickLibPrepQC();         break;
            case this.workflowService.ILLSEQ_CLUSTER_GEN :   this.onClickFlowCellAssm();      break;
            case this.workflowService.ILLSEQ_FINALIZE_FC :   this.onClickFinalizedFlowCell(); break;
            case this.workflowService.ILLSEQ_DATA_PIPELINE : this.onClickDataPipeline();      break;
            case this.workflowService.FLOWCELL :             this.onClickFlowCells();         break;
        }
    }

    private routeToQC(): void {
        this.workflowOutlet = QcWorkflowComponent;
    }

    public onClickQC(event): void {
        switch(event.currentTarget.innerText) {
            case qcModes.All :           this.inputs.mode = qcModes.All;           break;
            case qcModes.Illumina :      this.inputs.mode = qcModes.Illumina;      break;
            case qcModes.Microarray :    this.inputs.mode = qcModes.Microarray;    break;
            case qcModes.Samplequality : this.inputs.mode = qcModes.Samplequality; break;
            case qcModes.Nanostring :    this.inputs.mode = qcModes.Nanostring;    break;
        }
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

    public toggle(event): void {
        if (this.showNav) {
            this.sidenavSplitSize = 0;
            this.showNav = false;

        } else {
            this.sidenavSplitSize = 15 * this.emToPxConversionRate;
            this.showNav = true;
        }
    }

    public onGroupsTabChange(event): void {
        if (this.isATabChange) {
            switch (event.index) {
                case 0 : this.codeStepNext = this.workflowService.QC;          break;
                case 1 : this.codeStepNext = this.workflowService.ILLSEQ_PREP; break;
            }

            this.routeToWorkflow();
        } else {
            this.isATabChange = true;
        }
    }

    public onClickLibPrep(): void {
        this.codeStepNext = this.workflowService.ILLSEQ_PREP;
        this.workflowOutlet = LibprepWorkflowComponent
    }

    public onClickLibPrepQC(): void {
        this.codeStepNext = this.workflowService.ILLSEQ_PREP_QC;
        this.workflowOutlet = LibprepQcWorkflowComponent;
    }

    public onClickFlowCellAssm(): void {
        this.codeStepNext = this.workflowService.ILLSEQ_CLUSTER_GEN;
        this.workflowOutlet = FlowcellAssemblyWorkflowComponent;
    }

    public onClickFinalizedFlowCell(): void {
        this.codeStepNext = this.workflowService.ILLSEQ_FINALIZE_FC;
        this.workflowOutlet = FinalizeWorkflowComponent;
    }

    public onClickDataPipeline(): void {
        this.codeStepNext = this.workflowService.ILLSEQ_DATA_PIPELINE;
        this.workflowOutlet = PipelineWorkflowComponent;
    }

    public onClickFlowCells(): void {
        this.codeStepNext = this.workflowService.FLOWCELL;
        this.workflowOutlet = FlowcellWorkflowComponent;
    }
}
