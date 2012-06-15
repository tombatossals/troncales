# Obtiene la media ancho de banda en 24h
[ $# -eq 1 ] || exit -3
F=$(ls /usr/share/webapps/cacti/rra/*_$1.rrd 2>/dev/null)
[ ! -z "$F" ] || exit -2
RX=$(rrdtool graph xxx -s $(date -d yesterday +%s) -e $(date +%s) DEF:val1=$F:traffic_in:MAX PRINT:val1:MAX:%lf| tail -1)
TX=$(rrdtool graph xxx -s $(date -d yesterday +%s) -e $(date +%s) DEF:val1=$F:traffic_out:MAX PRINT:val1:MAX:%lf| tail -1)
VAL=$(echo $RX | cut -f1 -d".")
VAL2=$(echo $TX | cut -f1 -d".")

if [ "$VAL" = "-nan" ]; then
	VAL=0
fi

if [ "$VAL2" = "-nan" ]; then
	VAL2=0
fi

if [ $VAL -lt $VAL2 ]; then
	VAL=$VAL2
fi
echo "scale=2;($VAL*8)/(1024*1024)" | bc
exit 0
