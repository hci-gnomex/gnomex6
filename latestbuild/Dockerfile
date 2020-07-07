FROM centos:7

MAINTAINER Tim.Maness@hci.utah.edu

RUN mkdir /properties
WORKDIR /properties
RUN yum install -y unzip

RUN curl https://raw.githubusercontent.com/hci-gnomex/gnomex6/master/latestbuild/properties.tar -o properties.tar
# RUN unzip properties.zip
RUN tar -xf ./properties.tar

RUN mkdir /temp
WORKDIR /temp
RUN curl https://raw.githubusercontent.com/hci-gnomex/gnomex6/master/latestbuild/apache-tomcat-8.5.23.tar -o apache-tomcat-8.5.23.tar 
# RUN unzip apache-tomcat-8.5.23.zip
RUN tar -xf ./apache-tomcat-8.5.23.tar

RUN mkdir -p /home/u0974549/tomcat8523/
RUN mv * /home/u0974549/tomcat8523/.

ARG GN_PASSWORD
ARG GNGUEST_PASSWORD
ARG GN_DBHOSTIP
ARG GN_DBPORT
ARG GN_KEY

ENV GNOMEX_PASSWORD=$GN_PASSWORD
ENV GNOMEXGUEST_PASSWORD=$GNGUEST_PASSWORD
ENV GNOMEX_DBHOSTIP=$GN_DBHOSTIP
ENV GNOMEX_DBPORT=$GN_DBPORT
ENV GNOMEX_KEY=$GN_KEY

WORKDIR /temp
RUN curl https://raw.githubusercontent.com/hci-gnomex/gnomex6/master/latestbuild/fix.tar -o fix.tar
# RUN unzip fix.zip
RUN tar -xf ./fix.tar
RUN sed -i $'s/\r$//' ./fixproperties.sh
RUN bash ./fixproperties.sh

RUN yum install -y java-1.8.0-openjdk-headless

# mysql
#RUN yum install -y wget
#RUN wget http://repo.mysql.com/mysql-community-release-el7-5.noarch.rpm
#RUN rpm -ivh mysql-community-release-el7-5.noarch.rpm
#RUN yum update -y
#RUN yum install -y mysql-server

RUN mkdir -p /home/u0974549/tomcat8523/webapps/gnomex
WORKDIR /home/u0974549/tomcat8523/webapps/gnomex
RUN curl https://raw.githubusercontent.com/hci-gnomex/gnomex6/master/latestbuild/gnomex6.war -o gnomex6.war
RUN unzip gnomex6.war
WORKDIR /home/u0974549/tomcat8523/webapps/gnomex/WEB-INF
RUN mv /properties/shiro.ini .
WORKDIR /home/u0974549/tomcat8523/bin
RUN chmod 777 *

ENV JRE_HOME=/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.252.b09-2.el7_8.x86_64/jre
ENV JAVA_HOME=/usr/lib/jvm/java-1.8.0-openjdk-1.8.0.252.b09-2.el7_8.x86_64/jre

EXPOSE 8081
EXPOSE 8082 
EXPOSE 443

#WORKDIR /home/u0974549/tomcat8523/bin
#RUN bash ./startup.sh
CMD ["bash","-c","/home/u0974549/tomcat8523/bin/startup.sh"]
#ENTRYPOINT ["/bin/bash", "/home/u0974549/tomcat8523/bin/startup.sh"]

			  