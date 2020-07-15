
export class DateComparator {

    constructor() { }

    /**
     * @param a the first Date object
     * @param b the second Date object
     * @return 1 if b is later than a, 0 if b = a, -1 if b is earlier than a. NULL is treated as far in the future.
     */
    public static compare(a: Date, b: Date): number {
        if (!a) {
            if (!b) {
                return 0;
            } else {
                return -1;
            }
        } else {
            if (!b) {
                return 1;
            } else {
                // a and b are both not null

                if (a.getUTCFullYear() > b.getUTCFullYear()) {
                    return -1;
                } else if (a.getUTCFullYear() < b.getUTCFullYear()) {
                    return 1;
                } else {
                    if (a.getUTCMonth() > b.getUTCMonth()) {
                        return -1;
                    } else if (a.getUTCMonth() < b.getUTCMonth()) {
                        return 1;
                    } else {
                        if (a.getUTCDate() > b.getUTCDate()) {
                            return -1;
                        } else if (a.getUTCDate() < b.getUTCDate()) {
                            return 1;
                        } else {
                            if (a.getUTCHours() > b.getUTCHours()) {
                                return -1;
                            } else if (a.getUTCHours() < b.getUTCHours()) {
                                return 1;
                            } else {
                                if (a.getUTCMinutes() > b.getUTCMinutes()) {
                                    return -1;
                                } else if (a.getUTCMinutes() < b.getUTCMinutes()) {
                                    return 1;
                                } else {
                                    if (a.getUTCSeconds() > b.getUTCSeconds()) {
                                        return -1;
                                    } else if (a.getUTCSeconds() < b.getUTCSeconds()) {
                                        return 1;
                                    } else {
                                        if (a.getUTCMilliseconds() > b.getUTCMilliseconds()) {
                                            return -1;
                                        } else if (a.getUTCMilliseconds() < b.getUTCMilliseconds()) {
                                            return 1;
                                        } else {
                                            return 0;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}