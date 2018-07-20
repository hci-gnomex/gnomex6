import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {Observable} from "rxjs/Observable";

import 'rxjs/add/operator/map';

@Injectable()
export class AnnotationService {

    constructor(private http: Http) {
    }

    public getPropertyListCall(): Observable<Response> {
        return this.http.get("/gnomex/GetPropertyList.gx");
    }

    public getPropertyList(): Observable<any[]> {
        return this.getPropertyListCall().map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                return [];
            }
        });
    }

    public static isApplicableProperty(property, reqCategory, idOrganism: string, codeApplication: string): boolean {
        if (property == null) {
            return false;
        }

        let filterByOrganism: boolean = false;
        if (property.organisms.length > 0) {
            filterByOrganism = true;
        }

        let filterByPlatformApplication: boolean = false;
        if (reqCategory != null) {
            if (!Array.isArray(property.platformApplications)) {
                property.platformApplications = [property.platformApplications.PropertyPlatformApplication];
            }

            if (( property.forRequest != null && property.forRequest == 'Y' ) ||
                property.platformApplications.PropertyPlatformApplication.length > 0 ||
                reqCategory.type == 'ISCAN' || reqCategory.type == 'CAPSEQ' || reqCategory.type == 'FRAGANAL') {
                filterByPlatformApplication = true;
            }
        }
        let keep: boolean = false;

        if (!filterByOrganism) {
            keep = true;
        } else {
            if (idOrganism != null) {
                if (!Array.isArray(property.organisms)) {
                    property.organisms = [property.organisms.Organism];
                }
                for (let org of property.organisms) {
                    if (idOrganism == org.idOrganism) {
                        keep = true;
                        break;
                    }
                }
            }
        }

        if (keep) {
            if (!filterByPlatformApplication) {
                keep = true;
            } else {
                keep = false;
                if (reqCategory != null) {
                    for (let pa of property.platformApplications) {
                        if (reqCategory.codeRequestCategory === pa.codeRequestCategory) {
                            if(pa.codeApplication === "" || codeApplication === pa.codeApplication) {
                                keep = true;
                                break;
                            }
                        }
                    }
                }
            }
        }

        if (keep) {
            if (reqCategory.idCoreFacility != property.idCoreFacility) {
                keep = false;
            }
        }

        return keep;
    }

}