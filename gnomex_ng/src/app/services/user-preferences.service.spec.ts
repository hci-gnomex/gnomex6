import {TestBed} from "@angular/core/testing";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {UserPreferencesService} from "./user-preferences.service";

describe("UserPreferencesService", () => {
    let service: UserPreferencesService;
    let http: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [UserPreferencesService],
        });
        service = TestBed.inject(UserPreferencesService);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => http.verify());

    describe("formatUserName", () => {
        it("formats 'First Last' by default", () => {
            expect(service.formatUserName("Jane", "Doe")).toBe("Jane Doe");
            expect(service.formatUserName("Jane")).toBe("Jane");
            expect(service.formatUserName(undefined, "Doe")).toBe("Doe");
            expect(service.formatUserName()).toBe("");
        });

        it("formats 'Last, First' when formatNamesFirstLast is off", () => {
            service.formatNamesFirstLast = false;
            expect(service.formatUserName("Jane", "Doe")).toBe("Doe, Jane");
            expect(service.formatUserName("Jane")).toBe("Jane");
            expect(service.formatUserName(undefined, "Doe")).toBe("Doe");
        });
    });

    describe("createDisplaySortFunction", () => {
        it("sorts by the display field and puts missing values first", () => {
            const sort = service.createDisplaySortFunction("name");
            const items: any[] = [{name: "Charlie"}, null, {name: "alpha"}, {}, {name: "Bravo"}];
            const sorted: any[] = items.slice().sort(sort);
            expect(sorted.map((x: any) => x ? x.name : null)).toEqual([null, undefined, "alpha", "Bravo", "Charlie"]);
        });

        it("treats two missing values as equal", () => {
            const sort = service.createDisplaySortFunction("name");
            expect(sort(null, null)).toBe(0);
            expect(sort({}, {})).toBe(0);
        });
    });

    it("createLabDisplayWithFunction reads the lab display field", () => {
        const displayWith = service.createLabDisplayWithFunction();
        expect(displayWith({nameFirstLast: "Doe Lab", name: "Lab, Doe"})).toBe("Doe Lab");
        expect(displayWith(null)).toBe("");
    });

    describe("createUserPreferences", () => {
        it("posts the guest flag", () => {
            service.createUserPreferences(true).subscribe();
            const req = http.expectOne("/gnomex/CreateUserPreferences.gx");
            expect(req.request.method).toBe("POST");
            expect(req.request.body).toBe("forGuest=Y");
            req.flush({});
        });

        it("switches to 'Last, First' fields when the server says so", () => {
            let result: any;
            service.createUserPreferences(false).subscribe((r: any) => result = r);
            http.expectOne("/gnomex/CreateUserPreferences.gx").flush({formatNamesFirstLast: "N"});

            expect(result).toBe(true);
            expect(service.formatNamesFirstLast).toBe(false);
            expect(service.userDisplayField).toBe("displayName");
            expect(service.labDisplayField).toBe("name");
        });

        it("keeps 'First Last' fields when the server returns Y", () => {
            service.createUserPreferences(false).subscribe();
            http.expectOne("/gnomex/CreateUserPreferences.gx").flush({formatNamesFirstLast: "Y"});

            expect(service.formatNamesFirstLast).toBe(true);
            expect(service.userDisplayField).toBe("firstLastDisplayName");
            expect(service.labDisplayField).toBe("nameFirstLast");
        });
    });
});
