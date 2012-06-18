#!/usr/bin/python

from pymongo import Connection
from bson.objectid import ObjectId
import os
import sys

connection = Connection()
db = connection.troncales

for enlace in db.enlaces.find():
    supernodos = enlace["supernodos"]
    enlace["supernodos"] = [ ObjectId(supernodos[0]), ObjectId(supernodos[1]) ]
    print(enlace)
    db.enlaces.save(enlace)
