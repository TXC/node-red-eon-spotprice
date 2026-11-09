import { EditorNodeProperties } from 'node-red';
import { EonSpotpriceOptions } from '../../shared/types';

export interface EonSpotpriceEditorNodeProperties
  extends EditorNodeProperties, EonSpotpriceOptions {}
