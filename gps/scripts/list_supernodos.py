#!/usr/bin/python

from pymongo import Connection
import os
import sys

connection = Connection()
db = connection.troncales

for s in db.supernodos.find():
    print(s.get("name"))
