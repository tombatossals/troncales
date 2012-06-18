#!/usr/bin/python

from pymongo import Connection
from bson.objectid import ObjectId
import subprocess
import os
import sys

TRACEROUTE_CMD = 'ssh guest@%s "/tool traceroute %s" | sed -e s/"  *"/" "/g | cut -f3 -d" " | tail -n +2'

connection = Connection()
db = connection.troncales

def getips():
    ips = list()
    for supernodo in db.supernodos.find():
        if supernodo.get('validated'):
            ips.append(supernodo.get('ip'))

    return ips


supernodos = [ s.get("name") for s in db.supernodos.find() ]

db.caminos.remove()

for origin in db.supernodos.find( { "name": "castalia" } ):
    for destiny in db.supernodos.find():
        if origin.get("name") != destiny.get("name"): 
            ippath = subprocess.check_output(TRACEROUTE_CMD % (origin.get("mainip"), destiny.get("mainip")), shell=True)
            ippath = [ ip.decode("utf-8") for ip in ippath.split() ]
            path = dict()
            path['supernodos'] = [ origin.get("_id"), destiny.get("_id") ]
            path['enlaces'] = list()

            main = origin
            for ip in ippath:
                next = db.supernodos.find_one( { 'ips': ip } )
                if next:
                    enlace = db.enlaces.find_one( { "supernodos": { "$all": [ ObjectId(main.get("_id")), ObjectId(next.get("_id")) ] } });
                    if enlace:
                        path['enlaces'].append(enlace.get("_id"))
                    else:
                        pass
                        print(main.get("name"), next.get("name"), ippath)
                else:
                    print(ip)
                main = next
            db.caminos.save(path)

