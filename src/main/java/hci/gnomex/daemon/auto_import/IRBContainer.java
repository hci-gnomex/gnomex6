package hci.gnomex.daemon.auto_import;

import java.util.List;
import java.util.Map;
import java.util.Objects;

public class IRBContainer  implements Comparable<IRBContainer>{
    private String irbName;
    private String irbEmail;
    private Integer HCIPersonID;
    private Map<String, List<Integer>> irbOrders;



    public String getIrbName() {
        return irbName;
    }

    public void setIrbName(String irbName) {
        this.irbName = irbName;
    }

    public String getIrbEmail() {
        return irbEmail;
    }

    public void setIrbEmail(String irbEmail) {
        this.irbEmail = irbEmail;
    }

    public Map<String, List<Integer>> getIrbOrders() {
        return irbOrders;
    }

    public void setIrbOrders(Map<String, List<Integer>> irbOrders) {
        this.irbOrders = irbOrders;
    }

    @Override
    public int compareTo(IRBContainer irb){
        return this.irbName.compareTo(irb.irbName);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        IRBContainer that = (IRBContainer) o;
        return getIrbName().equals(that.getIrbName()) &&
                Objects.equals(getIrbEmail(), that.getIrbEmail()) &&
                Objects.equals(getIrbOrders(), that.getIrbOrders());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getIrbName(), getIrbEmail(), getIrbOrders());
    }
}
