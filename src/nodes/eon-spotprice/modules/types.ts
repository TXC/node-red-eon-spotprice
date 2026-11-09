import { Node, NodeDef } from 'node-red';
import { EonSpotpriceOptions } from '../shared/types';

export interface EonSpotpriceNodeDef extends NodeDef, EonSpotpriceOptions {}
export type EonSpotpriceNode = Node;