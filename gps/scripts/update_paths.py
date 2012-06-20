#!/usr/bin/python
# vim: set fileencoding=utf-8 :


from pymongo import Connection
from bson.objectid import ObjectId
import subprocess
import os
import sys

TRACEROUTE_CMD = os.path.dirname(__file__) + '/traceroute.sh %s %s'

connection = Connection()
db = connection.troncales
db.caminos.remove()

for origin in db.supernodos.find({ "validated": True } ):
    if origin.get("mainip") in [ "10.228.169.225", "10.228.168.193" ]:
        continue

    for destiny in db.supernodos.find( { "validated": True } ):
        if origin.get("name") != destiny.get("name"): 
            print("Calculando camino de: ", origin.get("name"), destiny.get("name"))
            if db.caminos.find_one( { "supernodos": { "$all": [ ObjectId(origin.get("_id")), ObjectId(destiny.get("_id")) ] } } ):
                continue

            ippath = subprocess.check_output(TRACEROUTE_CMD % (origin.get("mainip"), destiny.get("mainip")), shell=True)
            ippath = [ ip.decode("utf-8") for ip in ippath.split() ]
            path = dict()
            path['supernodos'] = [ origin.get("_id"), destiny.get("_id") ]
            path['enlaces'] = list()

            main = origin
            for ip in ippath:
                if ip.find("192") == 0:
                    print("Encontrada una IP extraña: %s" % ip)
                    continue
                next_node = db.supernodos.find_one( { 'ips': ip } )
                if main and next_node:
                    enlace = db.enlaces.find_one( { "supernodos": { "$all": [ ObjectId(main.get("_id")), ObjectId(next_node.get("_id")) ] } });
                    if enlace:
                        path['enlaces'].append(enlace.get("_id"))
                        main = next_node
                    else:
                        print("No encontrado: ", main.get("name"), next_node.get("name"), ip, ippath, main.get("_id"), next_node.get("_id"))
                        #sys.exit()
                else:
                    print(ip, main, next_node)
                    #sys.exit()

            db.caminos.save(path)

