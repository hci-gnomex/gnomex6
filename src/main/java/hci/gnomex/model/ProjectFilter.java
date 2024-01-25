package hci.gnomex.model;


import hci.framework.model.DetailObject;
import hci.gnomex.security.SecurityAdvisor;

public class ProjectFilter extends DetailObject {
  
  
  // Criteria
  private Integer               idAppUser;
  private Integer               idLab;
  
  
  private StringBuffer          queryBuf;
  private boolean              addWhere = true;
  private SecurityAdvisor       secAdvisor;
  
  
  public StringBuffer getQuery(SecurityAdvisor secAdvisor) {
      this.secAdvisor = secAdvisor;
      queryBuf = new StringBuffer();

      queryBuf.append(" SELECT DISTINCT proj.id, proj.name, proj.description, proj.idLab, proj.idAppUser ");

      getQueryBody(queryBuf);

//      System.out.println ("[ProjectFilter] Query: " + queryBuf.toString());
      return queryBuf;

    }

    public void getQueryBody(StringBuffer queryBuf) {

      queryBuf.append(" FROM        Project as proj ");
      queryBuf.append(" LEFT JOIN   proj.requests as req ");
      queryBuf.append(" LEFT JOIN   req.collaborators as collab ");
      queryBuf.append(" JOIN                proj.lab as projectLab ");
      queryBuf.append(" LEFT JOIN           projectLab.coreFacilities as labFacilities ");

      // removed || secAdvisor.hasPermission(SecurityAdvisor.CAN_SUBMIT_FOR_OTHER_CORES) 10/11/2023

      if (!secAdvisor.hasPermission(SecurityAdvisor.CAN_ADMINISTER_ALL_CORE_FACILITIES)
              && (secAdvisor.hasPermission(SecurityAdvisor.CAN_ACCESS_ANY_OBJECT) )) {
        // Admins/submitter must do security limit by lab core facility.
//      queryBuf.append(" JOIN                proj.lab as projectLab ");
//      queryBuf.append(" LEFT JOIN           projectLab.coreFacilities as labFacilities ");
      }

      addRequestCriteria();
      addSecurityCriteria();

      queryBuf.append(" order by proj.name");

    }



    private void addRequestCriteria() {

      // Search by lab
      if (idLab != null){
        this.addWhereOrAnd();
        queryBuf.append(" proj.idLab =");
        queryBuf.append(idLab);
      }
      // Search by user
      if (idAppUser != null){
        this.addWhereOrAnd();
        queryBuf.append(" proj.idAppUser = ");
        queryBuf.append(idAppUser);
      }


    }

    // change to ignore corefacility tim 10/16/23
    private void addSecurityCriteria() {
      secAdvisor.buildSpannedSecurityCriteria(queryBuf, "proj", "req", "collab", addWhere, "req.codeVisibility", true, "req.idRequest", "labFacilities", true);
  }
    
  
  protected boolean addWhereOrAnd() {
    if (addWhere) {
      queryBuf.append(" WHERE ");
      addWhere = false;
    } else {
      queryBuf.append(" AND ");
    }
    return addWhere;
  }

  
  public Integer getIdLab() {
    return idLab;
  }

  
  public Integer getIdUser() {
    return idAppUser;
  }

  
  
  
  public void setIdLab(Integer idLab) {
    this.idLab = idLab;
  }

  
  public void setIdUser(Integer idAppUser) {
    this.idAppUser = idAppUser;
  }



  
  
}
