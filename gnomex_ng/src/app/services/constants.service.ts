import {EventEmitter, Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {Observable} from "rxjs/Observable";

@Injectable()
export class ConstantsService {
    public  readonly ICON_CHECKED = "assets/tick.png";
    public readonly SEGMENGT_NEW = "assets/segment_new.png";
    public readonly SEGMENGT_REMOVE = "assets/segment_remove.png";
    public readonly SEGMENGT_NEW_DISABLE = "assets/segment_new_disable.png";
    public readonly SEGMENGT_REMOVE_DISABLE = "assets/segment_remove_disable.png";
    public readonly X_XSRF_TOKEN_COOKIE_NAME: string = "XSRF-TOKEN";
    public readonly X_XSRF_TOKEN_HEADER: string = "X-XSRF-TOKEN";
    public readonly X_XSRF_TOKEN_SESSION_KEY: string = "X-XSRF-SESSION-TOKEN";
    public readonly X_XSRF_TOKEN_PARAM_KEY: string = "xsrfToken";
}
