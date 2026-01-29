export class BillingViewChangeForCoreCommentsWindowEvent {
    showOtherBillingItems: boolean = true;
    requestNumber: string = "";
    invoiceLookupNumber: string = "";
    idBillingPeriod: string = "";
    idLab: string = "";
    idBillingAccount: string = "";
    excludeNewRequests: boolean = false;
    idCoreFacility: string = "";

    constructor() {
    }
}