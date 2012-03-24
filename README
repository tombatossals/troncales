Troncales de guifi.net en La Plana Alta
=======================================

Este proyecto pretende representar en un mapa los supernodos y los enlaces que conforman la troncal de La Plana Alta en Castello, visualizando de una forma clara cual es el estado de cada uno de esos enlaces representando graficas con el ancho de banda de cada uno de ellos y la saturacion que soportan.

Cómo añadir tu supernodo a las gráficas
==========================================
Los requisitos para poder añadir tu supernodo al mapa y que se visualicen las gráficas son las siguientes:
* Supernodo con routerboard (Mikrotik).
* Routerboard 5.11 o en adelante.
* Activado el SNMP en el supernodo.
* Activado el bandwidth-server sin autenticacion.
* Activado un script de monitorizacion remota. Puedes añadirlo con el siguiente código:

<pre>
/system script
add name=bandwidth policy=ftp,reboot,read,write,policy,test,winbox,password,sniff,sensitive,api source=":global tx\
    \n:global rx\
    \n:global ip\
    \n/tool bandwidth-test \$ip \\\
    \n    direction=both duration=8s protocol=tcp do={ \
    \n    :set tx \$\"tx-total-average\" \
    \n    :set rx \$\"rx-total-average\"\
    \n}\
    \n:put (\"tx:\". \$tx . \" rx:\" . \$rx )\
    \n"

</pre>

