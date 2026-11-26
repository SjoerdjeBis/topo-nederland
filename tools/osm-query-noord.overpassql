[out:json][timeout:120];
area["ISO3166-1"="NL"][admin_level=2]->.nl;
node["place"~"city|town"]["name"~"^(Groningen|Leeuwarden|Assen|Delfzijl|Veendam|Emmen|Hoogeveen|Meppel|Drachten|Heerenveen|Sneek)$"](area.nl);
out body;
