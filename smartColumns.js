/*
SmartColumns
by Colin James Firth
https://github.com/colinjamesfirth/smartcolumns
verson 1.4
*/

/*
MAIN COMPONENT SCRIPT
*/

function smartColumns(target,options) {


  /* **********************************************************************************
  *************************************************************************************
  VARIABLES AND PROPERTIES
  *************************************************************************************
  ********************************************************************************** */

  let optionDefaults = {
    freezeFirstColumn: true,
    maxVisibleColumns: 100,
    reEnableAuto: false,
    columnWidthNarrow: '5rem',
    columnWidthNormal: '10rem',
    columnWidthWide: '15rem',
    baseFontSize_px: parseFloat(getComputedStyle(document.documentElement).fontSize),
    store_widthTable: 0,
    store_widthContainer: 0,
    store_widthAvailable: 0,
    store_widthWidestColumn: 0,
    store_colSelected: 0
  }
  o = { ...optionDefaults, ...(options || {}) };

  let columnProperties = [ ];



  /* **********************************************************************************
  *************************************************************************************
  UTILITY FUNCTIONS
  *************************************************************************************
  ********************************************************************************** */

  function sizeUnitConvert(input) {
    let last1Char = input.slice(-1);
    let last2Char = input.slice(-2);
    let last3Char = input.slice(-3);
    let output = undefined;

    /* is rem */
    if (last3Char == 'rem') {
      output = parseFloat(input) * o.baseFontSize_px;
    }
    /* is px */
    else if (last2Char == 'px') {
      output = parseInt(input);
    }
    /* else is unknown, assume it's px */
    else {
      output = parseInt(input);
    }
    return output;
  }

  function sizeKeywordConvert(input) {
    if (input == 'narrow') {
      output = o.columnWidthNarrow;
    }
    else if (input == 'normal') {
      output = o.columnWidthNormal;
    }
    else if (input == 'wide') {
      output = o.columnWidthWide;
    }
    else if (input == 'stretch') {
      output = o.columnWidthWide;
    }
    else {
      output = input;
    }
    return output;
  }



  /* **********************************************************************************
  *************************************************************************************
  TABLE SETUP (Give all the columns the base properties they need)
  *************************************************************************************
  ********************************************************************************** */

  /* Wrap the target table in a block level div so we can measure the width of the containing space (also used for CSS selectors) */
  (function() {
    if ( !$(target).parent().hasClass('smartcol-container') ) {
      $(target).wrap('<div class="smartcol-container"></div>');
    }
  })();

  /* For each header column, set an index for use later and add the column to the columnProperties array */
  (function() {
    let counter = 0;
    $(target).find('thead th[data-smartcol]').each(function() {
      $(this).attr('data-smartcol',counter);
      columnProperties[counter] = { };
      counter ++;
    });
  })();

  /* For each data column, mark the body rows' tds with a special class  */
  (function() {
    $(target).find('thead th[data-smartcol]').each(function() {
      let thisIndex = $(this).index();
      $(target).find('tbody tr').each(function() {
        $(this).find('td').eq(thisIndex).addClass('smartcol-data-column');
      });
    });
  })();

  /* If any data columns don't have a width setting, give them one – making them all 'normal' */
  (function() {
    $(target).find('thead th[data-smartcol]:not([data-smartcol-size])').each(function() {
      $(this).attr('data-smartcol-size','normal');
    });
  })();

  /* Give the data columns width */
  (function() {
    $(target).find('thead th[data-smartcol]').each(function() {
      let thisCol = $(this).attr('data-smartcol');
      let thisValue = $(this).attr('data-smartcol-size');

      // if the column doesn't have a size attribute, then give it one, based on a default of 'normal'
      if (typeof thisValue === 'undefined' && thisValue === false) {
        thisValue = 'normal';
        $(this).attr('data-smartcol-size',thisValue);
      }

      // if this is not
      let thisSetting = sizeKeywordConvert(thisValue);
      if (thisSetting != 'auto') {
        thisWidth = sizeUnitConvert(thisSetting);
        $(this).css('width',thisWidth);
        if (thisWidth > o.store_widthWidestColumn) {
          o.store_widthWidestColumn = thisWidth;
        }
      } else {
        thisWidth = 'auto';
      }
      columnProperties[thisCol].size = thisValue;
      columnProperties[thisCol].width = thisWidth;
    });
  })();

  /* Add each columns' content alignment if set */
  (function() {
    $(target).find('thead th[data-smartcol]').each(function() {
      let thisCol = $(this).attr('data-smartcol');
      let thisIndex = $(this).index();
      let thisValue = $(this).attr('data-smartcol-align');

      // if the column doesn't have an align attribute, then give it one, based on a default of 'left'
      if (typeof thisValue === 'undefined' || thisValue === false) {
        thisValue = 'left';
      }

      $(this).css('text-align',thisValue);
      $(target).find('tbody tr').each(function() {
        $(this).find('td').eq(thisIndex).css('text-align',thisValue);
      });
      columnProperties[thisCol].align = thisValue;
    });
  })();

  /* Add each columns' wrapping if set */
  (function() {
    $(target).find('thead th[data-smartcol]').each(function() {
      let thisCol = $(this).attr('data-smartcol');
      let thisIndex = $(this).index();
      let thisValue = $(this).attr('data-smartcol-overflow');

      // if the column doesn't have a wrapping attribute, then give it one, based on a default of 'normal'
      if (typeof thisValue === 'undefined' || thisValue === false) {
        thisValue = 'normal';
      }

      $(target).find('tbody tr').each(function() {
        $(this).find('td').eq(thisIndex).addClass('smartcol-overflow-' + thisValue);
      });
      columnProperties[thisCol].overflow = thisValue;
    });
  })();

  /* Add fixed width columns' widths */
  let widthFixedColumns_sum = 0;
  (function() {
    $(target).find('thead th[data-smartcol-fixed]').each(function() {

      //get the index of this fixed column:
      let thisColumn_index = $(this).index();

      //add a span around this column's content in tbody, so we can measure their width (note we can't just measure the cell width, because the browser naturally varies how wide the cell is based on the rest of the table's content):
      $(target).find('tbody tr').each(function() {
        $(this).find('td').eq(thisColumn_index).wrapInner('<span data-smartcol-fixed-wrap></span>');
      });

      //measure the padding and width, calculate the fixed width and apply it:
      let thisColumnContent_width = parseFloat( $(target).find('tbody tr:first-child td').eq(thisColumn_index).find('span[data-smartcol-fixed-wrap]').width() );
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
      //dynamically change the width of the fixed columns as the window changes width.
      let thisWidth_percent = ((100 / widthContainer) * thisWidth_px) + '%';
      $(this).css('width',thisWidth_percent);
      });
  }
  updateFixedColumnWidths(target,o);
  $(window).resize( function() {
    updateFixedColumnWidths(target,o);
  });


  function stretchColumns(target,o) {
    let stretchBaseWidth = sizeUnitConvert(o.columnWidthWide);
    let counter = 0;
    let sum = 0;

    $(target).find('thead th[data-smartcol-size="stretch"]').each(function() {
      if ( $(this).is(':visible') ) {
        sum += $(this).width();
        counter ++;
      }
    });
    widthStretch = sum / counter;

    if (widthStretch >= stretchBaseWidth) {
      $(target).find('thead th[data-smartcol-size="stretch"]').css('width','auto');
    }
    else {
      $(target).find('thead th[data-smartcol-size="stretch"]').css('width',stretchBaseWidth);
    }
  }

  //  console.log(columnProperties);




  /* **********************************************************************************
  *************************************************************************************
  SELECTABLE COLUMN (setup and behaviours)
  *************************************************************************************
  ********************************************************************************** */

  let lastDataColumnIndex = $(target).find('thead th[data-smartcol]').last().index();
  let lastDataColumnNth = lastDataColumnIndex + 1;


  /* SELECTABLE COLUMN: SETUP */

  /* Build the selectable column */
  (function() {
    //create the select menu:

    let selectOptions = undefined;
    if (o.reEnableAuto === true) {
      selectOptions += '<option value="auto" >Auto*</option>';
    }
    $(target).find('thead th[data-smartcol]').each(function() {
      let thisCol = $(this).attr('data-smartcol');
      let t = $(this).text();
      selectOptions += '<option value="' + thisCol + '">' + t + '</option>\n';
    });

    //insert the new th in the thead for the selctable column:
    $(target).find('thead tr th:nth-child(' + lastDataColumnNth + ')').after('<th data-smartcol-selectable="auto"><div class="smartcol-select-container"><select aria-label="Choose the data for this column">\n' + selectOptions + '</select><div class="smart-col-select-label"></div></div>\n</th>\n');

    //insert a new td in every tbody row for the selctable column:
    $(target).find('tbody tr td:nth-child(' + lastDataColumnNth + ')').each( function() {
      $(this).after('<td></td>\n');
    });

    /* Add a change event to the select menu to check for user input */
    $(target).on('change','th[data-smartcol-selectable] select',function() {
      let thisValue = $(this).val();
      if (thisValue === 'auto') {
        $(this).closest('th[data-smartcol-selectable]').attr('data-smartcol-selectable','auto');
        //get the value of the column we need to auto select:
        sourceCol = $(target).find('th[data-smartcol]:hidden').first().attr('data-smartcol');
        //check the Auto option:
        if (o.reEnableAuto === true) {
          $(this).find('option[value="auto"]').html('Auto*');
        }
      }
      else {
        $(this).closest('th[data-smartcol-selectable]').attr('data-smartcol-selectable','');
        sourceCol = thisValue;
        //uncheck the auto option:
        if (o.reEnableAuto === true) {
          $(this).find('option[value="auto"]').html('Auto');
        }
      }

      //set the column data based on the selection:
      selectableColumn_set(target,sourceCol);
    });

  })();


  /* SELECTABLE COLUMN: SET */

  /* Sets the selectable column's data when we need to put data into it */
  function selectableColumn_set(target,sourceCol) {

    let selectTH = $(target).find('th[data-smartcol-selectable]');
    let sourceTH = $(target).find('th[data-smartcol="' + sourceCol + '"]');
    let selectIndex = selectTH.index();
    let sourceIndex = sourceTH.index();

    //change the select menu's selected option to the chosen one:
    $(selectTH).find('select option[value="' + sourceCol + '"]').prop('selected', true);
    let selectLabel = $(selectTH).find('select option[value="' + sourceCol + '"]').text();
    $(selectTH).find('.smart-col-select-label').text(selectLabel);

    //add the size and width properties to the selectable header cell
    $(selectTH).attr('data-smartcol-size',columnProperties[sourceCol].size);
    $(selectTH).css('width',columnProperties[sourceCol].width);

    //add styling attributes to the body table cells in the selectable column
    $(target).find('tbody tr').each(function() {
      let sourceTDdata = $(this).find('td').eq(sourceIndex).html();
      let selectTD = $(this).find('td').eq(selectIndex);

      //add the text align and column wrap
      selectTD.css('text-align',columnProperties[sourceCol].align);
      selectTD.removeClass('smartcol-overflow-normal smartcol-overflow-ellipsis smartcol-overflow-fade smartcol-overflow-wrap');
      selectTD.addClass('smartcol-overflow-' + columnProperties[sourceCol].overflow);

      selectTD.html(sourceTDdata);

      stretchColumns(target,o);

    });

    o.store_colSelected = sourceCol;

  }



  /* **********************************************************************************
  *************************************************************************************
  COLUMN HIDING
  *************************************************************************************
  ********************************************************************************** */

  /* Hides columns from right to left depending on the amout of available space, making sure the minimum width of columns is always honoured. Run at page load and on window resize */
  function hideDataColumns(target,o,lastDataColumnNth,widthFixedColumns_sum) {
    let widthContainer = $(target).closest('.smartcol-container').width();
    let widthTable = $(target).outerWidth();
    let firstHideableColumnNth = 1;
    let counter_visible = 1;
    let widthFirstColumn = 0;

    /* Work out how much space we have available */
    if (o.freezeFirstColumn === true) {
      firstHideableColumnNth = 2;
      let firstColumnSizeKeyword = $(target).find('thead th[data-smartcol]').first().attr('data-smartcol-size');
      let widthFirstColumn = sizeKeywordConvert(firstColumnSizeKeyword);
      widthFirstColumn = sizeUnitConvert(widthFirstColumn);
    }

    let widthFixedColumns = widthFirstColumn + o.store_widthWidestColumn + widthFixedColumns_sum;
    let widthAvailable = widthContainer - widthFixedColumns;
    let counter = 0;
    let sum = 0;
    let sum_visible = 0;

    /* loop through each column and see if we should be showing or hiding it */
    $(target).find('thead th[data-smartcol]').each( function() {

      /* clear and set variables */
      $(target).find('th[data-smartcol-size]').removeClass('smartcol-width-auto');
      let columnSize = $(this).attr('data-smartcol-size');
      let cellWidth = 0;
      let thisIndex = $(this).index();

      cellWidth = sizeKeywordConvert(columnSize);
      cellWidth = sizeUnitConvert(cellWidth);

      //add this columns reference cell width to the sum of columns evaluated so far"
      sum += cellWidth;

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

      //else this must be a column we can show:
      else {
        $(this).show();
        $(target).find('tbody tr').each( function() {
          $(this).find('td').eq(thisIndex).show();
        })
        sum_visible += cellWidth;
      }

      counter ++;
      counter_visible ++;

    });

    if ( $(target).find('thead th[data-smartcol-selectable]').attr('data-smartcol-selectable') === 'auto' ) {
      let firstHidden = $(target).find('thead th:hidden:first').attr('data-smartcol');
      selectableColumn_set(target,firstHidden);
    }

    //check if we've run out of space to show the columns at their natural widths and make them all auto if so
    if (widthAvailable < sum_visible) {
      $(target).find('thead th[data-smartcol]').each( function() {
        $(this).css('width','auto');
      });
      $(target).find('thead th[data-smartcol-selectable]').css('width','auto');
    } else {
      $(target).find('thead th[data-smartcol]').each( function() {
        let thisIndex = $(this).attr('data-smartcol');
        let thisSize = columnProperties[thisIndex].width;
        $(this).css('width',thisSize);
        stretchColumns(target,o);
      });
      let sourceCol = o.store_colSelected;
      let sourceWidth = columnProperties[sourceCol].width;
      $(target).find('thead th[data-smartcol-selectable]').css('width',sourceWidth);
    }

    o.store_widthTable = widthTable;
    o.store_widthContainer = widthContainer;
    o.store_widthAvailable = widthAvailable;

  }
  hideDataColumns(target,o,lastDataColumnNth,widthFixedColumns_sum);
  $(window).resize( function() {
    hideDataColumns(target,o,lastDataColumnNth,widthFixedColumns_sum);
  });


} //ends smartColumns initialisation