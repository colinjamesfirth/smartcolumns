

function output(target,name,value) {
  $(target).find('caption .' + name).remove();
  let output = '<span class="' + name + '"> | ' + name + ': ' + value + '</span>';
  $(target).find('caption').append(output);
}

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
  $(target).wrap('<div class="smartcol-container"></div>');

  let selectColPos = (o.hasActionsColumn === true) ? 2 : 1;

  /* Build the selectable column */
  (function() {
    //create the select menu:
    let selectMenu = '<select aria-label="Choose the data for this column">\n';
    $(target).find('thead th[data-smartcol-index]').each(function() {
      let v = $(this).attr('data-smartcol-index');
      let t = $(this).text();
      selectMenu += '<option value="' + v + '">' + t + '</option>\n';
    });
    selectMenu += '</select>\n';

    //add the new th in the thead for the selctable column:
    $(target).find('thead tr th:nth-last-of-type(' + selectColPos + ')').after('<th data-smartcol-selectable data-smartcol-auto>' + selectMenu + '</th>\n');

    //add a new td in every tbody row for the selctable column:
    $(target).find('tbody tr td:nth-last-of-type(' + selectColPos + ')').each( function() {
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
    widthActionsContent = widthActionsContent + ((o.cellXPadding * o.baseRemPX) * 2);

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
  function hideDataColumns(target,o,selectColPos,widthActionsContent) {
    let widthTable = $(target).outerWidth();
    let widthContainer = $(target).closest('.smartcol-container').width();
    let widthFirstColumn = 0;
    let firstHideableColumn = 0;

    if (o.freezeFirstColumn === true) {
      firstHideableColumn = 1;
      let firstColumnSizeKeyword = $(target).find('thead th:first-of-type').attr('data-smartcol-width');
      if (firstColumnSizeKeyword == 'stretch') {
        widthFirstColumn = (o.columnWidthWide * o.baseRemPX) + 1;
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

    let widestColumn = null;
    if ( $(target).find('thead th[data-smartcol-width="stretch"]').length ) {
      widestColumn = (o.columnWidthWide * o.baseRemPX) + 1;
    }
    else if ( $(target).find('thead th[data-smartcol-width="wide"]').length ) {
      widestColumn = (o.columnWidthWide * o.baseRemPX) + 1;
    }
    else if ( $(target).find('thead th[data-smartcol-width="normal"]').length ) {
      widestColumn = (o.columnWidthNormal * o.baseRemPX) + 1;
    }
    else if ( $(target).find('thead th[data-smartcol-width="narrow"]').length ) {
      widestColumn = (o.columnWidthNarrow * o.baseRemPX) + 1;
    }

    widthTableAvailable = widthContainer - (widthFirstColumn + widestColumn + widthActionsContent);
    let counter = 1;
    let sum = 0;

    $(target).find('thead th:not(:nth-of-type(' + firstHideableColumn + ')):not(:nth-last-of-type(-n+' + selectColPos + '))').each( function() {
      let columnSize = $(this).attr('data-smartcol-width');
      let cellWidth = 0;
      if (columnSize == 'stretch') {
        cellWidth = (o.columnWidthWide * o.baseRemPX) + 1;
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
  hideDataColumns(target,o,selectColPos,widthActionsContent);
  $(window).resize( function() {
    hideDataColumns(target,o,selectColPos,widthActionsContent);
  });


  /* Automatically set the selectable column */
  /* If selectable column is set to auto (default on page load), show the data for the first hidden column. This dynamically changes the data in the selectable column as data columns hide and show. Run at page load and on window resize */
  function selectableColumn_auto(target) {
    let auto = $(target).find('th[data-smartcol-selectable]').attr('data-smartcol-auto');
    if (typeof auto !== 'undefined' && auto !== false) {
      let firstHidden = $(target).find('thead th:hidden:first').attr('data-smartcol-index');
      selectableColumn_set(target,firstHidden);
    }
  }
  selectableColumn_auto(target);
  $(window).resize( function() {
    selectableColumn_auto(target);
  });



  function stretchColumns(target,o) {
    let stretchBaseWidth = (o.columnWidthWide * o.baseRemPX) + 1;
    let counter = 0;
    let sum = 0;

    $(target).find('thead th[data-smartcol-width="stretch"]').each(function() {
      if ( $(this).is(':visible') ) {
        sum += $(this).width();
        counter ++;
      }
    });
    widthStretch = sum / counter;

    $(target).find('thead th[data-smartcol-width="stretch"]').removeClass('smartcol-stretch-auto');

    if (widthStretch >= stretchBaseWidth) {
      $(target).find('thead th[data-smartcol-width="stretch"]').addClass('smartcol-stretch-auto');
    }
  }







  /* Sets the selectable column's data when we need to put data into it */
  function selectableColumn_set(target,data_column) {

    //get the index of the selectable column, so we know where to put the data:
    let selectIndex = $(target).find('th[data-smartcol-selectable]').index() + 1;

    let selectTH = $(target).find('th[data-smartcol-selectable]');
    let sourceTH = $(target).find('th[data-smartcol-index="' + data_column + '"]');
    let sourceIndex = sourceTH.attr('data-smartcol-index');
    let sourceSize = sourceTH.attr('data-smartcol-width');
    let sourceWrap = sourceTH.attr('data-smartcol-wrap');
    let sourceCenter = sourceTH.attr('data-smartcol-center');
    let selectTD = undefined;
    let selectTDdata = undefined;

    if (sourceSize != 'stretch') {
      $(selectTH).removeClass('smartcol-stretch-auto');
    }

    //change the select menu's selected option to the chosen one:
    $(selectTH).find('select option').removeAttr('selected'); //remove existing selected first
    $(selectTH).find('select option[value="' + sourceIndex + '"]').attr('selected', 'selected');

    //change the select column's size keyword to the correct value for the selected data column:
    $(selectTH).attr('data-smartcol-width',sourceSize);

    //add styling attributes to the body table cells in the selectable column
    $(target).find('tbody tr').each(function() {
      selectTD = $(this).find('td:nth-of-type(' + (selectIndex + 0) + ')');

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

      sourceTDdata = $(this).find('td:nth-of-type(' + sourceIndex + ')').text();
      selectTD.text(sourceTDdata);

      stretchColumns(target,o);

    });

  }

} //ends smartColumns initialisation