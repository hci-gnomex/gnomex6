package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.model.PropertyDictionary;
import hci.gnomex.security.SecurityAdvisor;
import hci.gnomex.utility.DictionaryHelper;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import nki.exceptions.EmptyResultSetCollection;
import nki.exceptions.InvalidCredentialsException;
import nki.exceptions.MissingCommandDetailException;
import nki.exceptions.UnimplementedCommandException;
import nki.objects.Summary;
import nki.objects.SummaryCollection;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.jdom.Document;
import org.jdom.JDOMException;
import org.jdom.input.SAXBuilder;
import org.jdom.output.XMLOutputter;

import javax.servlet.http.HttpSession;
import java.io.*;
import java.net.InetSocketAddress;
import java.nio.channels.AsynchronousCloseException;
import java.nio.channels.NoConnectionPendingException;
import java.nio.channels.SocketChannel;
import java.util.ListIterator;
public class MetrixServerInterface extends GNomExCommand implements Serializable {

  private static Logger LOG = Logger.getLogger(MetrixServerInterface.class);

  public void validate() {

  }

  public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
    //filter = new MetrixInterfaceFilter();
    //HashMap errors = this.loadDetailObject(request, filter);
    //this.addInvalidFields(errors);
  }

  public Command execute() throws RollBackCommandException {
    String srvResp = "<SummaryCollection />";

    try {
      //if(isValid()){
      if (this.getSecurityAdvisor().hasPermission(SecurityAdvisor.CAN_MANAGE_WORKFLOW)) {
        Session sess = this.getSecAdvisor().getReadOnlyHibernateSession(this.getUsername());
        DictionaryHelper dh = DictionaryHelper.getInstance(sess);

        try{
          SocketChannel sChannel = SocketChannel.open();
          sChannel.configureBlocking(true);
          String host = dh.getPropertyDictionary(PropertyDictionary.METRIX_SERVER_HOST);
          int port = Integer.parseInt(dh.getPropertyDictionary(PropertyDictionary.METRIX_SERVER_PORT));

          if(Integer.parseInt(dh.getPropertyDictionary(PropertyDictionary.METRIX_SERVER_PORT)) < 1025){
            this.addInvalidField("Invalid configuration.", "Invalid configuration details for MetrixServer. Please check the dictionary properties.");
            setResponsePage(this.ERROR_JSP);
          }

          if(sChannel.connect(new InetSocketAddress(host, port))){

            // Create OutputStream for sending objects.
            ObjectOutputStream oos = new ObjectOutputStream(sChannel.socket().getOutputStream());

            // Cteate Inputstream for receiving objects.
            ObjectInputStream ois = new ObjectInputStream(sChannel.socket().getInputStream());

            try{
              if(isValid()){
                nki.objects.Command sendCommand = new nki.objects.Command();

                // Set a value for command
                sendCommand.setFormat("XML");
                sendCommand.setState(12); // Select run state (1 - running, 2 - finished, 3 - errors / halted, 4 - FC needs turn, 5 - init) || 12 - ALL
                sendCommand.setCommand("FETCH");
                sendCommand.setMode("CALL");
                sendCommand.setType("DETAIL");
                oos.writeObject(sendCommand);
                oos.flush();

                boolean listen = true;

                Object serverAnswer = new Object();
                serverAnswer = ois.readObject();

                while(listen){
                  if(serverAnswer instanceof Command){	// Answer is a Command with info message.
                    nki.objects.Command commandIn = (nki.objects.Command) serverAnswer;
                    if(commandIn.getCommand() != null){
                      System.out.println("[SERVER] " + commandIn.getCommand());
                    }
                  }

                  if(serverAnswer instanceof SummaryCollection){
                    SummaryCollection sc = (SummaryCollection) serverAnswer;
                    ListIterator litr = sc.getSummaryIterator();

                    while(litr.hasNext()){
                      Summary sum = (Summary) litr.next();
                    }
                  }

                  if(serverAnswer instanceof String){ 			// Server returned a XML String with results.
                    srvResp = (String) serverAnswer;
                    LOG.info("Server replied with XML");
                    listen = false;
                  }

                  if(serverAnswer instanceof EmptyResultSetCollection){
                    System.out.println(serverAnswer.toString());
                    listen = false;
                  }

                  if(serverAnswer instanceof InvalidCredentialsException){
                    System.out.println(serverAnswer.toString());
                    listen = false;
                  }

                  if(serverAnswer instanceof MissingCommandDetailException){
                    System.out.println(serverAnswer.toString());
                    listen = false;
                  }

                  if(serverAnswer instanceof UnimplementedCommandException){
                    System.out.println(serverAnswer.toString());
                    listen = false;
                  }
                }
              }
            }catch(IOException Ex){
              //		LOG.error("IOException in Metrix Client.", Ex);
            }
          }
        }catch(EOFException ex){
          LOG.error("Server has shutdown.");
        }catch(NoConnectionPendingException NCPE){
          LOG.error("Communication channel is not connection and no operation has been initiated.");
        }catch(AsynchronousCloseException ACE){
          LOG.error("Another client has shutdown the server. Channel communication prohibited by issueing a direct command.");
        }

        SAXBuilder builder = new SAXBuilder();
        Document doc = new Document();

        try{
          doc = builder.build(new StringReader(srvResp));
        }catch(JDOMException JEx){
          System.out.println("Error in SAXBuilder " + JEx);
        }

        XMLOutputter out = new org.jdom.output.XMLOutputter();
        this.xmlResult = out.outputString(doc);

        // Send redirect with response SUCCESS or ERROR page.
        setResponsePage(this.SUCCESS_JSP);

      } else {
        this.addInvalidField("Insufficient permissions", "Insufficient permission to manage workflow.");
        setResponsePage(this.ERROR_JSP);
      }
      //	}	// end main isValid()
    }catch (Exception e) {
      this.errorDetails = Util.GNLOG(LOG,"An exception has occurred in MetrixServerInterface ", e);
      throw new RollBackCommandException(e.getMessage());
    }

    return this;
  }
}
