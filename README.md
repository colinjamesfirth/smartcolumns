# Responsive Table

Created by: Colin James Firth
Version: 1.0
Date: 30 November 2021
Repo: https://github.com/colinjamesfirth/responsive-table


## Summary
Displays only the columns that will fit in the available space by putting hidden columns into a new, 'selectable' column

- Avoids the need for horizontal scrollbars (which are inherently inaccessible)
- Allows for an infinite number of columns
- Is fully responsive (works on big screens, on mobile and when zoomed)
– Supports several standard column widths for different data types (e.g. small for integers, wide for narratives)

## Behaviours
– When the window is loaded or resized, columns hide and show depending on the space available to show columns at their minimum/preferred width. Columns that don't fit are hidden from right to left (making an assumption that the left-most column is the most important; the right least).
- The first column is always show (making the assumption that the left-most column is the most important, and essentially acts as a row header)
– If the user hasn't yet manually selected data for the selectable column, if none of the hideable columns can be shown (so only the first, selectable and actions columns), we automatically make the selectable column have the data from the first hidden column. This avoids showing an empty column on smaller windows. If the window resizes and more columns can show, the selectable column reverts to blank.
– If the user has manually selected data for the selectable column, then the column retains that selection even if the window resizes, or all hideable columns are hidden.

## Quirks for devs to be aware of
- Column widths are set in the CSS, but the column hiding function needs to know those preferred widths to do its calculations
– The table needs to have a block-level parent wrapper that is used as a reference for how big the table should be. This is used in the column hiding calculation. NB Any other element with the same width could feasibly be used instead
- The actions column has an inline width set using javascript based on the width of its content. This is because every row in the table has the same content in that column, but each table might have a different set of actions, so we don't know the width until run time. We can't just tell it to be auto width because the browser will just make that column as wide as it can and shrink all the data columns.
- If a column is set to wrap, only apply the wrap to the appropriate tbody cell (not on the header; we don't want headers to break)
– If a column is to to align centre, apply the centring to the appropriate head and the body (both need to be centre)
– The selectable column is always the standard column width, regardless of the preferred column width for the selected data. For example, if a narrative- or integer-type data is selected, we wouldn't change the width. This is to avoid re-drawing of the table, which would be jarring and users might lose their place of focus in the table.
– If a selectable column is set to show column data that should wrap, make the selectable column body cells wrap.
– If a selectable column is set to show column data that should be centre aligned, do not align centre – keep it align left so data is in the same physical position as the user changes the selection.
– If the whole data row is selectable, users can click/tap on the whole row to open it. The onclick handler applies to all cells in the row except the actions column, which should show the row's hover effect but not itself be clickable. This is to avoid overlap and accidental clicks in around the action buttons themselves.