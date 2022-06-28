// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
// Nom du fichier des cas type généré
export const generatedFileName = './data/hail-fake-data-all.json';

// Fichier contenant les données virtuelles
export const toReturnFileName = './data/hail-fake-data-all.json';

// Suite d'étapes réliées aux statuts d'héler
export const statusSuite = {
  common: [
    {
      status: 'emitted',
      delayMin: 2,
      delayMax: 10
    },
    {
      status: 'received',
      delayMin: 2,
      delayMax: 10
    },
    {
      status: 'sent_to_operator',
      delayMin: 2,
      delayMax: 7
    }
  ],
  declined_by_customer: [
    {
      status: 'received_by_operator',
      delayMin: 2,
      delayMax: 10
    },
    {
      status: 'received_by_taxi',
      delayMin: 2,
      delayMax: 10
    },
    {
      status: 'accepted_by_taxi',
      delayMin: 2,
      delayMax: 10
    },
    {
      status: 'declined_by_customer',
      delayMin: 2,
      delayMax: 10
    }
  ],
  declined_by_taxi: [
    {
      status: 'received_by_operator',
      delayMin: 2,
      delayMax: 10
    },
    {
      status: 'received_by_taxi',
      delayMin: 2,
      delayMax: 10
    },
    {
      status: 'declined_by_taxi',
      delayMin: 2,
      delayMax: 10
    }
  ],
  timeout_customer: [
    {
      status: 'received_by_operator',
      delayMin: 2,
      delayMax: 10
    },
    {
      status: 'received_by_taxi',
      delayMin: 2,
      delayMax: 10
    },
    {
      status: 'accepted_by_taxi',
      delayMin: 2,
      delayMax: 10
    },
    {
      status: 'timeout_customer',
      delayMin: 25,
      delayMax: 35
    }
  ],
  timeout_taxi: [
    {
      status: 'received_by_operator',
      delayMin: 2,
      delayMax: 10
    },
    {
      status: 'received_by_taxi',
      delayMin: 2,
      delayMax: 10
    },
    {
      status: 'timeout_taxi',
      delayMin: 35,
      delayMax: 45
    }
  ],
  incident_customer: [
    {
      status: 'received_by_operator',
      delayMin: 2,
      delayMax: 10
    },
    {
      status: 'received_by_taxi',
      delayMin: 2,
      delayMax: 10
    },
    {
      status: 'accepted_by_taxi',
      delayMin: 2,
      delayMax: 10
    },
    {
      status: 'accepted_by_customer',
      delayMin: 2,
      delayMax: 10
    },
    {
      status: 'incident_customer',
      delayMin: 300,
      delayMax: 540
    }
  ],
  incident_taxi: [
    {
      status: 'received_by_operator',
      delayMin: 2,
      delayMax: 10
    },
    {
      status: 'received_by_taxi',
      delayMin: 2,
      delayMax: 10
    },
    {
      status: 'accepted_by_taxi',
      delayMin: 2,
      delayMax: 10
    },
    {
      status: 'accepted_by_customer',
      delayMin: 2,
      delayMax: 10
    },
    {
      status: 'incident_taxi',
      delayMin: 360,
      delayMax: 660
    }
  ],
  failure: [
    {
      status: 'failure',
      delayMin: 11,
      delayMax: 20
    }
  ],
  finished: [
    {
      status: 'received_by_operator',
      delayMin: 2,
      delayMax: 10
    },
    {
      status: 'received_by_taxi',
      delayMin: 2,
      delayMax: 10
    },
    {
      status: 'accepted_by_taxi',
      delayMin: 2,
      delayMax: 10
    },
    {
      status: 'accepted_by_customer',
      delayMin: 2,
      delayMax: 10
    },
    {
      status: 'customer_on_board',
      delayMin: 2,
      delayMax: 10
    },
    {
      status: 'finished',
      delayMin: 1000,
      delayMax: 2000
    }
  ]
};

// Nom des opérateurs
export const operatorName = {
  operator01: "TAXI COOP DE l'OUEST",
  operator02: 'TAXI CHAMPLAIN'
};

// Liste d'Id de taxi selon Opérateur.
export const taxisId = {
  operator01: [
    '42iM75D',
    'tQGnMZZ',
    'YrVfqiT',
    'XmXCo4U',
    '2YZnZYE',
    'sYeZTGf',
    'KUbvGSH',
    '2SrggaA',
    'm8xYvkg',
    'Cv4k7X2',
    'v4B97rk',
    'kqLGryW',
    'SQ6uy3L',
    'zJhf5v3',
    'TpDZUkx',
    '9yGcULP'
  ],
  operator02: [
    'TCTGKUC',
    'amKzxri',
    'xPR8XaP',
    'vdzHqDM',
    'YK5EbV7',
    '5xdZj8M',
    'eJmt939',
    'sgiGZKX',
    '88tpoyH',
    'nRxZGPc',
    '6egRvB4',
    'mYU5HPz',
    'qSDLYyb',
    'ScqiTri',
    'hVw9GsD',
    'fJoANpc'
  ]
};

// Raison d'incident Taxi
export const taxiIncidentReason = ['no_show', 'address', 'traffic', 'breakdown'];

// Noms à donner aux champs lors de l'étape de combinaisons
export const combinationFieldsName = ['date', 'search_engine_id', 'operator', 'taxi_id', 'rating_ride', 'statut'];

// liste de valeurs à combiner
export const combinationList = [
  [
    '2019-07-01',
    '2019-07-02',
    '2019-07-03',
    '2019-07-04',
    '2019-07-05',
    '2019-07-06',
    '2019-07-07',
    '2019-07-08',
    '2019-07-09',
    '2019-07-10',
    '2019-07-11',
    '2019-07-12',
    '2019-07-13',
    '2019-07-14',
    '2019-07-15',
    '2019-07-16',
    '2019-07-17',
    '2019-07-18',
    '2019-07-19',
    '2019-07-20',
    '2019-07-21',
    '2019-07-22',
    '2019-07-23',
    '2019-07-24',
    '2019-07-25',
    '2019-07-26',
    '2019-07-27',
    '2019-07-28',
    '2019-07-29',
    '2019-07-30',
    '2019-07-31',
    '2019-08-01',
    '2019-08-02',
    '2019-08-03',
    '2019-08-04',
    '2019-08-05',
    '2019-08-06',
    '2019-08-07',
    '2019-08-08',
    '2019-08-09',
    '2019-08-10',
    '2019-08-11',
    '2019-08-12',
    '2019-08-13',
    '2019-08-14',
    '2019-08-15',
    '2019-08-16',
    '2019-08-17',
    '2019-08-18',
    '2019-08-19',
    '2019-08-20',
    '2019-08-21',
    '2019-08-22',
    '2019-08-23',
    '2019-08-24',
    '2019-08-25',
    '2019-08-26',
    '2019-08-27',
    '2019-08-28',
    '2019-08-29',
    '2019-08-30',
    '2019-08-31'
  ],
  [10, 18],
  ['operator01', 'operator02'],
  ['A', 'B', 'C', 'D', 'F'],
  ['1', '2', '3', '4', '5'],
  [
    'declined_by_taxi',
    'timeout_taxi',
    'incident_taxi',
    'declined_by_customer',
    'timeout_customer',
    'incident_customer',
    'failure',
    'finished'
  ]
];
