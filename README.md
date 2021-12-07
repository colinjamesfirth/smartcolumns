# SmartColumns

- Created by: Colin James Firth
- Version: 1.3
- Date: 7 December 2021
- Repo: https://github.com/colinjamesfirth/responsive-table


## Summary
Displays only the columns that will fit in the available space by putting hidden columns into a new, 'selectable' column.

- Avoids the need for horizontal scrollbars (which are inherently inaccessible)
- Allows for an infinite number of columns
- Is fully responsive (works on big screens, on mobile and when zoomed)
- Supports several standard column widths for different data types (e.g. small for integers, wide for narratives)
- Is naturally accessible because the output is a particularly basic html table; additional accessibility provided on the select and button elements


## Initialising SmartColumns

- This early edition of SmartColumns requires JQuery (min 3.3.1).
- Include smartColumn.js and JQuery on the page containing the table(s) you want to apply SmartColumns

For each table, initialise SmartColumns:

<pre>
  smartColumns('#{tableID}');
</pre>

You can change default variables for various options during initialisation:

<pre>
  smartColumns('table#data1', {
    freezeFirstColumn: true,
    hasActionsColumn: true,
    maxVisibleColumns: 100,
    columnWidthNarrow_rem: 5,
    columnWidthNormal_rem: 10,
    columnWidthWide_rem: 15,
    cellXPadding_rem: 0.75,
    baseFontSize_px: {auto based on the document's base font size}
  });
</pre>

### freezeFirstColumn
- Default: true

The first data column is always visible. When the screen narrows, the first column from the left that can be hidden or converted to the selectable column is the second data column.

### maxVisibleColumns
- Default: 100

Set the maximum number of data columns that can be shown, regardless of how wide the browser window or container. Does not count the first column if `maxVisibleColumns` is set to `true`.

### columnWidthNarrow_rem
- Default: 5
- Unit: rem

Sets the base reference width of a narrow column, excluding padding. To make a column a narrow column, add the attribute `data-smartcol-width="narrow"` to the column header.

### columnWidthNormal_rem
- Default: 10
- Unit: rem

Sets the base reference width of a normal column, excluding padding. To make a column a narrow column, add the attribute `data-smartcol-width="normal"` to the column header.

### columnWidthWide_rem
- Default: 15
- Unit: rem

Sets the base reference width of a wide column, excluding padding. To make a column a narrow column, add the attribute `data-smartcol-width="wide"` to the column header.

If a column is set to stretch with `data-smartcol-width="stretch"`, the same reference width as a wide column will be used when calculating available space.

### cellXPadding_rem
- Default 0.75
- Units: rem

Sets the x-axis (left and right) padding for the actions column. This is used to help calculate the fixed width of the actions column and should match the left and right padding used in the css.

### baseFontSize_px
- Default: the document's base font size

If you need to change the base font size used for various SmartColumns calculations, use this option. But use it cautiously.


## Table properties

Tables must have a `thead` and `tbody`. The thead must use `th` cell-level elements.

Various additional properties can be added to the target table. Some are mandatory, others optional.

### data-smartcol
- Type: mandatory
- Element: `table > thead > th`

Add this attribute to the `th` element to the table header for all data columns. All `data-smartcol` columns will be included in the selectable column's menu.

### data-smartcol-fixed
- Type: optional
- Element: The `table > thead > th` for any fixed-width columns

Any columns which are not `data-smartcol` columns can have their width fixed based on the width of the content in the column's first tbody row. For example, if you have an actions column on the far right of your table, or a column of checkboxes for selecting multiple rows, use `data-smartcol-fixed` on the header cell to stop the column width changing with different browser widths. Note that any fixed columns will always show, so limit their use to avoid overcrowding on narrow windows.

### data-smartcol-width="{string}"
- Type: optional
- Element: `table > thead > th`
- Values: narrow|normal|wide|stretch
- Default: normal

Choose a base reference width keyword for each data column. Available space is normally distributed proportionally to the various width columns. If one or more columns are set to `stretch`, other columns take their base widths and available space is distributed evenly amongst the `stretch` columns. Actual widths are set during SmartColumns initialisation.

### data-smartcol-align="{string}"
- Type: optional
- Element: `table > thead > th`
- Values: left|center|right
- Default left

Set the alignment of a column. Without the attribute, the column will align left.

### data-smartcol-wrap
- Type: optional
- Element: `table > thead > th`

Makes the column's data rows wrap long content. Long words (such as email addresses may line break to fit).


## Behaviours
- When the window is loaded or resized, columns hide and show depending on the space available to show columns at their minimum/preferred width. Columns that don't fit are hidden from right to left (making an assumption that the left-most column is the most important; the right least)
- If the user hasn't yet manually selected data for the selectable column, the selectable column automatically takes the data from the first hidden column. The column's content therefore changes as columns hide/show when the window resizes
- If the user has manually selected data for the selectable column, then the column retains that selection even if the window resizes.
- Column widths are set in the CSS, but SmartColumns's column hiding function needs to know those preferred widths to do its calculations
- The actions column has an inline width using a percentage value, set in SmartColumns using javascript based on the width of its content. This is because every row in the table has the same content in that column, but each table might have a different set of actions, so we don't know the width until run time. We can't just tell it to be auto width because the browser will  make that column as wide as it can and shrink all the data columns.
- If a column is set to wrap, SmartColumns only applies the wrap to the appropriate tbody cell (not on the header; we don't normally want headers to wrap)
- If a column is to to align centre, SmartColumns applies the centring style to the appropriate head th AND body td's (both need to be centre).
- The selectable column's width changes depending on the width setting of the source column. To ensure the column hiding doesn't change abruptly when different width data is selected, SmartColumns reserves enough width for the select column to accommodate the widest possible column in this table So, if all columns are set to `narrow`, the select column will reserve space for 'narrow' columns; but if there's one `wide` column, a wide space will be reserved.