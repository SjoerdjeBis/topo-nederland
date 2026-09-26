[out:json][timeout:180];
area["ISO3166-1"="NL"][admin_level=2]->.nl;
(
  way["waterway"~"river|canal"]["name"~"^(Maas|Bergsche Maas|Waal|Nederrijn|Lek|IJssel|Noordzeekanaal|Amsterdam-Rijnkanaal|Nieuwe Waterweg)$"](area.nl);
  relation["waterway"]["name"~"^(Maas|Bergsche Maas|Waal|Nederrijn|Lek|IJssel|Noordzeekanaal|Amsterdam-Rijnkanaal|Nieuwe Waterweg)$"](area.nl);
  relation["name"~"^(IJsselmeer|Markermeer|Waddenzee|Oosterschelde|Westerschelde)$"](area.nl);
  way["natural"="water"]["name"~"^(IJsselmeer|Markermeer)$"](area.nl);
  relation["boundary"="national_park"]["name"~"Biesbosch"];
  node["place"~"city|town"]["name"~"^(Groningen|Leeuwarden|Assen|Zwolle|Lelystad|Arnhem|Utrecht|Haarlem|Den Haag|Middelburg|'s-Hertogenbosch|Maastricht)$"](area.nl);
);
out tags geom;
