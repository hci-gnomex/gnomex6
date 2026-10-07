package hci.gnomex.utility;

import hci.gnomex.model.RequestStatus;
import org.junit.Test;

import static hci.gnomex.model.RequestStatus.COMPLETED;
import static hci.gnomex.model.RequestStatus.FAILED;
import static hci.gnomex.model.RequestStatus.NEW;
import static hci.gnomex.model.RequestStatus.PROCESSING;
import static hci.gnomex.model.RequestStatus.SUBMITTED;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

/**
 * Covers RequestStatusComparator and the ProductUtil product-gate rules, which decide when
 * product quantities are consumed or refunded as an experiment moves through its workflow.
 */
public class ProductGateTest {

    private final RequestStatusComparator comp = new RequestStatusComparator();

    // ---------------------------------------------------------------- comparator

    @Test
    public void comparatorFollowsWorkflowOrder() {
        assertTrue(comp.compare(NEW, SUBMITTED) < 0);
        assertTrue(comp.compare(SUBMITTED, PROCESSING) < 0);
        assertTrue(comp.compare(PROCESSING, COMPLETED) < 0);
        assertEquals(0, comp.compare(COMPLETED, FAILED));
    }

    @Test
    public void comparatorSortsUnknownStatusesFirst() {
        assertTrue(comp.compare(null, NEW) < 0);
        assertTrue(comp.compare(NEW, "") > 0);
        assertEquals(0, comp.compare(null, "bogus"));
    }

    @Test
    public void completedAndFailedAreTerminationStatuses() {
        assertTrue(comp.isTerminationStatus(COMPLETED));
        assertTrue(comp.isTerminationStatus(FAILED));
        assertFalse(comp.isTerminationStatus(PROCESSING));
        assertFalse(comp.isTerminationStatus(null));
    }

    // ---------------------------------------------------------------- forward through gate

    private boolean forward(String oldStatus, String newStatus, String gate) {
        return ProductUtil.isGoingForwardThroughProductGate(oldStatus, newStatus, gate, comp);
    }

    @Test
    public void forwardWhenCrossingANonTerminalGate() {
        assertTrue(forward(NEW, PROCESSING, PROCESSING));
        assertTrue(forward(SUBMITTED, COMPLETED, PROCESSING));
        assertTrue(forward(null, SUBMITTED, SUBMITTED));  // brand-new request
    }

    @Test
    public void notForwardWhenAlreadyPastTheGate() {
        assertFalse(forward(SUBMITTED, PROCESSING, SUBMITTED));
        assertFalse(forward(PROCESSING, PROCESSING, PROCESSING));
    }

    @Test
    public void notForwardWhenNotYetAtTheGate() {
        assertFalse(forward(NEW, SUBMITTED, PROCESSING));
    }

    @Test
    public void terminalGateRequiresTheMatchingTerminalStatus() {
        assertTrue(forward(PROCESSING, COMPLETED, COMPLETED));
        assertFalse(forward(PROCESSING, FAILED, COMPLETED));  // failing never consumes a COMPLETE gate
        assertTrue(forward(PROCESSING, FAILED, FAILED));
    }

    @Test
    public void forwardFromOneTerminalStatusToAnother() {
        assertTrue(forward(FAILED, COMPLETED, COMPLETED));
        assertFalse(forward(COMPLETED, FAILED, COMPLETED));
    }

    // ---------------------------------------------------------------- backward through gate

    private boolean backward(String oldStatus, String newStatus, String gate) {
        return ProductUtil.isGoingBackwardThroughProductGate(oldStatus, newStatus, gate, comp);
    }

    @Test
    public void backwardWhenReturningBehindTheGate() {
        assertTrue(backward(PROCESSING, SUBMITTED, PROCESSING));
        assertTrue(backward(COMPLETED, PROCESSING, COMPLETED));
    }

    @Test
    public void notBackwardWhenStayingAtOrPastTheGate() {
        assertFalse(backward(COMPLETED, PROCESSING, SUBMITTED));
        assertFalse(backward(PROCESSING, NEW, COMPLETED));
        assertFalse(backward(SUBMITTED, SUBMITTED, SUBMITTED));
    }

    @Test
    public void backwardBetweenTerminalStatuses() {
        assertTrue(backward(COMPLETED, FAILED, COMPLETED));
        assertFalse(backward(FAILED, COMPLETED, COMPLETED));
    }

    @Test
    public void forwardAndBackwardAreMutuallyExclusive() {
        String[] all = {null, NEW, SUBMITTED, PROCESSING, COMPLETED, FAILED};
        String[] gates = {SUBMITTED, PROCESSING, COMPLETED, FAILED};
        for (String gate : gates) {
            for (String from : all) {
                for (String to : all) {
                    if (to == null) {
                        continue;
                    }
                    assertFalse(from + " -> " + to + " gate " + gate,
                            forward(from, to, gate) && backward(from, to, gate));
                }
            }
        }
    }

    @Test
    public void statusConstantsHaveExpectedValues() {
        // Guard: the DB stores these codes, so a rename would silently break the gate.
        assertEquals("COMPLETE", RequestStatus.COMPLETED);
        assertEquals("FAILED", RequestStatus.FAILED);
    }
}
