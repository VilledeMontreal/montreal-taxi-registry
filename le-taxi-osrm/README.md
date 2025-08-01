# Le-taxi-OSRM

This repository contain osrm-backend docker image for easy deploy to city of Montreal infrastructure.

The docker image connects directly to the OpenStreetMap Data Extract server hosted in Germany to download the map.

To update the map version, change the value of PBF_VERSION in the [Dockerfile](./Dockerfile) to point to the desired map version available on [Geofabrik](http://download.geofabrik.de/north-america/canada/).

```
ARG PBF_VERSION=250805
```

## Validate server is up

```curl
curl --location --request GET 'https://api.dev.interne.montreal.ca/api/taxi/taxi-registry-osrm/route/v1/car/-73.55461,45.49714;-73.55433,45.50903?overview=false'
```

##  Credit

[osrm-api](https://bitbucket.org/villemontreal/osrm-api/src/develop/)

## Data Source

[geofabrik](http://download.geofabrik.de/north-america/canada.html)

## OSRM documentation

[Documentations](http://project-osrm.org/docs/v5.5.1/api/#general-options)

[Wiki](https://github.com/Project-OSRM/osrm-backend/wiki)


