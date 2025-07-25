# Le-taxi-OSRM

This repository contain osrm-backend docker image for easy deploy to city of Montreal infrastructure.

This repository requires the [Git LFS](https://git-lfs.com/) extension for managing large files. You may need to download the git-lfs binary if this is your first time using Git LFS.

If you need to build the docker image locally or update the map, you will have to enable Git LFS on this repository using the command:

```
git lfs install
```

## Download the latest data for Quebec

```
wget http://download.geofabrik.de/north-america/canada/quebec-latest.osm.pbf
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


