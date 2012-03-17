#!/bin/sh

[ -d dumps ] || mkdir dumps
mongoexport --db trunks -h localhost -c supernodos -o dumps/supernodos.json
mongoexport --db trunks -h localhost -c enlaces -o dumps/enlaces.json
