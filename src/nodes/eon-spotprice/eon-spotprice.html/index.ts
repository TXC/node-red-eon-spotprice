import type { EditorRED } from 'node-red';
import type { EonSpotpriceEditorNodeProperties } from './modules/types';

declare const RED: EditorRED;

RED.nodes.registerType<EonSpotpriceEditorNodeProperties>('eon-spotprice', {
  category: 'request',
  color: '#a6bbcf',
  defaults: {
    name: {value:""},
    area: {value: "SE1"},
    action: {value: "todayOrOverride"}
  },
  inputs: 1,
  outputs: 1,
  icon: "white-globe.png",
  paletteLabel: 'E.ON Spotprice',
  label: function () {
    //return this.name ||"eon-spotprice";
    if (this.name) {
      return this.name;
    }

    let label = this.area;

    switch (this.action) {
      case 'todayOrOverride': {
        label += ' today or override';
        break;
      }
      case 'dayAhead': {
        label += ' day ahead';
        break;
      }
      case 'rolling': {
        label += ' rolling';
        break;
      }
    }

    return label;
  },
});
