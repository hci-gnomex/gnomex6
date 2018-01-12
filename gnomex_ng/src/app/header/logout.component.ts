
import {Component, OnInit} from "@angular/core";
import {AuthenticationService} from "@hci/authentication";
import {Router} from "@angular/router";

@Component({
    template: ''
})

export class LogoutComponent implements OnInit {

    constructor(private authenticationService: AuthenticationService,
                private router: Router) {}

    ngOnInit() {
        this.authenticationService.logout();
        this.router.navigate(['authenticate']);
    }

}