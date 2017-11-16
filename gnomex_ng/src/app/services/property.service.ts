import {Injectable} from "@angular/core";
import {DictionaryService} from "./dictionary.service";

@Injectable()
export class PropertyService {

    constructor(private dictionaryService: DictionaryService) {}

    /**
     * Returns the property entry that matches the provided search data as specifically as possible:
     *   1. name, core facility, request category
     *   2. name, core facility
     *   3. name
     * If a match is not found at a specific level or if the corresponding optional data was not provided,
     * the search will move to the next level. Returns undefined if no match is found at any level.
     * (compare with getExactProperty(), which requires an exact match)
     * @param {string} name
     * @param {string} idCoreFacility (optional)
     * @param {string} codeRequestCategory (optional)
     * @returns {any}
     */
    getProperty(name: string, idCoreFacility?: string, codeRequestCategory?: string): any {
        let properties = this.dictionaryService.getEntries(DictionaryService.PROPERTY_DICTIONARY);
        let property;
        if (idCoreFacility && codeRequestCategory) {
            property = properties.find((property) => (property.propertyName === name && property.idCoreFacility === idCoreFacility && property.codeRequestCategory === codeRequestCategory));
        }
        if (!property && idCoreFacility) {
            property = properties.find((property) => (property.propertyName === name && property.idCoreFacility === idCoreFacility && property.codeRequestCategory === ""));
        }
        if (!property) {
            property = properties.find((property) => (property.propertyName === name && property.idCoreFacility === "" && property.codeRequestCategory === ""));
        }
        return property;
    }

    /**
     * Returns the property entry that exactly matches the provided search data:
     *   1. name, core facility, request category
     *   2. name, core facility
     *   3. name
     *
     * Search terms that are not provided will only match null values in the database.
     * Returns undefined if no match is found.
     * (compare with getProperty(), which can return partial matches)
     * @param {string} name
     * @param {string} idCoreFacility (optional)
     * @param {string} codeRequestCategory (optional)
     * @returns {any}
     */
    getExactProperty(name: string, idCoreFacility?: string, codeRequestCategory?: string): any {
        let properties = this.dictionaryService.getEntries(DictionaryService.PROPERTY_DICTIONARY);
        if (!idCoreFacility) {
            idCoreFacility = "";
        }
        if (!codeRequestCategory) {
            codeRequestCategory = "";
        }
        return properties.find((property) => (property.propertyName === name && property.idCoreFacility === idCoreFacility && property.codeRequestCategory === codeRequestCategory));
    }

    getPropertyForServer(): any {

    }

}
