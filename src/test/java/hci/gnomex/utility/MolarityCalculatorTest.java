package hci.gnomex.utility;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class MolarityCalculatorTest {

    private static final double DELTA = 1e-9;

    @Test
    public void convertsNgPerUlToNanomolar() {
        // nM = ng/ul / (660 * bp) * 1e6
        assertEquals(10.0, MolarityCalculator.calculateConcentrationInnM(6.6, 1000), DELTA);
        assertEquals(5.0, MolarityCalculator.calculateConcentrationInnM(1.65, 500), DELTA);
        assertEquals(0.0, MolarityCalculator.calculateConcentrationInnM(0, 300), DELTA);
    }

    @Test
    public void calculatesDilutionVolume() {
        // C1 * V1 = C2 * V2  ->  V1 = C2 * V2 / C1
        assertEquals(10.0, MolarityCalculator.calculateDilutionVol(10, 2, 50), DELTA);
        assertEquals(50.0, MolarityCalculator.calculateDilutionVol(2, 2, 50), DELTA);
    }

    @Test
    public void dilutionOfZeroConcentrationIsInfinite() {
        assertEquals(Double.POSITIVE_INFINITY, MolarityCalculator.calculateDilutionVol(0, 2, 50), 0);
    }
}
