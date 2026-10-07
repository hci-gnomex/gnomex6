package hci.gnomex.security;

import org.junit.Test;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class DuoEligibilityTest {

    @Test
    public void acceptsUNumbersWithSevenOrEightDigits() {
        assertTrue(DuoEligibility.isHciUniversityId("u1234567"));
        assertTrue(DuoEligibility.isHciUniversityId("U12345678"));
        assertTrue(DuoEligibility.isHciUniversityId("  u1234567 "));
    }

    @Test
    public void rejectsEverythingElse() {
        assertFalse(DuoEligibility.isHciUniversityId(null));
        assertFalse(DuoEligibility.isHciUniversityId(""));
        assertFalse(DuoEligibility.isHciUniversityId("u123456"));      // too short
        assertFalse(DuoEligibility.isHciUniversityId("u123456789"));   // too long
        assertFalse(DuoEligibility.isHciUniversityId("x1234567"));
        assertFalse(DuoEligibility.isHciUniversityId("u12345a7"));
        assertFalse(DuoEligibility.isHciUniversityId("jdoe@utah.edu"));
    }
}
