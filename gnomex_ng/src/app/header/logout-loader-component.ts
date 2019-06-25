
import {AfterViewInit, Component, NgZone, OnDestroy, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {GnomexService} from "../services/gnomex.service";
import {ProgressService} from "../home/progress.service";
import {BehaviorSubject} from "rxjs";
import {AuthenticationService} from "../auth/authentication.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {first} from "rxjs/operators";
import {BootController} from "../../boot-control";
import {URLSearchParams} from "@angular/http";
import {LaunchPropertiesService} from "../services/launch-properites.service";

@Component({
    template: `
        <div class="full-height full-width flex-container-col justify-center align-center">
            
            <div class="flex-container-col full-height full-width justify-center align-center">
                <div class="padded">
                    <img [src]="site_logo" alt="">
                </div>

                <h1 >
                    Logging out...
                </h1>
            </div>
            
        </div>


    `
})

export class LogoutLoaderComponent implements OnInit,OnDestroy {
    public dotStr:string = ".";
    private intervalID;
    public site_logo:string;
    private site_splash:string;
    public hideLoader: BehaviorSubject<boolean>;

    constructor(private authenticationService: AuthenticationService,
                private router: Router,
                private launchPropertiesService: LaunchPropertiesService,
                private gnomexService: GnomexService,
                private dialogsService: DialogsService,
                private progressService: ProgressService,
                private ngZone: NgZone
    ) {}

    ngOnInit() {
        this.site_logo = "./assets/gnomex_logo.png";

        setTimeout(()=>{
            this.router.navigate(['authenticate']);
            this.ngZone.runOutsideAngular(() => BootController.getbootControl().restart());

        });





    }




    ngOnDestroy(): void {
    }

}
