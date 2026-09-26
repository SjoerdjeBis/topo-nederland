[out:json][timeout:180];
area["ISO3166-1"="NL"][admin_level=2]->.nl;
way["waterway"~"river|canal"]["name"~"^(Bovenrijn|Rijn|Pannerdensch Kanaal|Pannerdens Kanaal|Boven-Merwede|Beneden-Merwede|Nieuwe Merwede|Noord|Nieuwe Maas|Het Scheur|Scheur|Nieuwe Waterweg|Oude Maas|Amer|Hollandsch Diep)$"](area.nl);
out tags geom;
