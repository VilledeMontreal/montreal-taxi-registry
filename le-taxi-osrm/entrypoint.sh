#!/bin/bash
# run the api backend for osrm

# Moving to /opt allows for the osrm commands to leverage the default profile properly
cd /opt

# Using default algorithm (MLD)
/usr/local/bin/osrm-routed --algorithm mld /opt/data/quebec-latest.osrm --max-table-size 8000 --max-matching-size 200 --verbosity WARNING