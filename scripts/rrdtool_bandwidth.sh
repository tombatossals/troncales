# Obtiene la media ancho de banda en 24h
[ $# -eq 1 ] || exit -3
F=$(ls /usr/share/webapps/cacti/rra/*_$1.rrd 2>/dev/null)
[ ! -z "$F" ] || exit -2
RX=$(rrdtool graph xxx -s $(date -d yesterday +%s) -e $(date +%s) DEF:val1=$F:rx:AVERAGE PRINT:val1:AVERAGE:%lf| tail -1)
TX=$(rrdtool graph xxx -s $(date -d yesterday +%s) -e $(date +%s) DEF:val1=$F:tx:AVERAGE PRINT:val1:AVERAGE:%lf| tail -1)
echo "scale=2; ($RX + $TX)/(2*1024*1024)" | bc
exit 0
