package hci.gnomex.utility;

import org.junit.Test;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class PasswordUtilTest {

    // Same cases as PasswordUtil.main(), plus a few boundary checks.

    @Test
    public void rejectsNullAndEmpty() {
        assertFalse(PasswordUtil.passwordMeetsRequirements(null));
        assertFalse(PasswordUtil.passwordMeetsRequirements(""));
    }

    @Test
    public void enforcesLengthBetween8And25() {
        assertFalse(PasswordUtil.passwordMeetsRequirements("!Short!"));                     // 7
        assertTrue(PasswordUtil.passwordMeetsRequirements("Short+OK"));                     // 8
        assertTrue(PasswordUtil.passwordMeetsRequirements("IsMyNewPasswordTooLong?No"));    // 25
        assertFalse(PasswordUtil.passwordMeetsRequirements("IsMyNewPasswordTooLong?Yes"));  // 26
    }

    @Test
    public void requiresThreeCharacterClasses() {
        assertFalse(PasswordUtil.passwordMeetsRequirements("abcd1234"));         // lower + digit
        assertFalse(PasswordUtil.passwordMeetsRequirements("JustLettersOops"));  // lower + upper
        assertTrue(PasswordUtil.passwordMeetsRequirements("Abcd1234"));          // lower + upper + digit
        assertTrue(PasswordUtil.passwordMeetsRequirements("GotSymbols!"));       // lower + upper + other
        assertTrue(PasswordUtil.passwordMeetsRequirements("no-upper-case-1"));   // lower + other + digit
        assertTrue(PasswordUtil.passwordMeetsRequirements("Password1"));
    }

    @Test
    public void rejectsWhitespaceAndSlashes() {
        assertFalse(PasswordUtil.passwordMeetsRequirements("Pretty, but has SPACES!"));
        assertFalse(PasswordUtil.passwordMeetsRequirements("Has\tTab1Char"));
        assertFalse(PasswordUtil.passwordMeetsRequirements("Look/Some\\Slashes!"));
        assertFalse(PasswordUtil.passwordMeetsRequirements("Forward/Slash1"));
        assertFalse(PasswordUtil.passwordMeetsRequirements("Back\\Slash1"));
    }
}
