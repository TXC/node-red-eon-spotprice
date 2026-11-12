import type { EditorNodeProperties } from 'node-red';
import type { EonSpotpriceOptions } from '../../shared/types';

export interface EonSpotpriceEditorNodeProperties
  extends EditorNodeProperties, EonSpotpriceOptions {}
