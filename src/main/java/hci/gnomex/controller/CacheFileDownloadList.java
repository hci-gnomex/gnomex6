package hci.gnomex.controller;

import hci.framework.control.Command;
import hci.gnomex.utility.HttpServletWrappedRequest;
import hci.gnomex.utility.Util;
import hci.framework.control.RollBackCommandException;
import hci.gnomex.utility.FileDescriptorParser;

import java.io.Serializable;

import javax.json.Json;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;

public class CacheFileDownloadList extends GNomExCommand implements Serializable {

    // the static field for logging in Log4J
    private static Logger LOG = Logger.getLogger(CacheFileDownloadList.class);

    private FileDescriptorParser parser = null;

    protected final static String SESSION_KEY_FILE_DESCRIPTOR_PARSER = "GNomExFileDescriptorParser";

    public void validate() {
    }

    public void loadCommand(HttpServletWrappedRequest request, HttpSession session) {
        this.validate();

        // Get the files JSON string
        try {
            this.parser = new FileDescriptorParser(Util.readJSONArray(request, "fileDescriptorJSONString"));
        } catch (Exception e) {
            this.addInvalidField("fileDescriptorJSONString", "Invalid fileDescriptorJSONString");
            this.errorDetails = Util.GNLOG(LOG, "Cannot parse fileDescriptorJSONString", e);
        }
    }

    public Command execute() throws RollBackCommandException {
        if (isValid()) {
            this.jsonResult = Json.createObjectBuilder()
                    .add("result", "SUCCESS")
                    .build().toString();
        } else {
            this.jsonResult = Json.createObjectBuilder()
                    .add("result", "INVALID")
                    .build().toString();
        }

        return this;
    }

    public HttpServletWrappedRequest setRequestState(HttpServletWrappedRequest request) {
        request.setAttribute("jsonResult", this.jsonResult);
        return request;
    }

    public HttpServletResponse setResponseState(HttpServletResponse response) {
        return response;
    }

    public HttpSession setSessionState(HttpSession session) {
        session.setAttribute(CacheFileDownloadList.SESSION_KEY_FILE_DESCRIPTOR_PARSER, this.parser);
        return session;
    }

}
