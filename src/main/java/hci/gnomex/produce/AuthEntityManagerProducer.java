package hci.gnomex.produce;

import hci.ri.auth.annotation.AuthDatasource;

import javax.enterprise.inject.Produces;
import javax.persistence.EntityManager;

/* GNomEx doesn't use the Auth model */
public class AuthEntityManagerProducer {

    @Produces
    @AuthDatasource
    private EntityManager getEm() {
        return null;
    }

}