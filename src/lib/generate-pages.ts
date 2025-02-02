import { agendamento3x3 } from './templates/agendamento3x3.js';
import type { Config, Page } from './types.js';

export function generatePages(config: Config): Page[] {
  const { innerTemplateConfig } = config.data;
  const pages: Page[] = [];
  if (config.data.showCalendarPages) {
    pages.push(
      { side: 'left', contents: { kind: 'calendar', year: config.data.year } },
      { side: 'right', contents: { kind: 'calendar', year: 1 + config.data.year } }
    );
  }
  if (!innerTemplateConfig) return pages;
  if (innerTemplateConfig.kind === 'agendamento3x3') {
    pages.push(...agendamento3x3(config.data.year, innerTemplateConfig));
  } else {
    throw new Error('unkown kind: ' + innerTemplateConfig.kind);
  }
  return pages;
}
