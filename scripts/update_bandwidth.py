#!/usr/bin/python

from pymongo import Connection
import subprocess
import os

BANDWIDTH_SCRIPT=os.path.join(os.path.abspath(os.path.dirname(__file__)), "rrdtool_bandwidth.sh" )
TRAFFIC_SCRIPT=os.path.join(os.path.abspath(os.path.dirname(__file__)), "rrdtool_traffic.sh" )

connection = Connection()
db = connection.troncales

for enlace in db.enlaces.find():

	if enlace.get("validated"):
		bandwidth_id = enlace.get("rrdtool_bandwidth_id")
		traffic_id = enlace.get("rrdtool_traffic_id")

		if bandwidth_id and traffic_id:
			bandwidth = subprocess.check_output("%s %s" % (BANDWIDTH_SCRIPT, bandwidth_id), shell=True)
			bandwidth = bandwidth.strip().decode("utf-8")
			traffic = subprocess.check_output("%s %s" % (TRAFFIC_SCRIPT, traffic_id), shell=True)
			traffic = traffic.strip().decode("utf-8")
			if int(float(bandwidth)) == 0:
				saturation = 100
			else:
				saturation = int(float(traffic)/float(bandwidth)*100)


			if saturation < 25:
				saturation = 0
			elif saturation < 50:
				saturation = 1
			elif saturation < 75:
				saturation = 2
			else:
				saturation = 3
		else:
			saturation = 100
			bandwidth = 0

		enlace["bandwidth"] = bandwidth
		enlace["saturation"] = saturation
		db.enlaces.save(enlace)
