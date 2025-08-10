import { agendamento3x3 } from './templates/agendamento3x3.js';
import type { Config, Page, PageSide } from './types.js';

export function generatePages(config: Config): Page[] {
  const { innerTemplateConfig } = config.data;
  const pages: Page[] = [];
  if (config.data.showCalendarPages) {
    pages.push(
      { side: 'left', contents: { kind: 'calendar', year: config.data.year } },
      { side: 'right', contents: { kind: 'calendar', year: 1 + config.data.year } }
    );
  }
  if (innerTemplateConfig?.kind === 'agendamento3x3') {
    pages.push(...agendamento3x3(config.data.year, innerTemplateConfig));
  } else if (innerTemplateConfig) {
    throw new Error('unkown kind: ' + innerTemplateConfig.kind);
  }
  // Enforce alternation: start with 'right', alternate, insert empty pages as needed
  const alternatedPages: Page[] = [];
  let expectedSide: PageSide = 'right';
  for (const page of pages) {
    if (page.side !== expectedSide) {
      alternatedPages.push({ side: expectedSide });
      alternatedPages.push(page);
    } else {
      alternatedPages.push(page);
      expectedSide = expectedSide === 'right' ? 'left' : 'right';
    }
  }
  return alternatedPages;
}
