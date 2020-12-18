import {Injectable} from "@angular/core";
import {first} from "rxjs/operators";
import {BehaviorSubject, Observable} from "rxjs";
import {CookieUtilService} from "./cookie-util.service";
import {HttpClient} from "@angular/common/http";
import {DialogsService} from "../util/popup/dialogs.service";
import {ProgressService} from "../home/progress.service";
import {Router} from "@angular/router";
import {DateComparator} from "../util/DateComparator";

@Injectable()
export class CheckSessionStatusService {

    private checkSessionStatusInterval: any;

    private checkSessionStatusDialogIsOpen: boolean = false;

    public billingAccountsLatestChangeSubject: BehaviorSubject<Date> = new BehaviorSubject(null);


    public getBillingAccountsLatestChangeObservable(): Observable<Date> {
        return this.billingAccountsLatestChangeSubject.asObservable();
    }


    constructor(private progressService: ProgressService,
                private cookieUtilService: CookieUtilService,
                private dialogService: DialogsService,
                private httpClient: HttpClient,
                private _router: Router) {}

    public clearSessionStatusInterval():void {
        clearInterval(this.checkSessionStatusInterval);
        this.checkSessionStatusInterval = null;
    }

    public startSessionStatusInterval():void {
        if (!this.checkSessionStatusInterval) {
            this.checkSessionStatusInterval = setInterval(() => { this.checkSessionStatus(); }, 10000);
        }
    }


    private checkSessionStatus(): void {
        this.cookieUtilService.formatXSRFCookie();
        this.httpClient.post("/gnomex/CheckSessionStatus.gx", {}).subscribe((response: any) => {
            if (response && response.sa && response.sa.billingAccountsLatestChange) {
                let latestChange: Date = new Date(response.sa.billingAccountsLatestChange);

                if (!this.billingAccountsLatestChangeSubject.value) {
                    this.billingAccountsLatestChangeSubject.next(latestChange);
                } else if (DateComparator.compare(this.billingAccountsLatestChangeSubject.value, latestChange) > 0) {
                    console.log("change detected!");
                    this.billingAccountsLatestChangeSubject.next(latestChange);
                } else {
                    // Do nothing, up to date!
                }
            }
        }, (error: any) => {
            if (!this.checkSessionStatusDialogIsOpen) {
                this.checkSessionStatusDialogIsOpen = true;

                this.dialogService.confirm("Your session has expired, and you have lost connection to the server.  Would you like to return to the login screen now?", "Disconnected...").pipe(first()).subscribe((result: boolean) => {
                    if(result) {
                        this.progressService.hideLoaderStatus(false);
                        this.progressService.loaderStatus = new BehaviorSubject<number> (0);
                        this._router.navigate(["/logout-loader"]);
                    }

                    this.checkSessionStatusDialogIsOpen = false;
                });
            }
        });
    }
}