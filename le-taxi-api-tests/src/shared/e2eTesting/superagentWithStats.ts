// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
const agent = require('superagent-use')(require('superagent'));

agent.use(computeStats);

function computeStats(request: any) {
  computeTotalHttpRequestCount();
  computeMaxConcurrentHttpRequest(request);
}

let totalHttpRequestCount: number = 0;
function computeTotalHttpRequestCount() {
  totalHttpRequestCount++;
}

let maxConcurrentHttpRequest: number = 0;
let currentConcurrentHttpRequest: number = 0;
function computeMaxConcurrentHttpRequest(request: any) {
  currentConcurrentHttpRequest++;
  if (currentConcurrentHttpRequest > maxConcurrentHttpRequest) {
    maxConcurrentHttpRequest = currentConcurrentHttpRequest;
  }
  request.on('end', () => {
    currentConcurrentHttpRequest--;
  });
}

export function getSuperagentStats() {
  return `Total HTTP requests: ${totalHttpRequestCount}\nMax concurrent HTTP requests: ${maxConcurrentHttpRequest}`;
}

export function displaySuperagentStats() {
  // tslint:disable-next-line: no-console
  console.log(getSuperagentStats());
}

export const superagentWithStats = agent;
