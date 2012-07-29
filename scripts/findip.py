#!/usr/bin/python

from pymongo import Connection
import os
import sys

connection = Connection()
db = connection.troncales

if len(sys.argv) < 2:
    print("%s <ip>" % sys.argv[0])
    sys.exit()

ip = sys.argv[1]
for s in db.supernodos.find({ 'ips': ip }):
    print(s.get("name"))
