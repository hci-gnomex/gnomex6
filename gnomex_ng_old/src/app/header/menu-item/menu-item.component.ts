import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {NavigationService} from "../../services/navigation.service";

@Component({
    selector: 'app-menu-item',
    templateUrl: './menu-item.component.html'
})
export class MenuItemComponent implements OnInit {
    @Input() items: any[];
    @ViewChild('childMenu') public childMenu;

    constructor(public router: Router,
                private navService:NavigationService) {
    }

    ngOnInit() {
    }
    setNavModeType(){
        this.navService.navMode = NavigationService.USER;
    }
}
