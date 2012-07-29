#!/usr/bin/python

from pymongo import Connection
import os
import sys

connection = Connection()
db = connection.troncales

if len(sys.argv) < 2:
    print("%s <name> <ip>" % sys.argv[0])
    sys.exit()

name = sys.argv[1]
ip = sys.argv[2]
for s in db.supernodos.find({ 'ips': ip, 'name': name }):
    ips = s.get("ips")
    ips.remove(ip)
    s["ips"] = ips
    db.supernodos.save(s)
