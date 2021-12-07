/*
SmartColumns
by Colin James Firth
https://github.com/colinjamesfirth/smartcolumns
verson 1.3
*/

function smartColumns(target,options) {
  let optionDefaults = {
    freezeFirstColumn: true,
    maxVisibleColumns: 100,
    columnWidthNarrow_rem: 5, //rem
    columnWidthNormal_rem: 10, //rem
    columnWidthWide_rem: 15, //rem
    baseFontSize_px: parseFloat(getComputedStyle(document.documentElement).fontSize),
    store_widthTable: 0,
    store_widthContainer: 0,
    store_widthAvailable: 0
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

    selectMenu += '<option value="auto" >Auto &check;</option>';
    $(target).find('thead th[data-smartcol]').each(function() {
      $(this).attr('data-smartcol',counter);
      let t = $(this).text();
      selectMenu += '<option value="' + counter + '">' + t + '</option>\n';
      counter++;
    });
    selectMenu += '</select>\n';

    //add the new th in the thead for the selctable column:
    $(target).find('thead tr th:nth-child(' + lastDataColumnNth + ')').after('<th data-smartcol-selectable data-smartcol-auto>' + selectMenu + '</th>\n');

    $(target).find('th[data-smartcol-selectable] select option[value="auto"]').after('<hr />');

    //add a new td in every tbody row for the selctable column:
    $(target).find('tbody tr td:nth-child(' + lastDataColumnNth + ')').each( function() {
      $(this).after('<td></td>\n');
    });

    /* Add a change event to the select menu to check for user input */
    $(target).on('change','th[data-smartcol-selectable] select',function() {

      let data_column = $(this).val();

      if (data_column == 'auto') {
        //add the data-smartcol-auto attribute, because we want this column to be auto now:
        $(this).closest('th[data-smartcol-selectable]').attr('data-smartcol-auto','');
        //get the value of the column we need to auto select:
        data_column = $(target).find('th[data-smartcol]:hidden').first().attr('data-smartcol');
        //check the Auto option:
        $(this).find('option[value="auto"]').html('Auto &check;');
      }
      else {
        //remove the data-smartcol-auto attribute, because we want this column to be fixed now:
        $(this).closest('th[data-smartcol-selectable]').removeAttr('data-smartcol-auto');
        //uncheck the auto option:
        $(this).find('option[value="auto"]').text('Auto');
      }

      //set the column data based on the selection:
      selectableColumn_set(target,data_column);
    });

  })();

  let widthFixedColumns_sum = 0;
  (function() {
    $(target).find('thead th[data-smartcol-fixed]').each(function() {

      //get the index of the actions column:
      let thisColumn_index = $(this).index();

      //add a span around this column's content in tbody, so we can measure their width (note we can't just measure the cell width, because the browser naturally varies how wide the cell is based on the rest of the table's content):
      $(target).find('tbody tr').each(function() {
        $(this).find('td').eq(thisColumn_index).wrapInner('<span data-smartcol-actions-wrap></span>');
      });

      //measure the padding and width, calculate the fixed width and apply it:
      let thisColumnContent_width = parseFloat( $(target).find('tbody tr:first-child td').eq(thisColumn_index).find('span[data-smartcol-actions-wrap]').width() );
      let thisColumnPaddingLeft_width = parseFloat( $(target).find('tbody tr:first-child td').eq(thisColumn_index).css('padding-left') );
      let thisColumnPaddingRight_width = parseFloat( $(target).find('tbody tr:first-child td').eq(thisColumn_index).css('padding-right') );
      let thisColumn_width = thisColumnContent_width + thisColumnPaddingLeft_width + thisColumnPaddingRight_width;
      $(this).attr('data-smartcol-fixed',thisColumn_width);

      //add this width to the sum of all fixed columns for use later:
      widthFixedColumns_sum += thisColumn_width;
    });

  })();

  function updateFixedColumnWidths(target,o) {
    let widthContainer = $(target).closest('.smartcol-container').outerWidth();

    $(target).find('thead th[data-smartcol-fixed]').each(function() {
      let thisIndex = $(this).index();
      let thisWidth_px = $(this).attr('data-smartcol-fixed');
      //dynamically change the width of the actions column as the window changes width.
      let thisWidth_percent = ((100 / widthContainer) * thisWidth_px) + '%';
      $(this).css('width',thisWidth_percent);
      });
  }
  updateFixedColumnWidths(target,o);
  $(window).resize( function() {
    updateFixedColumnWidths(target,o);
  });


  /* Add each columns' content alignment if set */
  (function() {
    $(target).find('thead th[data-smartcol-align]').each(function() {
      let thisIndex = $(this).index();
      let thisValue = $(this).attr('data-smartcol-align');
      $(target).find('tbody tr').each(function() {
        $(this).find('td').eq(thisIndex).attr('data-smartcol-align',thisValue);
      });
    });
  })();


  /* Add each columns' wrapping if set */
  (function() {
    $(target).find('thead th[data-smartcol-wrap]').each(function() {
      let thisIndex = $(this).index();
      $(target).find('tbody tr').each(function() {
        $(this).find('td').eq(thisIndex).attr('data-smartcol-wrap','');
      });
    });
  })();

  /* convert rem units to pixel equivalents */
  function rem2px(rem) {
    let px = (o.columnWidthWide_rem * o.baseFontSize_px);
    return px;
  }

  /* Hides columns from right to left depending on the amout of available space, making sure the minimum width of columns is always honoured. Run at page load and on window resize */
  function hideDataColumns(target,o,lastDataColumnNth,widthFixedColumns_sum) {
    let widthTable = $(target).outerWidth();
    let widthContainer = $(target).closest('.smartcol-container').width();
    let firstHideableColumnNth = 1;
    let counter_visible = 1;
    let widthFirstColumn = 0;

    if (o.freezeFirstColumn === true) {
      firstHideableColumnNth = 2;
      let firstColumnSizeKeyword = $(target).find('thead th[data-column]').first().attr('data-smartcol-width');
      if (firstColumnSizeKeyword == 'stretch') {
        widthFirstColumn = rem2px(o.columnWidthWide_rem) + 1;
      }
      else if (firstColumnSizeKeyword == 'narrow') {
        widthFirstColumn = rem2px(o.columnWidthNarrow_rem) + 1;
      }
      else if (firstColumnSizeKeyword == 'normal') {
        widthFirstColumn = rem2px(o.columnWidthNormal_rem) + 1;
      }
      else if (firstColumnSizeKeyword == 'wide') {
        widthFirstColumn = rem2px(o.columnWidthWide_rem) + 1;
      }
    }

    let widestColumn = null;
    if ( $(target).find('thead th[data-smartcol-width="stretch"]').length ) {
      widestColumn = rem2px(o.columnWidthWide_rem) + 1;
    }
    else if ( $(target).find('thead th[data-smartcol-width="wide"]').length ) {
      widestColumn = rem2px(o.columnWidthWide_rem) + 1;
    }
    else if ( $(target).find('thead th[data-smartcol-width="normal"]').length ) {
      widestColumn = rem2px(o.columnWidthNormal_rem) + 1;
    }
    else if ( $(target).find('thead th[data-smartcol-width="narrow"]').length ) {
      widestColumn = rem2px(o.columnWidthNarrow_rem) + 1;
    }
    let widthReservedForSelectColumn = widestColumn;

    let widthFixedColumns = widthFirstColumn + widthReservedForSelectColumn + widthFixedColumns_sum;
    let widthAvailable = widthContainer - widthFixedColumns;

    o.store_widthTable = widthTable;
    o.store_widthContainer = widthContainer;
    o.store_widthAvailable = widthAvailable;

    let counter = 0;
    let sum = 0;
    let sum_visible = 0;

    $(target).find('thead th[data-smartcol]').each( function() {
      let columnSize = $(this).attr('data-smartcol-width');
      let cellWidth = 0;
      let thisIndex = $(this).index();

      if (columnSize == 'stretch') {
        cellWidth = rem2px(o.columnWidthWide_rem) + 1;
      }
      else if (columnSize == 'narrow') {
        cellWidth = rem2px(o.columnWidthNarrow_rem) + 1;
      }
      else if (columnSize == 'normal') {
        cellWidth = rem2px(o.columnWidthNormal_rem) + 1;
      }
      else if (columnSize == 'wide') {
        cellWidth = rem2px(o.columnWidthWide_rem) + 1;
      }

      //add this columns reference cell width to the sum of columns evaluated so far"
      sum += cellWidth;

      $(target).find('th[data-smartcol-width]').removeClass('smartcol-width-auto');

      //if this is the first column, and we've chosen to freeze it, then show it regardless of anything else:
      if ((counter === 0) && (o.freezeFirstColumn === true)) {
        $(this).show();
        $(target).find('tbody tr').each( function() {
          $(this).find('td').eq(thisIndex).show();
        })
        sum_visible += cellWidth;
      }

      //else if we've already hit the limit of number of columns we're allowed to show, then hide this one:
      else if ( counter_visible >= o.maxVisibleColumns) {
        $(this).hide();
        $(target).find('tbody tr').each( function() {
          $(this).find('td').eq(thisIndex).hide();
        })
      }

      //else if adding this column to the sum has put it over the available width, hide it:
      else if (sum > widthAvailable) {
        $(this).hide();
        $(target).find('tbody tr').each( function() {
          $(this).find('td').eq(thisIndex).hide();
        })

      //else if this is the last last data column, hide it regardless of anything else because we always replace the last column with the selectable column:
      } else if ( $(this).is(':nth-child(' + (lastDataColumnNth) +')') ) {
        $(this).hide();
        $(target).find('tbody tr').each( function() {
          $(this).find('td').eq(thisIndex).hide();
        })
      }

      //else this must be a column we can show
      else {
        $(this).show();
        $(target).find('tbody tr').each( function() {
          $(this).find('td').eq(thisIndex).show();
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
  hideDataColumns(target,o,lastDataColumnNth,widthFixedColumns_sum);
  $(window).resize( function() {
    hideDataColumns(target,o,lastDataColumnNth,widthFixedColumns_sum);
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
    let stretchBaseWidth = rem2px(o.columnWidthWide_rem) + 1;
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
    let sourceRef = sourceTH.attr('data-smartcol');
    let sourceIndex = sourceTH.index();
    let sourceSize = sourceTH.attr('data-smartcol-width');
    let sourceWrap = sourceTH.attr('data-smartcol-wrap');
    let sourceAlign = sourceTH.attr('data-smartcol-align');
    let sourceAuto = sourceTH.hasClass('smartcol-width-auto');
    let selectTD = undefined;
    let selectTDdata = undefined;

    $(selectTH).removeClass('smartcol-width-auto');
    if (sourceAuto === true) {
      $(selectTH).addClass('smartcol-width-auto');
    }

    //change the select menu's selected option to the chosen one:
    $(selectTH).find('select option').removeAttr('selected'); //remove existing selected first
    $(selectTH).find('select option[value="' + sourceRef + '"]').attr('selected', 'selected');
    $(selectTH).find('select option[value="' + sourceRef + '"]').prop('selected', true)

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
      selectTD.removeAttr('data-smartcol-align');
      if (typeof sourceAlign !== 'undefined' && sourceAlign !== false) {
        selectTD.attr('data-smartcol-align',sourceAlign);
      }

      sourceTDdata = $(this).find('td').eq(sourceIndex).text();

      selectTD.text(sourceTDdata);

      stretchColumns(target,o);

    });
  }

} //ends smartColumns initialisation