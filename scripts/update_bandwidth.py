#!/usr/bin/python

from pymongo import Connection
import subprocess
import os

BANDWIDTH_SCRIPT=os.path.join(os.path.abspath(os.path.dirname(__file__)), "rrdtool_bandwidth.sh" )
TRAFFIC_SCRIPT=os.path.join(os.path.abspath(os.path.dirname(__file__)), "rrdtool_traffic.sh" )

connection = Connection()
db = connection.trunks

for enlace in db.enlaces.find():
	bandwidth_id = enlace.get("rrdtool_bandwidth_id")
	traffic_id = enlace.get("rrdtool_traffic_id")

	print bandwidth_id
	try:
		bandwidth = subprocess.check_output("%s %s" % (BANDWIDTH_SCRIPT, bandwidth_id), shell=True)
		bandwidth = bandwidth.strip().decode("utf-8")
		traffic = subprocess.check_output("%s %s" % (TRAFFIC_SCRIPT, traffic_id), shell=True)
		traffic = traffic.strip().decode("utf-8")
		saturation = int(float(traffic)/float(bandwidth)*100)
		enlace["bandwidth"] = bandwidth

		if saturation < 25:
			saturation = 0
		elif saturation < 50:
			saturation = 1
		elif saturation < 75:
			saturation = 2
		else:
			saturation = 3

		enlace["saturation"] = saturation
		db.enlaces.save(enlace)
	except:
		pass
