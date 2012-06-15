#!/bin/sh

[ -d dumps ] || mkdir dumps
mongoexport --db troncales -h localhost -c supernodos -o dumps/supernodos.json
mongoexport --db troncales -h localhost -c enlaces -o dumps/enlaces.json
