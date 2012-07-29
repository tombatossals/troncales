#!/usr/bin/python

from pymongo import Connection
import os
import sys

connection = Connection()
db = connection.troncales

def getips():
    ips = list()
    for supernodo in db.supernodos.find():
        if supernodo.get('validated'):
            ips.append(supernodo.get('ip'))

    return ips


if len(sys.argv) < 3:
    print("%s <name> <newip>" % sys.argv[0])
    sys.exit()

name = sys.argv[1]
newip = sys.argv[2]

supernodo = db.supernodos.find_one( { 'name': name } );

db.supernodos.update( supernodo, { "$addToSet": { "ips": newip } }, safe=True)
