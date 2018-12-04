import {Injectable} from "@angular/core";
import {CookieService} from "angular2-cookie/core";
import {ConstantsService} from "./constants.service";

@Injectable()
export class CookieUtilService {

    constructor(private cookieService: CookieService,
                private constantsService: ConstantsService) {
    }

    public formatXSRFCookie(): void {
        // This is no longer necessary, XSRF filter now strips the quotes itself
        /*
        // The XSRF-TOKEN cookie given when logging in is incorrect (it includes quotes)
        // This corrects the cookie so that all later POST HTTP requests go through
        let cookie: string = this.cookieService.get(this.constantsService.X_XSRF_TOKEN_COOKIE_NAME);
        if (cookie && cookie.includes('"')) {
            let newCookie: string = cookie.substring(1, cookie.lastIndexOf('"'));
            this.cookieService.put(this.constantsService.X_XSRF_TOKEN_COOKIE_NAME, newCookie);
        }
        */
    }

}