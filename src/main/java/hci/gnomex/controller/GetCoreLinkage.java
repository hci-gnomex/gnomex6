package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.utility.HttpServletWrappedRequest;
import org.apache.log4j.Logger;

import javax.net.ssl.HttpsURLConnection;
import javax.servlet.http.HttpSession;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.Serializable;
import java.net.URL;


public class GetCoreLinkage extends GNomExCommand implements Serializable {

    private static Logger LOG = Logger.getLogger(GetCoreLinkage.class);

  private String theURL = null;
  private String alias = null;

  public void validate() {
  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {

    if (request.getParameter("alias") != null && !request.getParameter("alias").isEmpty()) {
      alias = request.getParameter("alias");
    }
      System.out.println("Alias: " + alias);
  }

  public Command execute() throws RollBackCommandException {

      theURL = "https://hci-as3.hci.utah.edu/core/api/sample/search-by-alias/" + alias;
      theURL += "?Content-Type=application/json";
      theURL += "&withCredentials=true";

        try {
            URL url = new URL(theURL);
            System.out.print("URL: " + theURL);
            HttpsURLConnection connection = (HttpsURLConnection) url.openConnection();

            // Set request method (GET, POST, PUT, DELETE, etc.)
            connection.setRequestMethod("GET");

            // Add request headers
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setRequestProperty("withCredentials", "true");

            // Get response code
            int responseCode = connection.getResponseCode();
            System.out.println("Response Code: " + responseCode);

            // Read response body
            if (responseCode == HttpsURLConnection.HTTP_OK) {
                BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                String inputLine;
                StringBuilder response = new StringBuilder();

                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }
                in.close();

                this.jsonResult = response.toString();
                System.out.print("Response: " + this.jsonResult);

                if (isValid()) {
                    setResponsePage(this.SUCCESS_JSP);
                } else {
                    setResponsePage(this.ERROR_JSP);
                }

            }
        }
catch (Exception e)
{
	System.out.println ("***ERROR*** GetCoreLinkage: " + e);
}


    return this;
  }

}
