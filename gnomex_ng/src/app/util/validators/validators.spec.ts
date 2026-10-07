import {FormControl, FormGroup} from "@angular/forms";
import {numberRange} from "./number-range-validator";
import {selectRequired} from "./select-required.validator";
import {specialChars} from "./special-characters.validator";
import {emailMatcher} from "./email-matcher.validator";
import {invalidExternalUsrName} from "./invalid-external-username.validator";
import {thisOrThat} from "./this-or-that.validator";

describe("Form validators", () => {

    describe("numberRange", () => {
        const validate = (value: any): any => numberRange(1, 10)(new FormControl(value));

        it("accepts values inside the range, inclusive", () => {
            expect(validate(1)).toBeNull();
            expect(validate(5)).toBeNull();
            expect(validate("10")).toBeNull();
        });

        it("reports values outside the range", () => {
            expect(validate(11)).toEqual({numberRange: "valid range 1 - 10"});
            expect(validate(-1)).toEqual({numberRange: "valid range 1 - 10"});
        });

        it("reports non-numbers", () => {
            expect(validate("abc")).toEqual({numberRange: "value is not a number"});
        });

        it("treats empty values (including 0) as valid", () => {
            expect(validate("")).toBeNull();
            expect(validate(null)).toBeNull();
            expect(validate(0)).toBeNull();
        });
    });

    describe("selectRequired", () => {
        it("requires a truthy value", () => {
            expect(selectRequired()(new FormControl(""))).toEqual({selectRequired: true});
            expect(selectRequired()(new FormControl(null))).toEqual({selectRequired: true});
            expect(selectRequired()(new FormControl("5"))).toBeNull();
        });
    });

    describe("specialChars", () => {
        it("allows only word characters", () => {
            expect(specialChars()(new FormControl("track_name_01"))).toBeNull();
            expect(specialChars()(new FormControl("track name"))).toEqual({specialChars: true});
            expect(specialChars()(new FormControl("track-name"))).toEqual({specialChars: true});
        });
    });

    describe("emailMatcher", () => {
        function makeGroup(email: string, confirm: string, dirty: boolean = true): FormGroup {
            const group: FormGroup = new FormGroup({
                email: new FormControl(email),
                confirmEmail: new FormControl(confirm),
            });
            if (dirty) {
                group.get("email").markAsDirty();
                group.get("confirmEmail").markAsDirty();
            }
            return group;
        }

        it("passes when the emails match", () => {
            expect(emailMatcher(makeGroup("a@b.org", "a@b.org"))).toBeNull();
        });

        it("fails when the emails differ", () => {
            expect(emailMatcher(makeGroup("a@b.org", "x@b.org"))).toEqual({match: true});
        });

        it("waits until both fields have been edited", () => {
            expect(emailMatcher(makeGroup("a@b.org", "x@b.org", false))).toBeNull();
        });

        it("ignores groups without the expected controls", () => {
            expect(emailMatcher(new FormGroup({other: new FormControl("x")}))).toBeNull();
        });
    });

    describe("invalidExternalUsrName", () => {
        const uidPattern: RegExp = /^u\d{7}$/i;

        function makeGroup(isUniversityUser: string): FormGroup {
            return new FormGroup({
                uNID: new FormControl(isUniversityUser),
                userName: new FormControl("", invalidExternalUsrName("uNID", uidPattern)),
            });
        }

        it("rejects a uNID-looking username for external users", () => {
            const group: FormGroup = makeGroup("");
            group.get("userName").setValue("u1234567");
            expect(group.get("userName").hasError("invalidExternalUsrName")).toBe(true);
        });

        it("allows normal external usernames", () => {
            const group: FormGroup = makeGroup("");
            group.get("userName").setValue("jdoe");
            expect(group.get("userName").errors).toBeNull();
        });

        it("allows uNIDs when the sibling field is filled", () => {
            const group: FormGroup = makeGroup("Y");
            group.get("userName").setValue("u1234567");
            expect(group.get("userName").errors).toBeNull();
        });
    });

    describe("thisOrThat", () => {
        function makeGroup(): FormGroup {
            return new FormGroup({
                phone: new FormControl("", thisOrThat("phone", "email")),
                email: new FormControl("", thisOrThat("email", "phone")),
            });
        }

        it("requires exactly one of the two fields", () => {
            const group: FormGroup = makeGroup();
            group.get("phone").updateValueAndValidity();
            expect(group.get("phone").errors).toEqual({thisOrThat: "either phone or email"});

            group.get("phone").setValue("555-1234");
            expect(group.get("phone").errors).toBeNull();

            group.get("email").setValue("a@b.org");
            expect(group.get("email").hasError("thisOrThat")).toBe(true);
        });

        it("re-validates the partner when the pair becomes valid", () => {
            const group: FormGroup = makeGroup();
            group.get("email").updateValueAndValidity();
            expect(group.get("email").invalid).toBe(true);

            group.get("phone").setValue("555-1234");
            expect(group.get("email").valid).toBe(true);
        });

        it("uses a custom error message", () => {
            const control: FormControl = new FormControl("", thisOrThat("a", "b", "pick one"));
            new FormGroup({a: control, b: new FormControl("")});
            control.updateValueAndValidity();
            expect(control.errors).toEqual({thisOrThat: "pick one"});
        });

        it("is valid with no parent group", () => {
            expect(thisOrThat("a", "b")(new FormControl(""))).toBeNull();
        });
    });
});
