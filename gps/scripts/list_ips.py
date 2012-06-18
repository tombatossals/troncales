#!/usr/bin/python

from pymongo import Connection
import os
import sys

connection = Connection()
db = connection.troncales

if len(sys.argv) < 2:
    print("%s <name>" % sys.argv[0])
    sys.exit()

name = sys.argv[1]
for s in db.supernodos.find({ 'name': name }):
    for ip in s.get("ips"):
        print(ip)
