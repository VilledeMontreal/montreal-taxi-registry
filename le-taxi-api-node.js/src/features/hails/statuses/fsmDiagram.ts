// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
import * as fs from 'fs';
import { createFsmDiagram } from './hailStatus.fsm';

const bpmn = createFsmDiagram();
fs.writeFileSync('src/features/hails/statuses/fsmDiagram.dot', bpmn);

// .dot files can be read by any graphviz reader ex: https://dreampuf.github.io/GraphvizOnline
