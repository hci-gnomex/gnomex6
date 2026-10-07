import {FormControl, FormGroup} from "@angular/forms";
import {Subscription} from "rxjs";
import {UtilService} from "./util.service";

describe("UtilService (static helpers)", () => {

    describe("getJsonArray", () => {
        it("normalises the XML-to-JSON single-item quirk", () => {
            expect(UtilService.getJsonArray([1, 2], 1)).toEqual([1, 2]);
            expect(UtilService.getJsonArray({a: 1}, {a: 1})).toEqual([{a: 1}]);
            expect(UtilService.getJsonArray(null, null)).toEqual([]);
            expect(UtilService.getJsonArray(undefined, "x")).toEqual([]);
        });
    });

    describe("getSubStr", () => {
        it("truncates long strings with an ellipsis", () => {
            expect(UtilService.getSubStr("abcdefgh", 3)).toBe("abc...");
            expect(UtilService.getSubStr("abcdefgh", 3, 2)).toBe("cde...");
        });

        it("leaves short strings untouched", () => {
            expect(UtilService.getSubStr("abc", 3)).toBe("abc");
            expect(UtilService.getSubStr("ab", 10)).toBe("ab");
        });
    });

    describe("getUrlString", () => {
        it("returns the path from /gnomex onward", () => {
            expect(UtilService.getUrlString("http://host:8080/gnomex/experiments")).toBe("/gnomex/experiments");
        });

        it("drops router matrix parameters after ';'", () => {
            expect(UtilService.getUrlString("http://host/gnomex/experiments;idProject=5")).toBe("/gnomex/experiments");
        });
    });

    describe("markChildrenAsTouched", () => {
        it("touches nested groups and controls", () => {
            const inner: FormGroup = new FormGroup({c: new FormControl()});
            const outer: FormGroup = new FormGroup({a: new FormControl(), inner: inner});

            UtilService.markChildrenAsTouched(outer);

            expect(outer.touched).toBe(true);
            expect(outer.get("a").touched).toBe(true);
            expect(inner.touched).toBe(true);
            expect(inner.get("c").touched).toBe(true);
        });
    });

    describe("safelyUnsubscribe", () => {
        it("unsubscribes when given a subscription and ignores null", () => {
            const sub: Subscription = new Subscription();
            UtilService.safelyUnsubscribe(sub);
            expect(sub.closed).toBe(true);
            expect(() => UtilService.safelyUnsubscribe(null)).not.toThrow();
        });
    });

    describe("sortObjectAlphabetically", () => {
        it("sorts by the attribute with missing values first", () => {
            const rows: any[] = [{n: "pear"}, {n: "Apple"}, {}, {n: "banana"}];
            rows.sort(UtilService.sortObjectAlphabetically("n"));
            expect(rows.map((r: any) => r.n)).toEqual([undefined, "Apple", "banana", "pear"]);
        });
    });

    describe("sortOrderIDNumerically", () => {
        it("sorts request numbers by their numeric part", () => {
            const rows: any[] = [{id: "12R"}, {id: "9R"}, {id: "100R"}, {id: "A3R"}];
            rows.sort(UtilService.sortOrderIDNumerically("id"));
            expect(rows.map((r: any) => r.id)).toEqual(["A3R", "9R", "12R", "100R"]);
        });
    });

    it("shrinkCellText returns the small-font style", () => {
        expect(UtilService.shrinkCellText(null)).toEqual({"font-size": ".70rem"});
    });
});
