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

    //create the select menu:
    selectMenu = '<select data-column-auto aria-label="Choose the data for this column">\n';
    $(target).find('thead th[data-column-index]').each(function() {
      v = $(this).attr('data-column-index');
      t = $(this).text();
      selectMenu += '<option value="' + v + '">' + t + '</option>\n';
    });
    selectMenu += '</select>\n';

    //add the new th in the thead for the selctable column:
    $(target).find('thead tr th:nth-last-of-type(' + selectColPos + ')').after('<th data-column-selectable>' + selectMenu + '</th>\n');

    //add a new td in every tbody row for the selctable column:
    $(target).find('tbody tr td:nth-last-of-type(' + selectColPos + ')').each( function() {
      $(this).after('<td></td>\n');
    });

    /* Add a change event to the select menu to check for user input */
    $(target).on('change','th[data-column-selectable] select',function() {
      var data_column = $(this).val();
      $(this).removeAttr('data-column-auto');
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
  /* If selectable column is set to auto (default on page load), show the data for the first hidden column. This dynamically changes the data in the selectable column as data columns hide and show. Run at page load and on window resize */
  function selectableColumn_auto(target) {
    var auto = $(target).find('th[data-column-selectable] select').attr('data-column-auto');
    if (typeof auto !== 'undefined' && auto !== false) {
      var firstHidden = $(target).find('thead th:hidden:first').attr('data-column-index');
      selectableColumn_set(target,firstHidden);
    }
  }
  selectableColumn_auto(target);
  $(window).resize( function() {
    selectableColumn_auto(target);
  });

  /* Sets the selectable column's data when we need to put data into it */
  function selectableColumn_set(target,data_column) {

    //get the index of the selectable column, so we know where to put the data:
    var selectIndex = $(target).find('th[data-column-selectable]').index() + 1;

    var selectTH = $(target).find('th[data-column-selectable]');
    var sourceTH = $(target).find('th[data-column-index="' + data_column + '"]');
    var sourceIndex = sourceTH.attr('data-column-index');
    var sourceSize = sourceTH.attr('data-column-size');
    var sourceWrap = sourceTH.attr('data-display-wrap');
    var sourceCenter = sourceTH.attr('data-display-center');

    //change the select menu's selected option to the chosen one:
    $(selectTH).find('select option').removeAttr('selected'); //remove existing selected first
    $(selectTH).find('select option[value="' + sourceIndex + '"]').attr('selected', 'selected');

    //change the select column's size keyword to the correct value for the selected data column:
    $(selectTH).attr('data-column-size',sourceSize);

    //add styling attributes to the body table cells in the selectable column
    $(target).find('tbody tr').each(function() {
      selectTD = $(this).find('td:nth-of-type(' + (selectIndex + 0) + ')');

      //remove and add the column-wrap:
      selectTD.removeAttr('data-display-wrap');
      if (typeof sourceWrap !== 'undefined' && sourceWrap !== false) {
        selectTD.attr('data-display-wrap','');
      }

      //remove and add the center alignment:
      selectTD.removeAttr('data-display-center');
      if (typeof sourceCenter !== 'undefined' && sourceCenter !== false) {
        selectTD.attr('data-display-center','');
      }

      sourceTDdata = $(this).find('td:nth-of-type(' + sourceIndex + ')').text();
      selectTD.text(sourceTDdata);

    });
  }

} //ends smartColumns initialisation