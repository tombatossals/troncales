#!/bin/sh

[ -d dumps ] || mkdir dumps
mongoexport --db troncales -h localhost -c supernodos -o dumps/supernodos.$(date +"%Y-%m-%d").json
mongoexport --db troncales -h localhost -c enlaces -o dumps/enlaces.$(date +"%Y-%m-%d").json
