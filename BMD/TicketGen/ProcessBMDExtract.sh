#!/bin/bash
#################################################################################################
## Written By: Manjit S Sodhi  
## Purpose: This shell script fetches the BVT extract MCR,PER & RESOURCE files from mailbox and
##          sends the reminder to stakeholders at perodioc intervals incase files are not fetched   
##	    Incase files are fetched, this script inturn invokes Transform and Load scripts 	
## Jul 3, 2017
#################################################################################################
export PATH=/usr/local/bin:/usr/bin:/usr/local/sbin:/usr/sbin:/usr/local/lib:/home/db2inst1/sqllib/bin:/home/db2inst1/sqllib/adm:/home/db2inst1/sqllib/misc:/home/db2inst1/.local/bin:/home/db2inst1/bin:/home/db2inst1/mongodb-linux-x86_64-amazon-3.2.1/bin

#set -x
DATE=`date +%Y-%m-%d`
rm -f /tmp/`basename ${0}`-${DATE}.log
exec 1> /tmp/`basename ${0}`-${DATE}.log
DAY=`date +%a`
MCR="Report_BMCR_${DATE}"
PER="Report_BPER_${DATE}"
DATADIR="/home/db2inst1/BMD/TicketGen"
export SSHPASS=DVTpwd
SCRIPTDIR="/home/db2inst1/BMD/TicketGen"
MCRLIST="smanjit@in.ibm.com,satjakku@in.ibm.com,kshitiz.shrivastava@in.ibm.com,jayabali@in.ibm.com"
PERLIST="smanjit@in.ibm.com,satjakku@in.ibm.com,RaghavKrishnaMurthy@in.ibm.com"

ProcessFile()
{
	echo "Load File \"${1}\""
	file=`find ${DATADIR} -name ${1}\*csv`  
	echo "FILE:$file"
	/usr/local/bin/node ${SCRIPTDIR}/main.js ${file} > /tmp/`basename ${0}`-${DATE}.log
	echo "Copy to DB2 \"${1}\""
	/usr/local/bin/node ${SCRIPTDIR}/migrate.js > /tmp/`basename ${0}`-${DATE}.log
}

fetchFile()
{
	echo "Fetch File \"${1}\"" 
sshpass -e sftp -oBatchMode=no -b - DVTuser1@sftpnatest.sterlingcommerce.com << !
   cd Receive
   lcd /home/db2inst1/BMD/TicketGen 
   mget ${1}*csv
   bye
!
	if [ $? -eq 0 ]
	then
		ProcessFile $1 $2
	else 
		ProcessFile $1 $2
		echo "Unable to get file"
#		echo ""|mailx -s "$DATE ${2} Extract Missing" -r "BVTServer" -c ${3} albert.sunild@in.ibm.com 
	fi	
}

db2 "CONNECT TO DATA"
db2 "SET SCHEMA REPORT"

fetchFile $MCR $MCRLIST 
fetchFile $PER $PERLIST

db2 "TERMINATE"
