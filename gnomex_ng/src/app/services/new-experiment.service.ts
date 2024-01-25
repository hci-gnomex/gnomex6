import {Injectable} from "@angular/core";

import {BehaviorSubject, Observable} from "rxjs";

@Injectable()
export class NewExperimentService {

    get components(): any[] {
        return this._components;
    }
    set components(value: any[]) {
        this._components = value;
    }

    get requestCategory(): any {
        return this._requestCategory;
    }
    set requestCategory(value: any) {
        this._requestCategory = value;
    }

    get currentState(): string {
        if (this._currentState_subject) {
            return this._currentState_subject.getValue();
        } else {
            return '';
        }
    }
    set currentState(value: string) {
        this._currentState_subject.next(value);
    }
    get currentState_onChangeObservable(): Observable<string> {
        return this._currentState_subject.asObservable();
    }

    public _currentState_subject = new BehaviorSubject("SolexaBaseState");

    private _requestCategory: any;
    private _components: any[] = [];

    public static readonly TYPE_MICROARRAY: string = 'MICROARRAY';
    public static readonly TYPE_HISEQ: string = 'HISEQ';  // I think these were wrapped into an ILLSEQ state?
    public static readonly TYPE_MISEQ: string = 'MISEQ';  // I think these were wrapped into an ILLSEQ state?
    public static readonly TYPE_ILLSEQ: string = 'ILLSEQ';  // I think these were wrapped into an ILLSEQ state?
    public static readonly TYPE_QC: string = 'QC';
    public static readonly TYPE_CAP_SEQ: string = "CAPSEQ";
    public static readonly TYPE_FRAG_ANAL: string = "FRAGANAL";
    public static readonly TYPE_MIT_SEQ: string = "MITSEQ";
    public static readonly TYPE_CHERRY_PICK: string = "CHERRYPICK";
    public static readonly TYPE_ISCAN: string = "ISCAN";
    public static readonly TYPE_ISOLATION: string = "ISOLATION";
    public static readonly TYPE_CLINICAL_SEQUENOM: string = "CLINSEQ";
    public static readonly TYPE_SEQUENOM: string = "SEQUENOM";
    public static readonly TYPE_NANOSTRING: string = "NANOSTRING";
    public static readonly TYPE_NANOGEOMX: string = "NANOGEOMX";
    public static readonly TYPE_LCM: string = "LCM";
    public static readonly TYPE_MILLISECT: string = "MILLISECT";

    public static readonly TYPE_GENERIC: string = "GENERIC";


    constructor() { }


    public isExternalExperimentSubmission(): boolean {
        return this.currentState === "ExternalExperimentState"
            || this.currentState === "ExternalMicroarrayState"
            || this.currentState === "AdminExternalExperimentState"
            || this.currentState === "AdminExternalMicroarrayState";
    }


    public isEditState(): boolean {
        return this.currentState === 'EditState'
            || this.currentState === 'GenericEditState'
            || this.currentState === 'SolexaEditState'
            || this.currentState === 'SeqExternalEditState'
            || this.currentState === 'QCEditState'
            || this.currentState === 'MicroarrayEditState'
            || this.currentState === 'CapSeqEditState'
            || this.currentState === 'CherryPickEditState'
            || this.currentState === 'FragAnalEditState'
            || this.currentState === 'MitSeqEditState'
            || this.currentState === 'IScanEditState'
            || this.currentState === 'SequenomEditState'
            || this.currentState === 'IsolationEditState'
            || this.currentState === 'ClinicalSequenomEditState'
            || this.currentState === 'SliceEditState'
            || this.currentState === 'NanoGeomxEditState'
            || this.currentState === 'NanoStringEditState';
    }

    public isMicroarrayState(): boolean {
        return this.requestCategory
            && this.requestCategory.type === NewExperimentService.TYPE_MICROARRAY;
    }

    public isQCState(): boolean {
        return this.currentState === 'QCState'
            || this.currentState === 'QCExternalState'
            || this.currentState === 'QCEditState';
    }

    public isSolexaState():Boolean {
        return this.currentState === 'SolexaBaseState'
            || this.currentState === 'SolexaBaseExternalState'
            || this.currentState === 'SolexaEditState'
            || this.currentState === 'SeqExternalEditState'
            || this.currentState === 'SolexaBaseAmendState'
            || this.currentState === 'SolexaLaneAmendState';
    }

    public isSequenomState(): boolean {
        return this.currentState === 'SequenomState'
            || this.currentState === 'SequenomEditState';
    }

    public isClinicalSequenomState(): boolean {
        return this.currentState === 'ClinicalSequenomState'
            || this.currentState === 'ClinicalSequenomEditState';
    }
}