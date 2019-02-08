import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

@Injectable()
export class AnnotationService {

    constructor(private http: Http) {
    }

    public getPropertyListCall(): Observable<Response> {
        return this.http.get("/gnomex/GetPropertyList.gx");
    }

    public getPropertyList(): Observable<any[]> {
        return this.getPropertyListCall().pipe(map((response: Response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                return [];
            }
        }));
    }

    public static isApplicableProperty(property, reqCategory, idOrganism: string, codeApplication: string): boolean {
        if (!property) {
            return false;
        }

        let filterByOrganism: boolean = false;
        if (property.organisms) {
            if (!Array.isArray(property.organisms)) {
                property.organisms = [property.organisms.Organism];
            }

            if (property.organisms.length > 0) {
                filterByOrganism = true;
            }
        }

        let filterByPlatformApplication: boolean = false;
        if (reqCategory != null && property) {
            if (property.platformApplications) {
                if (!Array.isArray(property.platformApplications)) {
                    property.platformApplications = [property.platformApplications.PropertyPlatformApplication];
                }
            } else {
                console.log("no property.platformApplication");
            }

            if ((property.forRequest && property.forRequest === 'Y' )
                || property.platformApplications.length > 0
                || reqCategory.type === 'ISCAN'
                || reqCategory.type === 'CAPSEQ'
                || reqCategory.type === 'FRAGANAL') {

                filterByPlatformApplication = true;
            }
        }
        let keep: boolean = false;

        if (!filterByOrganism) {
            keep = true;
        } else {
            if (idOrganism) {
                if (!Array.isArray(property.organisms)) {
                    property.organisms = [property.organisms.Organism];
                }
                for (let org of property.organisms) {
                    if (idOrganism === org.idOrganism) {
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
                if (reqCategory && property) {
                    if (!Array.isArray(property.platformApplications)) {
                        property.platformApplications = [property.platformApplications.PropertyPlatformApplication];
                    }

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
            if (reqCategory.idCoreFacility !== property.idCoreFacility) {
                keep = false;
            }
        }

        return keep;
    }

    /*
     * Sort annotations by sort order then name
     */
    public static sortProperties(obj1, obj2): number {
        if (obj1 === null && obj2 === null) {
            return 0;
        } else if (obj1 === null) {
            return 1;
        } else if (obj2 === null) {
            return -1;
        } else {
            let so1: Number = (obj1.sortOrder === '' || obj1.sortOrder === null) ? Number(999999) : new Number(obj1.sortOrder);
            let so2: Number = (obj2.sortOrder === '' || obj2.sortOrder === null) ? Number(999999) : new Number(obj2.sortOrder);
            let sc1: string = '' + obj1.name;
            let sc2: string = '' + obj2.name;

            if (so1 < so2) {
                return -1;
            } else if (so1 > so2) {
                return 1;
            } else {
                if (sc1 === 'Other') {
                    return 1;
                } else if (sc2 === 'Other') {
                    return  -1;
                } else {
                    if (sc1.toLowerCase() < sc2.toLowerCase()) {
                        return -1;
                    } else if (sc1.toLowerCase() > sc2.toLowerCase()) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }

        }
    }
}