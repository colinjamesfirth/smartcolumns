/*
SmartColumns
by Colin James Firth
https://github.com/colinjamesfirth/smartcolumns
verson 1.2
*/

function smartColumns(target,options) {
  let optionDefaults = {
    freezeFirstColumn: true,
    hasActionsColumn: true,
    maxVisibleColumns: 100,
    columnWidthNarrow_rem: 5, //rem
    columnWidthNormal_rem: 10, //rem
    columnWidthWide_rem: 15, //rem
    cellXPadding_rem: 0.75, //rem
    baseFontSize_px: parseFloat(getComputedStyle(document.documentElement).fontSize),
    widthTable: 0,
    widthContainer: 0,
    widthAvailable: 0
  }
  o = { ...optionDefaults, ...(options || {}) };


  /* Wrap the target table in a block level div so we can measure the width of the containing space (also used for CSS selectors) */
  $(target).wrap('<div class="smartcol-container"></div>');

  let lastDataColumnIndex = $(target).find('thead th[data-smartcol]').last().index();
  let lastDataColumnNth = lastDataColumnIndex + 1;

  /* Build the selectable column */
  (function() {
    //create the select menu:
    let selectMenu = '<select aria-label="Choose the data for this column">\n';
    let counter = 0;
    $(target).find('thead th[data-smartcol]').each(function() {
      $(this).attr('data-smartcol',counter);
      let t = $(this).text();
      selectMenu += '<option value="' + counter + '">' + t + '</option>\n';
      counter++;
    });
    selectMenu += '</select>\n';

    //add the new th in the thead for the selctable column:
    $(target).find('thead tr th:nth-child(' + lastDataColumnNth + ')').after('<th data-smartcol-selectable data-smartcol-auto>' + selectMenu + '</th>\n');

    //add a new td in every tbody row for the selctable column:
    $(target).find('tbody tr td:nth-child(' + lastDataColumnNth + ')').each( function() {
      $(this).after('<td></td>\n');
    });

    /* Add a change event to the select menu to check for user input */
    $(target).on('change','th[data-smartcol-selectable] select',function() {
      //remove the data-smartcol-auto attribute, because we want this column to be fixed now:
      $(this).closest('th[data-smartcol-selectable]').removeAttr('data-smartcol-auto');

      //set the column data based on the selection:
      let data_column = $(this).val();
      selectableColumn_set(target,data_column);
    });

  })();


  var widthActionsContent = 0;
  if (o.hasActionsColumn === true) {
    //get the index of the actions column:
    let actionsIndex = $(target).find('th[data-smartcol-actions]').index();

    //add a span around the actions in tbody, so we can add styling and measure their width (note we can't just measure the cell width, because the browser chooses how wide it is based on the rest of the table's content):
    $(target).find('tbody tr').each(function() {
      $(this).find('td').eq(actionsIndex).wrapInner('<span data-smartcol-actions-wrap></span>');
    });

    //measure the width, calculate the fixed width and apply it:
    widthActionsContent = $(target).find('tbody tr:first-child span[data-smartcol-actions-wrap]').width();
    widthActionsContent = widthActionsContent + ((o.cellXPadding_rem * o.baseFontSize_px) * 2);

    function updateActionsColumnWidth() {
      let widthContainer = $(target).closest('.smartcol-container').outerWidth();

      //dynamically change the width of the actions column as the window changes width.
      let widthActionsColumn = ((100 / widthContainer) * widthActionsContent) + '%';
      $(target).find('th[data-smartcol-actions]').css('width',widthActionsColumn);
    }
    updateActionsColumnWidth();
    $(window).resize( function() {
      updateActionsColumnWidth();
    });

  }


  /* Hides columns from right to left depending on the amout of available space, making sure the minimum width of columns is always honoured. Run at page load and on window resize */
  function hideDataColumns(target,o,lastDataColumnNth,widthActionsContent) {
    let widthTable = $(target).outerWidth();
    let widthContainer = $(target).closest('.smartcol-container').width();
    let firstHideableColumnNth = 1;
    let counter_visible = 1;
    let widthFirstColumn = 0;

    if (o.freezeFirstColumn === true) {
      firstHideableColumnNth = 2;
      let firstColumnSizeKeyword = $(target).find('thead th[data-column]').first().attr('data-smartcol-width');
      if (firstColumnSizeKeyword == 'stretch') {
        widthFirstColumn = (o.columnWidthWide_rem * o.baseFontSize_px) + 1;
      }
      else if (firstColumnSizeKeyword == 'narrow') {
        widthFirstColumn = (o.columnWidthNarrow_rem * o.baseFontSize_px) + 1;
      }
      else if (firstColumnSizeKeyword == 'normal') {
        widthFirstColumn = (o.columnWidthNormal_rem * o.baseFontSize_px) + 1;
      }
      else if (firstColumnSizeKeyword == 'wide') {
        widthFirstColumn = (o.columnWidthWide_rem * o.baseFontSize_px) + 1;
      }
    }

    let widestColumn = null;
    if ( $(target).find('thead th[data-smartcol-width="stretch"]').length ) {
      widestColumn = (o.columnWidthWide_rem * o.baseFontSize_px) + 1;
    }
    else if ( $(target).find('thead th[data-smartcol-width="wide"]').length ) {
      widestColumn = (o.columnWidthWide_rem * o.baseFontSize_px) + 1;
    }
    else if ( $(target).find('thead th[data-smartcol-width="normal"]').length ) {
      widestColumn = (o.columnWidthNormal_rem * o.baseFontSize_px) + 1;
    }
    else if ( $(target).find('thead th[data-smartcol-width="narrow"]').length ) {
      widestColumn = (o.columnWidthNarrow_rem * o.baseFontSize_px) + 1;
    }
    let widthReservedForSelectColumn = widestColumn;

    let widthFixedColumns = widthFirstColumn + widthReservedForSelectColumn + widthActionsContent;
    let widthAvailable = widthContainer - widthFixedColumns;

    o.widthTable = widthTable;
    o.widthContainer = widthContainer;
    o.widthAvailable = widthAvailable;

    let counter = 0;
    let sum = 0;
    let sum_visible = 0;

    $(target).find('thead th[data-smartcol]').each( function() {
      let columnSize = $(this).attr('data-smartcol-width');
      let cellWidth = 0;
      if (columnSize == 'stretch') {
        cellWidth = (o.columnWidthWide_rem * o.baseFontSize_px) + 1;
      }
      else if (columnSize == 'narrow') {
        cellWidth = (o.columnWidthNarrow_rem * o.baseFontSize_px) + 1;
      }
      else if (columnSize == 'normal') {
        cellWidth = (o.columnWidthNormal_rem * o.baseFontSize_px) + 1;
      }
      else if (columnSize == 'wide') {
        cellWidth = (o.columnWidthWide_rem * o.baseFontSize_px) + 1;
      }

      //add this columns reference cell width to the sum of columns evaluated so far"
      sum += cellWidth;

      $(target).find('th[data-smartcol-width]').removeClass('smartcol-width-auto');

      //if this is the first column, and we've chosen to freeze it, then show it regardless of anything else:
      if ((counter === 0) && (o.freezeFirstColumn === true)) {
        $(this).show();
        $(target).find('tbody tr').each( function() {
          $(this).find('td').eq(counter).show();
        })
        sum_visible += cellWidth;
      }

      //else if we've already hit the limit of number of columns we're allowed to show, then hide this one:
      else if ( counter_visible >= o.maxVisibleColumns) {
        $(this).hide();
        $(target).find('tbody tr').each( function() {
          $(this).find('td').eq(counter).hide();
        })
      }

      //else if adding this column to the sum has put it over the available width, hide it:
      else if (sum > widthAvailable) {
        $(this).hide();
        $(target).find('tbody tr').each( function() {
          $(this).find('td').eq(counter).hide();
        })

      //else if this is the last last data column, hide it regardless of anything else because we always replace the last column with the selectable column:
      } else if ( $(this).is(':nth-child(' + (lastDataColumnNth) +')') ) {
        $(this).hide();
        $(target).find('tbody tr').each( function() {
          $(this).find('td').eq(counter).hide();
        })
      }

      //else this must be a column we can show
      else {
        $(this).show();
        $(target).find('tbody tr').each( function() {
          $(this).find('td').eq(counter).show();
        })
        sum_visible += cellWidth;
      }

      counter ++;
      counter_visible ++;

      if (widthAvailable < sum_visible) {
        $(target).find('th[data-smartcol-width]').addClass('smartcol-width-auto');
      } else {
        $(target).find('th[data-smartcol-width]').removeClass('smartcol-width-auto');
        stretchColumns(target,o);
      }

    });
  }
  hideDataColumns(target,o,lastDataColumnNth,widthActionsContent);
  $(window).resize( function() {
    hideDataColumns(target,o,lastDataColumnNth,widthActionsContent);
  });


  /* Automatically set the selectable column */
  /* If selectable column is set to auto (default on page load), show the data for the first hidden column. This dynamically changes the data in the selectable column as data columns hide and show. Run at page load and on window resize */
  function selectableColumn_auto(target) {
    let auto = $(target).find('th[data-smartcol-selectable]').attr('data-smartcol-auto');
    if (typeof auto !== 'undefined' && auto !== false) {
      let firstHidden = $(target).find('thead th:hidden:first').attr('data-smartcol');
      selectableColumn_set(target,firstHidden);
    }
  }
  selectableColumn_auto(target);
  $(window).resize( function() {
    selectableColumn_auto(target);
  });


  function stretchColumns(target,o) {
    let stretchBaseWidth = (o.columnWidthWide_rem * o.baseFontSize_px) + 1;
    let counter = 0;
    let sum = 0;

    $(target).find('thead th[data-smartcol-width="stretch"]').each(function() {
      if ( $(this).is(':visible') ) {
        sum += $(this).width();
        counter ++;
      }
    });
    widthStretch = sum / counter;

    if (widthStretch >= stretchBaseWidth) {
      $(target).find('thead th[data-smartcol-width="stretch"]').addClass('smartcol-width-auto');
    }
  }


  /* Sets the selectable column's data when we need to put data into it */
  function selectableColumn_set(target,data_column) {

    //get the index of the selectable column, so we know where to put the data:
    let selectIndex = $(target).find('th[data-smartcol-selectable]').index();

    let selectTH = $(target).find('th[data-smartcol-selectable]');
    let sourceTH = $(target).find('th[data-smartcol="' + data_column + '"]');
    let sourceIndex = sourceTH.attr('data-smartcol');
    let sourceSize = sourceTH.attr('data-smartcol-width');
    let sourceWrap = sourceTH.attr('data-smartcol-wrap');
    let sourceCenter = sourceTH.attr('data-smartcol-center');
    let sourceAuto = sourceTH.hasClass('smartcol-width-auto');
    let selectTD = undefined;
    let selectTDdata = undefined;

    $(selectTH).removeClass('smartcol-width-auto');
    if (sourceAuto === true) {
      $(selectTH).addClass('smartcol-width-auto');
    }

    //change the select menu's selected option to the chosen one:
    $(selectTH).find('select option').removeAttr('selected'); //remove existing selected first
    $(selectTH).find('select option[value="' + sourceIndex + '"]').attr('selected', 'selected');

    //change the select column's size keyword to the correct value for the selected data column:
    $(selectTH).attr('data-smartcol-width',sourceSize);

    //add styling attributes to the body table cells in the selectable column
    $(target).find('tbody tr').each(function() {
      selectTD = $(this).find('td').eq(selectIndex);

      //remove and add the column-wrap:
      selectTD.removeAttr('data-smartcol-wrap');
      if (typeof sourceWrap !== 'undefined' && sourceWrap !== false) {
        selectTD.attr('data-smartcol-wrap','');
      }

      //remove and add the center alignment:
      selectTD.removeAttr('data-smartcol-center');
      if (typeof sourceCenter !== 'undefined' && sourceCenter !== false) {
        selectTD.attr('data-smartcol-center','');
      }

      sourceTDdata = $(this).find('td').eq(sourceIndex).text();
      selectTD.text(sourceTDdata);

      stretchColumns(target,o);

    });
  }

} //ends smartColumns initialisation