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

def checkip(ip):
    ret = subprocess.call("ping -W 1 -c 1 %s" % ip, shell=True, stdout=open('/dev/null', 'w'), stderr=subprocess.STDOUT)
    return not ret

def get_alive_supernodos():
    supernodos = list()
    for s in db.supernodos.find( { "validated": True } ):
        if checkip(s['mainip']):
            supernodos.append(s)

    return supernodos

supernodos = get_alive_supernodos()

for origin in supernodos:
    if origin.get("mainip") in [ "10.228.169.225", "10.228.168.193" ]:
        continue

    print("Calculando caminos de ", origin.get("name"))
    for destiny in supernodos:
        if origin.get("name") != destiny.get("name"): 
            if db.caminos.find_one( { "supernodos": { "$all": [ ObjectId(origin.get("_id")), ObjectId(destiny.get("_id")) ] } } ):
                continue

            ippath = subprocess.check_output(TRACEROUTE_CMD % (origin.get("mainip"), destiny.get("mainip")), shell=True)
            ippath = [ ip.decode("utf-8") for ip in ippath.split() ]
            path = dict()
            path['supernodos'] = [ origin.get("_id"), destiny.get("_id") ]
            path['enlaces'] = list()

            #print("Destino: ", destiny.get("name"), ippath)
            main = origin
            for ip in ippath:
                next_node = db.supernodos.find_one( { 'ips': ip } )
                if main and next_node:
                    enlace = db.enlaces.find_one( { "supernodos": { "$all": [ ObjectId(main.get("_id")), ObjectId(next_node.get("_id")) ] } });
                    if enlace:
                        path['enlaces'].append(enlace.get("_id"))
                        main = next_node
                    else:
                        print("Enlace no encontrado: ", origin.get("name"), main.get("name"), next_node.get("name"), ip, ippath)
                        main = next_node
                        #sys.exit()
                else:
                    print("Destino: ", destiny.get("name"), ippath)
                    print("No encuentro el nodo siguiente:", ip, main.get("mainip"))
                    #sys.exit()

            db.caminos.save(path)
