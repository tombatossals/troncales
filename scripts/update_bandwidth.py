#!/usr/bin/python

from pymongo import Connection
from bson import ObjectId
import subprocess
import os

BANDWIDTH_SCRIPT=os.path.join(os.path.abspath(os.path.dirname(__file__)), "rrdtool_bandwidth.sh" )
TRAFFIC_SCRIPT=os.path.join(os.path.abspath(os.path.dirname(__file__)), "rrdtool_traffic.sh" )

connection = Connection()
db = connection.troncales

for enlace in db.enlaces.find({ "active": True }):
        supernodos = list()
        for s in db.supernodos.find({ "_id": { "$in": [ ObjectId(l.get("id")) for l in enlace.get("supernodos") ] } }):
            supernodos.append(s)
        if len(supernodos) != 2:
            print("enlace no encontrado", enlace.get("_id"))
            continue

        s1 = supernodos[0]
        s2 = supernodos[1]

        bandwidth = subprocess.check_output("%s %s %s" % (BANDWIDTH_SCRIPT, s1.get("name"), s2.get("name")), shell=True)
        bandwidth = bandwidth.strip().decode("utf-8")
        if str(s1.get("_id")) == enlace.get("supernodos")[0].get("id"):
            s1_interface = enlace.get("supernodos")[0].get("iface")
            s2_interface = enlace.get("supernodos")[1].get("iface")
        else:
            s1_interface = enlace.get("supernodos")[1].get("iface")
            s2_interface = enlace.get("supernodos")[0].get("iface")

        traffic = subprocess.check_output("%s %s %s" % (TRAFFIC_SCRIPT, s1.get("name"), s1_interface), shell=True)
        if not traffic:
            traffic = subprocess.check_output("%s %s %s" % (TRAFFIC_SCRIPT, s2.get("name"), s2_interface), shell=True)

        traffic = traffic.strip().decode("utf-8")

        if not bandwidth or not traffic:
            print ("Datos no encontrados:", s1.get("name"), s2.get("name"), s1_interface, s2_interface)
            continue

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

        enlace["bandwidth"] = bandwidth
        enlace["saturation"] = saturation
        db.enlaces.save(enlace)
