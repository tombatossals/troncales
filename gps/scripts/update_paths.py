#!/usr/bin/python

from pymongo import Connection
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


ips = getips()

for origin in ips:

    for destiny in ips:

        if origin != destiny:
            path = subprocess.check_output(TRACEROUTE_CMD % (origin, destiny), shell=True)
            print(path)
            sys.exit()
