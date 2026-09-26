[out:json][timeout:120];
(
way["waterway"="river"]["name"~"^(Boven-Rijn|Bijlandsch Kanaal|Rhein)$"](51.70,5.95,52.00,6.70);
way["waterway"="river"]["name"="Maas"](51.60,5.60,51.80,6.00);
);
out tags geom;
