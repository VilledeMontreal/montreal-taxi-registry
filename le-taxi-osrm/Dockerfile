# Stage 1: Data Extraction and Preprocessing
ARG OSRM_IMAGE=osrm/osrm-backend:v5.25.0

FROM ${OSRM_IMAGE} AS preprocessing

ARG PBF_VERSION=250805
ARG PBF_FILE=quebec-latest.osm.pbf
ARG OSRM_FILE=quebec-latest.osrm

# Release is too old and has been archived
RUN echo 'deb http://archive.debian.org/debian stretch main' > /etc/apt/sources.list && \
    apt-get update && \
    apt install -y wget

WORKDIR /opt/data/
RUN wget http://download.geofabrik.de/north-america/canada/quebec-${PBF_VERSION}.osm.pbf -O ${PBF_FILE}

RUN echo "Running osrm-extract.." && \
    osrm-extract ${PBF_FILE} --profile /opt/car.lua
RUN echo "Running osrm-partition.." && \
    osrm-partition ${OSRM_FILE}
RUN echo "Running osrm-customize.." && \
    osrm-customize ${OSRM_FILE}
RUN rm /opt/data/${PBF_FILE}

# Stage 2: Final Runtime Image
FROM ${OSRM_IMAGE} AS final

WORKDIR /opt/data/
COPY --from=preprocessing /opt/data/* .

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT [ "/entrypoint.sh" ]

EXPOSE 5000
