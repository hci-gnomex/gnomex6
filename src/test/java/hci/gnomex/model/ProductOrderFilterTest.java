package hci.gnomex.model;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import hci.gnomex.security.SecurityAdvisor;
import java.sql.Date;
import org.junit.Before;
import org.junit.Test;

/**
 * The product order queries for users without the "administer all cores" permission. Their security
 * clause used to always start with AND, so with no other filter the query was
 * "... JOIN po.lab as lab AND ..." and Hibernate failed ("unexpected token: AND"); Product Orders
 * then opened empty.
 */
public class ProductOrderFilterTest {

  private SecurityAdvisor guest;

  @Before
  public void setUp() throws Exception {
    guest = SecurityAdvisor.createGuest();
  }

  /** The first criterion after the FROM clause must be introduced by WHERE, never AND. */
  private static void assertWellFormed(String query) {
    String afterFrom = query.substring(query.indexOf(" FROM "));
    int firstWhere = afterFrom.indexOf("WHERE");
    int firstAnd = afterFrom.indexOf(" AND ");
    assertFalse("no AND before the WHERE: " + query, firstAnd >= 0 && (firstWhere < 0 || firstAnd < firstWhere));
    assertFalse("only one WHERE: " + query, afterFrom.indexOf("WHERE", firstWhere + 1) > 0);
    // Seen 2026-11: "JOIN po.lab as labWHERE" (buildSecurityCriteria writes "WHERE " with no
    // leading space), which Hibernate rejected with "unexpected token: (".
    assertFalse("WHERE must be a separate word: " + query, query.matches("(?s).*\\wWHERE.*"));
  }

  @Test
  public void queryWithNoFiltersStartsItsCriteriaWithWhere() {
    String query = new ProductOrderFilter(guest).getProductOrderQuery().toString();
    assertWellFormed(query);
    assertTrue("the security clause is still applied: " + query, query.contains("WHERE"));
  }

  @Test
  public void queryWithAFilterJoinsTheSecurityClauseWithAnd() {
    ProductOrderFilter filter = new ProductOrderFilter(guest);
    filter.setIdLab(1);
    filter.setSubmitDateFrom(Date.valueOf("2020-01-01"));
    String query = filter.getProductOrderQuery().toString();
    assertWellFormed(query);
    assertTrue(query, query.contains("po.idLab =1"));
  }
}
