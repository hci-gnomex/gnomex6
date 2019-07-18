
import {Component, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {GnomexService} from "../services/gnomex.service";
import {ProgressService} from "../home/progress.service";
import {BehaviorSubject} from "rxjs";
import {AuthenticationService} from "../auth/authentication.service";
import {DialogsService} from "../util/popup/dialogs.service";
import {first} from "rxjs/operators";

@Component({
    template: ''
})

export class LogoutComponent implements OnInit {

    constructor(private authenticationService: AuthenticationService,
                private router: Router,
                private gnomexService: GnomexService,
                private dialogsService: DialogsService,
                private progressService: ProgressService
                ) {}

    ngOnInit() {
    
        setTimeout(() => {
            let mes: string = "Are you sure you want to sign out?";
            this.dialogsService.confirm(mes, "Sign Out")
                .pipe(first()).subscribe((result:boolean) => {
                if(result){
                    this.authenticationService.logout();
                    this.gnomexService.isLoggedIn = false;
                    this.gnomexService.orderInitObj = null;
                    this.gnomexService.redirectURL = null;
                    this.progressService.hideLoaderStatus(false);
                    this.progressService.loaderStatus = new BehaviorSubject<number> (0);
                    this.router.navigate([{ outlets: { modal: null }}],{skipLocationChange:true})
                        .then( () => {
                            this.router.navigate(['/logout-loader']);
                        });






                } else {
                    this.router.navigate([{ outlets: { modal: null }}]);
                }
            });
        });
    }

}
