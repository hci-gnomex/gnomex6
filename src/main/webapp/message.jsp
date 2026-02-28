<%@ page import="javax.json.JsonObject" %>
<%@ page import="javax.json.Json" %><%
String message = (String) ((request.getAttribute("message") != null) ? request.getAttribute("message") : "");
String statusCode = (String) ((request.getAttribute("statusCode") != null) ? request.getAttribute("statusCode") : "SUCCESS");
JsonObject resultObject = Json.createObjectBuilder().add("result", statusCode).add("message", message).build();
out.print(resultObject.toString());
%>