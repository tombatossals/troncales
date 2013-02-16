#!/usr/bin/python
import sys
import os
import subprocess

os.close(0)


stdin = open('/dev/random', 'r')

sys.stdin = stdin

if len(sys.argv) < 3:
    sys.exit('Usage: %s <host> <link>' % sys.argv[0])

host=sys.argv[1]
link=sys.argv[2]

if host == "10.228.170.129":
	BANDWIDTH_CMD = """sshpass -p qwerty ssh -o StrictHostKeyChecking=no -l guest %s ':global ip; :set ip "%s"; :put $ip; /system script run bandwidth' | /usr/bin/tail -1""" % (host, link)
	out = subprocess.check_output(BANDWIDTH_CMD, shell=True)
	print(out.decode("utf-8"))

elif host == "10.228.168.193":
	BANDWIDTH_CMD = """sshpass -p guestguest12 ssh -o StrictHostKeyChecking=no guest@10.228.168.193 "/usr/sbin/mikrotik_btest -d both %s" """ % (link)
	out = subprocess.check_output(BANDWIDTH_CMD, shell=True)

	arr = out.split()[-6:]
	tx=int(float(arr[1].decode("utf-8"))*1024*1024)
	rx=int(float(arr[-2].decode("utf-8"))*1024*1024)
	print("tx:%s rx:%s" % (tx, rx))

elif host == "10.228.168.169":
	BANDWIDTH_CMD = """sshpass -p guest ssh -o StrictHostKeyChecking=no guest@10.228.168.169 "/usr/sbin/mikrotik_btest -d both %s" """ % (link)
	out = subprocess.check_output(BANDWIDTH_CMD, shell=True)

	arr = out.split()[-6:]
	tx=int(float(arr[1].decode("utf-8"))*1024*1024)
	rx=int(float(arr[-2].decode("utf-8"))*1024*1024)
	print("tx:%s rx:%s" % (tx, rx))

else:
	proc = subprocess.Popen( [ "ssh", "-o", "StrictHostKeyChecking=no", "-l", "guest", host, ":global ip; :set ip %s; /system script run bandwidth" % link ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
	out, err = proc.communicate()
	out=out.split()[-2:]
	if (len(out) > 1):
		out = out[0].decode("utf-8") + " " + out[1].decode("utf-8")
	print(out)
