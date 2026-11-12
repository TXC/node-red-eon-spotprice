import type { Node, NodeDef } from 'node-red';
import type { EonSpotpriceOptions } from '../shared/types';

export interface EonSpotpriceNodeDef extends NodeDef, EonSpotpriceOptions {}
export type EonSpotpriceNode = Node;
