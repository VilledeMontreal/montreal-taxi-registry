// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export function formatRowToTaxi(row:any) {
  const lastUpdate = Math.round(new Date(row.last_update).getTime() / 1000);
    const characteristics = [];
    for (let prop in row) {
      if (prop.includes('vc') && row[prop]) {
        let char = prop.split('.')
            characteristics.push(char[1])
        }
    }
  const formatedRow = {
    "ads": {
        "insee": row.insee,
        "numero": row.numero
    },
    "crowfly_distance": null,
    "driver": {
        "departement": row.departement,
        "professional_licence": row.professional_licence
    },
    "id": row.id,
    "last_update": lastUpdate,
    "operator": row.operator,
    "position": {
        "lat": null,
        "lon": null
    },
    "private": row.private,
    "rating": row.rating,
    "status": row.status,
    "vehicle": {
        "characteristics": [...characteristics],
        "color": row.color,
        "constructor": row.constructor,
        "licence_plate": row.licence_plate,
        "model": row.model,
        "nb_seats": row.nb_seats
    }
  }
  return formatedRow;
}
