import type { Config } from '$lib/types.js';
import { mm_to_points } from '$lib/units.js';
import { ptBR } from 'date-fns/locale';
import { PageSizes } from 'pdf-lib';

export const config: Config = $state({
  page: {
    size: PageSizes.A5,
    margins: {
      leftPage: {
        top: mm_to_points(10),
        right: mm_to_points(10),
        bottom: mm_to_points(10),
        left: mm_to_points(10),
      },
      rightPage: {
        top: mm_to_points(10),
        right: mm_to_points(10),
        bottom: mm_to_points(10),
        left: mm_to_points(10),
      },
    },
  },
  colors: {
    table: {
      border: '#CC0000',
      header: {
        background: '#FFCCCC',
        text: '#440000',
      },
      subheader: {
        background: '#FFFFCC',
        text: '#444400',
      },
    },
  },
  data: {
    year: new Date().getUTCFullYear(),
    showCalendarPages: true,
    locale: ptBR,
  },
});
