// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
const baseMenu = [
  {
    nom: "Carte des taxis",
    url: "map",
    icon: "map",
  },
  {
    nom: "Taxis",
    url: "taxis",
    icon: "local_taxi",
  },
  {
    nom: "Véhicules",
    url: "vehicles",
    icon: "directions_car",
  },
  {
    nom: "Chauffeurs",
    url: "drivers",
    icon: "contacts",
  },
];

export const menu = {
  admin: [
    ...baseMenu,
    {
      nom: "Utilisateurs",
      url: "account",
      icon: "group",
    },
  ],
  gestion: [
    ...baseMenu,
    {
      nom: "Utilisateurs",
      url: "account",
      icon: "group",
    },
  ],
  inspecteur: baseMenu,
};
