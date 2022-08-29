// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.

import { StatusCodes } from 'http-status-codes';

export class CSVGenerator {
  constructor(private res: any) {}

  DownloadCSV(dataRows: Array<any>, nom: string = 'fichier') {
    let responseContent: string = '';

    // titres
    for (var key in dataRows[0]) {
      if (key.indexOf('_id') < 0) {
        responseContent += key.toUpperCase() + ';';
      }
    }

    responseContent += '\r\n';
    //body
    dataRows.forEach(function(row) {
      for (var key in row) {
        if (key.indexOf('_id') < 0) {
          responseContent += row[key] + ';';
        }
      }
      responseContent += '\r\n';
    });

    this.res.writeHead(StatusCodes.OK, { 'Content-Disposition': 'attachment;filename=' + nom + '.csv' });
    this.res.write(responseContent);
    this.res.end();
  }
}