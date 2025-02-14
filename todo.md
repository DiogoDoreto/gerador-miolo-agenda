# Layout and Rendering

- [ ] **Implement `renderContents` function for Canvas**
  - Render different types of content (string, flex, textbox, table, calendar) in the canvas.
  
- [ ] **Implement `renderTextbox` for Canvas**
  - Handle text alignment and fitText property similar to PDF rendering.

- [ ] **Implement `renderTable` for Canvas**
  - Draw tables with columns and rows, including cell styles (header, sub-header).

- [ ] **Implement `renderCalendar` for Canvas**
  - Render calendar views for both month and year views.

## Flexbox Rendering

- [ ] **Implement `renderFlex` for Canvas**
  - Handle flex direction (row/column), gap, and content alignment similar to PDF rendering.

- [ ] **Calculate Box Width and Height for Canvas**
  - Implement `calculateBoxWidth` and `calculateBoxHeight` functions for canvas rendering.

## Page Management

- [ ] **Implement `renderPages` function for Canvas**
  - Render multiple pages on the canvas, handling page sides (left/right).

- [ ] **Add Page Margins in Canvas Rendering**
  - Apply margins to each page similar to PDF rendering.

## Utility Functions

- [ ] **Convert Hex to RGB for Canvas**
  - Implement `hex_to_rgb` function if not already available for use in canvas rendering.

- [ ] **Implement Date Formatting and Utilities for Canvas**
  - Ensure date formatting utilities like `format`, `getWeekOfMonth`, `daysOfMonth`, and `wholeWeek` are used correctly in canvas rendering.

## Styling and Appearance

- [ ] **Add Shadows to Pages in Canvas Rendering**
  - Implement shadows around each page similar to PDF rendering.

- [ ] **Handle Text Alignment in Canvas**
  - Ensure text alignment (NW, N, NE, W, Center, E, SW, S, SE) is correctly handled in canvas rendering.

## Testing and Validation

- [ ] **Create Unit Tests for Canvas Rendering Functions**
  - Write tests to ensure each function works as expected.

- [ ] **Visual Regression Testing**
  - Compare the output of PDF and Canvas renderings visually to ensure consistency.
