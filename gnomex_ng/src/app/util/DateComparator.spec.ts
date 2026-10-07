import {DateComparator} from "./DateComparator";

describe("DateComparator", () => {
    const d = (iso: string): Date => new Date(iso);

    // Note: the result is reversed from a normal comparator: 1 means b is LATER than a.

    it("returns 1 when b is later and -1 when b is earlier", () => {
        expect(DateComparator.compare(d("2024-01-01T00:00:00Z"), d("2025-01-01T00:00:00Z"))).toBe(1);
        expect(DateComparator.compare(d("2025-01-01T00:00:00Z"), d("2024-01-01T00:00:00Z"))).toBe(-1);
    });

    it("compares every field down to milliseconds", () => {
        const base: string = "2024-06-15T10:20:30.400Z";
        expect(DateComparator.compare(d(base), d("2024-07-15T10:20:30.400Z"))).toBe(1);   // month
        expect(DateComparator.compare(d(base), d("2024-06-16T10:20:30.400Z"))).toBe(1);   // day
        expect(DateComparator.compare(d(base), d("2024-06-15T11:20:30.400Z"))).toBe(1);   // hour
        expect(DateComparator.compare(d(base), d("2024-06-15T10:21:30.400Z"))).toBe(1);   // minute
        expect(DateComparator.compare(d(base), d("2024-06-15T10:20:31.400Z"))).toBe(1);   // second
        expect(DateComparator.compare(d(base), d("2024-06-15T10:20:30.401Z"))).toBe(1);   // ms
        expect(DateComparator.compare(d(base), d(base))).toBe(0);
    });

    it("treats null as far in the future", () => {
        const now: Date = d("2024-01-01T00:00:00Z");
        expect(DateComparator.compare(null, now)).toBe(-1);
        expect(DateComparator.compare(now, null)).toBe(1);
        expect(DateComparator.compare(null, null)).toBe(0);
    });

    it("sorts newest-first when used directly with Array.sort", () => {
        const dates: Date[] = [d("2023-01-01Z"), d("2025-01-01Z"), d("2024-01-01Z")];
        dates.sort(DateComparator.compare);
        expect(dates.map((x: Date) => x.getUTCFullYear())).toEqual([2025, 2024, 2023]);
    });
});
