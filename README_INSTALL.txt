Please see Installation Guide here:  http://hci-bio-dev.hci.utah.edu/gnomexDocumentation/wordpress/?page_id=980


RUNNING ON JAVA 17 (Tomcat 9)
=============================

1. Open java.lang to the web app

   GNomEx uses Weld 2.4 (CDI), which needs reflective access to java.lang. Without it,
   Java 17 refuses and the gnomex context fails to start with:

     WELD-001524: Unable to load proxy class for bean ... javax.enterprise.inject.Instance
     InaccessibleObjectException: ... module java.base does not "opens java.lang" to unnamed module

   Add these JVM options in Tomcat's bin/setenv.bat (Windows) or bin/setenv.sh (Linux).
   java.base/java.lang is the one Weld needs; the others are used elsewhere in GNomEx.

   Windows, bin\setenv.bat -- NO quotes around the value. In a .bat file the quotes become
   part of the value, Java then sees all the options as one argument, warns
   "Unknown module: ALL-UNNAMED --add-opens ..." and opens nothing:

     set JAVA_OPTS=--add-opens=java.base/java.lang=ALL-UNNAMED --add-opens=java.base/java.util=ALL-UNNAMED --add-opens=java.base/java.io=ALL-UNNAMED --add-opens=java.base/java.text=ALL-UNNAMED --add-opens=java.desktop/java.awt.font=ALL-UNNAMED --add-opens=java.rmi/sun.rmi.transport=ALL-UNNAMED
     set JAVA_TOOL_OPTIONS=-Duser.language=en -Duser.country=US

   Linux, bin/setenv.sh -- here the quotes ARE needed (the shell removes them):

     JAVA_OPTS="--add-opens=java.base/java.lang=ALL-UNNAMED --add-opens=java.base/java.util=ALL-UNNAMED --add-opens=java.base/java.io=ALL-UNNAMED --add-opens=java.base/java.text=ALL-UNNAMED --add-opens=java.desktop/java.awt.font=ALL-UNNAMED --add-opens=java.rmi/sun.rmi.transport=ALL-UNNAMED"

   To check it took effect, look for this line near the top of Tomcat's startup log:

     Command line argument: --add-opens=java.base/java.lang=ALL-UNNAMED

2. Duo settings (Universal Prompt)

   When Duo is turned on, /properties/duo.properties (C:\properties\duo.properties on Windows)
   must include redirect_uri as well as ikey, skey and host. Without it every load of the
   login page fails with "Missing required Duo property (one of): redirect_uri, redirectUri".
   Point it at the Angular sign-in route of this server, e.g.

     redirect_uri=https://your-server/gnomex/authenticate
     redirect_uri=http://localhost/gnomex/authenticate      (local install)

   Duo sends the browser back to that URL after verification.
