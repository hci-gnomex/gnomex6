import {TestBed} from "@angular/core/testing";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {FormControl, FormGroup} from "@angular/forms";
import {PasswordUtilService} from "./password-util.service";

describe("PasswordUtilService", () => {

    describe("passwordMeetsRequirements", () => {
        // Mirrors PasswordUtilTest.java so the client and server rules stay in step.
        const cases: [string, boolean][] = [
            [null, false],
            ["", false],
            ["!Short!", false],
            ["Short+OK", true],
            ["IsMyNewPasswordTooLong?Yes", false],
            ["IsMyNewPasswordTooLong?No", true],
            ["abcd1234", false],
            ["Abcd1234", true],
            ["JustLettersOops", false],
            ["GotSymbols!", true],
            ["Password1", true],
            ["no-upper-case-1", true],
            ["Pretty, but has SPACES!", false],
            ["Look/Some\\Slashes!", false],
        ];

        for (const [password, expected] of cases) {
            it(`returns ${expected} for ${JSON.stringify(password)}`, () => {
                expect(PasswordUtilService.passwordMeetsRequirements(password)).toBe(expected);
            });
        }
    });

    describe("validatePassword", () => {
        it("returns null for a valid password", () => {
            expect(PasswordUtilService.validatePassword(new FormControl("Abcd1234"))).toBeNull();
        });

        it("returns an error containing the value for an invalid password", () => {
            expect(PasswordUtilService.validatePassword(new FormControl("abc")))
                .toEqual({validatePassword: {value: "abc"}});
        });
    });

    describe("validatePasswordConfirm", () => {
        function makeForm(passwordKey?: string): FormGroup {
            const key: string = passwordKey || "password";
            const controls: any = {confirm: new FormControl("", PasswordUtilService.validatePasswordConfirm(passwordKey))};
            controls[key] = new FormControl("Abcd1234");
            return new FormGroup(controls);
        }

        it("is valid when the confirmation matches", () => {
            const form: FormGroup = makeForm();
            form.get("confirm").setValue("Abcd1234");
            expect(form.get("confirm").errors).toBeNull();
        });

        it("is invalid when the confirmation differs or is empty", () => {
            const form: FormGroup = makeForm();
            form.get("confirm").setValue("Abcd12345");
            expect(form.get("confirm").errors).toEqual({validatePasswordConfirm: {value: "Abcd12345"}});
            form.get("confirm").setValue("");
            expect(form.get("confirm").hasError("validatePasswordConfirm")).toBe(true);
        });

        it("compares against a custom password control name", () => {
            const form: FormGroup = makeForm("newPassword");
            form.get("confirm").setValue("Abcd1234");
            expect(form.get("confirm").errors).toBeNull();
        });

        it("is invalid for a control with no parent", () => {
            const lone: FormControl = new FormControl("Abcd1234", PasswordUtilService.validatePasswordConfirm());
            expect(lone.hasError("validatePasswordConfirm")).toBe(true);
        });
    });

    describe("HTTP calls", () => {
        let service: PasswordUtilService;
        let http: HttpTestingController;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [HttpClientTestingModule],
                providers: [PasswordUtilService],
            });
            service = TestBed.inject(PasswordUtilService);
            http = TestBed.inject(HttpTestingController);
        });

        afterEach(() => http.verify());

        it("resetPassword posts a username lookup", () => {
            service.resetPassword(true, "jdoe").subscribe();
            const req = http.expectOne("/gnomex/ChangePassword.gx");
            expect(req.request.method).toBe("POST");
            expect(req.request.headers.get("Content-Type")).toBe("application/x-www-form-urlencoded");
            expect(req.request.body).toBe("action=requestPasswordReset&userName=jdoe");
            req.flush({});
        });

        it("resetPassword posts an email lookup and encodes '+' and '@'", () => {
            service.resetPassword(false, "j+doe@utah.edu").subscribe();
            const req = http.expectOne("/gnomex/ChangePassword.gx");
            expect(req.request.body).toBe("action=requestPasswordReset&email=j%2Bdoe%40utah.edu");
            req.flush({});
        });

        it("changePassword sends the reset guid", () => {
            service.changePassword("jdoe", "N3w!pass", "N3w!pass", "abc-123").subscribe();
            const req = http.expectOne("/gnomex/ChangePassword.gx");
            expect(req.request.body).toBe(
                "action=finalizePasswordReset&userName=jdoe&newPassword=N3w!pass&newPasswordConfirm=N3w!pass&guid=abc-123");
            req.flush({});
        });

        it("forceChangePassword uses the forceChangePassword action", () => {
            service.forceChangePassword("jdoe", "a", "b").subscribe();
            const req = http.expectOne("/gnomex/ChangePassword.gx");
            expect(req.request.body).toBe("action=forceChangePassword&userName=jdoe&newPassword=a&newPasswordConfirm=b");
            req.flush({});
        });
    });
});
