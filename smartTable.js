function smartColumns(target,options) {
  let optionDefaults = {
    cellXPadding: 0.75, //rem
    baseRemPX: parseFloat(getComputedStyle(document.documentElement).fontSize),
    columnWidthNarrow: 5, //rem
    columnWidthNormal: 10, //rem
    columnWidthWide: 15, //rem
    freezeFirstColumn: true,
    hasActionsColumn: true
  }
  o = { ...optionDefaults, ...(options || {}) };

  /* Wrap the target table in a block level div so we can measure the width of the containing space (also used for CSS selectors) */
  $(target).wrap('<div class="table-container"></div>');

  var selectColPos = (o.hasActionsColumn === true) ? 2 : 1;

  /* Build the selectable column */
  (function() {
    $(target).find('thead tr th:nth-last-of-type(' + selectColPos + ')').after('<th data-column-selectable></th>\n');

    var firstHidden = $(target).find("thead th:hidden:first").index();
    options = '';
    table_columns.forEach( function(th,i) {
      options += '<option value="' + i + '">' + th[0] + '</option>\n';
    });
    $(target).find('tbody tr td:nth-last-of-type(' + selectColPos + ')').each( function() {
      $(this).after('<td></td>\n');
    });
    var column_select = '<select data-column-selected="auto" aria-label="Choose the data for this column">\n' + options + '</select>\n';
    $(target).find('th[data-column-selectable]').html(column_select);

    /* When user manually selects data for the selectable column... */
    $(target).on('change','select[data-column-selected]',function() {
      var data_column = $(this).val();
      $(this).attr('data-column-selected',data_column);
      selectableColumn_set(target,data_column);
    });
  })();

  /* Hides columns from right to left depending on the amout of available space, making sure the minimum width of columns is always honoured. Run at page load and on window resize */
  function hideDataColumns(target,o,selectColPos) {
    widthTable = $(target).outerWidth();
    widthContainer = $(target).closest('.table-container').outerWidth();

    var widthFirstColumn = 0;
    var firstHideableColumn = 0;
    if (o.freezeFirstColumn === true) {
      var firstHideableColumn = 1;
      var firstColumnSizeKeyword = $(target).find('thead th:first-of-type').attr('data-column-size');
      if (firstColumnSizeKeyword == 'auto') {
        widthFirstColumn = (o.columnWidthNormal * o.baseRemPX) + 1;
      }
      else if (firstColumnSizeKeyword == 'narrow') {
        widthFirstColumn = (o.columnWidthNarrow * o.baseRemPX) + 1;
      }
      else if (firstColumnSizeKeyword == 'normal') {
        widthFirstColumn = (o.columnWidthNormal * o.baseRemPX) + 1;
      }
      else if (firstColumnSizeKeyword == 'wide') {
        widthFirstColumn = (o.columnWidthWide * o.baseRemPX) + 1;
      }
    }

    var widestColumn = null;
    if ( $(target).find('thead th[data-column-size="wide"]').length ) {
      widestColumn = (o.columnWidthWide * o.baseRemPX) + 1;
    }
    else if ( $(target).find('thead th[data-column-size="normal"]').length ) {
      widestColumn = (o.columnWidthNormal * o.baseRemPX) + 1;
    }
    else if ( $(target).find('thead th[data-column-size="narrow"]').length ) {
      widestColumn = (o.columnWidthNarrow * o.baseRemPX) + 1;
    }
    else if ( $(target).find('thead th[data-column-size="auto"]').length ) {
      widestColumn = (o.columnWidthNormal * o.baseRemPX) + 1;
    }

    var widthActionsColumn = 0;
    if (o.hasActionsColumn === true) {
      widthActionsColumn = $(target).find('tbody tr:first-child .actions-column > span').width();
      widthActionsColumn = widthActionsColumn + ((o.cellXPadding * o.baseRemPX) * 2);
      $(target).find('thead .actions-column').css('width',widthActionsColumn).attr('data-actions-col-width',widthActionsColumn);
    }

    widthTableAvailable = widthContainer - (widthFirstColumn + widestColumn + widthActionsColumn);
    var counter = 1;
    var sum = 0;

    $(target).find('thead th:not(:nth-of-type(' + firstHideableColumn + ')):not(:nth-last-of-type(-n+' + selectColPos + '))').each( function() {
      columnSize = $(this).attr('data-column-size');
      if (columnSize == 'auto') {
        cellWidth = (o.columnWidthNormal * o.baseRemPX) + 1;
      }
      else if (columnSize == 'narrow') {
        cellWidth = (o.columnWidthNarrow * o.baseRemPX) + 1;
      }
      else if (columnSize == 'normal') {
        cellWidth = (o.columnWidthNormal * o.baseRemPX) + 1;
      }
      else if (columnSize == 'wide') {
        cellWidth = (o.columnWidthWide * o.baseRemPX) + 1;
      }

      sum += cellWidth;
      //if adding this column to the sum has put it over the available width, hide it:
      if (sum > widthTableAvailable) {
        $(this).hide();
        $(target).find('tbody tr').each( function() {
          $(this).find('td').eq(counter).hide();
        })
      //else if this is the last last data column, hide it regardless of anything else because we always replace the last column with the selectable column:
      } else if ( $(this).is(':nth-last-of-type(' + (selectColPos + 1) +')') ) {
        $(this).hide();
        $(target).find('tbody tr').each( function() {
          $(this).find('td').eq(counter).hide();
        })
      }
      //else this is a column we can show
      else {
        $(this).show();
        $(target).find('tbody tr').each( function() {
          $(this).find('td').eq(counter).show();
        })
      }
      counter ++;
    });
  }
  hideDataColumns(target,o,selectColPos);
  $(window).resize( function() {
    hideDataColumns(target,o,selectColPos);
  });

  /* Automatically set the selectable column */
  /* If all columns (exclusing the first) are hidden then show the first hidden column's data instead of a blank column; then make it blank again if the window size increases and more columns can show. But, if the user selects data for the selectable column, then that selection persists. Run at page load and on window resize */
  function selectableColumn_auto(target) {
    var data = $(target).find('select[data-column-selected]').attr('data-column-selected');
    if ( data == 'auto') {
      var firstHidden = $(target).find('thead th:hidden:first').index();
      selectableColumn_set(target,firstHidden);
    }
  }
  selectableColumn_auto(target);
  $(window).resize( function() {
    selectableColumn_auto(target);
  });

  /* Sets the selectable column's data when we need to put data into it */
  function selectableColumn_set(target,data_column) {
    console.log(data_column);
    select_column_index = $(target).find('th[data-column-selectable]').index();
    counter = 0;

    //change the select menu's selected option to the chosen one:
    $(target).find('select[data-column-selected] option[value="' + data_column + '"]').prop('selected', true);

    //change the select column's width index to the correct value for the selected data column:
    $(target).find('th[data-column-selectable]').attr('data-column-size',table_columns[data_column][1]);

    //add styling attributes to the body table cells in the selectable column
    $(target).find('tbody tr').each(function() {
      targetTD = $(this).find('td:nth-of-type(' + (select_column_index + 1) + ')');
      cell_data = table_rows[counter][data_column];

      //remove and add the column-wrap:
      targetTD.removeAttr('data-column-wrap');
      if (table_columns[data_column][2] == true) {
        targetTD.attr('data-display-wrap','');
      }

      //remove and add the center alignment:
      targetTD.removeAttr('data-display-center');
      if (table_columns[data_column][3] == true) {
        targetTD.attr('data-display-center','');
      }

      targetTD.text(cell_data);
      counter ++;
    });
  }

} //ends smartColumns initialisation