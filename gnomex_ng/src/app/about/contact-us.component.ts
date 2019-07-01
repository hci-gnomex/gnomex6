import {Component, OnInit} from "@angular/core";
import {PropertyService} from "../services/property.service";
import {GnomexService} from "../services/gnomex.service";
import {BaseGenericContainerDialog} from "../util/popup/base-generic-container-dialog";


@Component({
    selector: 'contact-us',
    templateUrl: "./contact-us.component.html",
    styles: [`
        div.flex-container-col {
            display: flex;
            flex-direction: column;
        }
        .margin-left {
            margin-left: 3rem;
        }
    `]
})
export class ContactUsComponent extends BaseGenericContainerDialog implements OnInit {
    public bugContact: any;
    public bioinformaticsContact: any;

    constructor(private propertyService: PropertyService,
                public gnomexService: GnomexService) {
        super();
    }

    ngOnInit() {
        this.bugContact = this.propertyService.getProperty(PropertyService.PROPERTY_CONTACT_EMAIL_SOFTWARE_BUGS);
        this.bioinformaticsContact = this.propertyService.getProperty(PropertyService.PROPERTY_CONTACT_EMAIL_BIOINFORMATICS);
    }

}
