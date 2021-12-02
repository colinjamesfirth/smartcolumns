$(document).ready(function() {


  function smartTableBuilder(target) {
    /* Build the table header */
    (function() {
      var output = '<thead>\n<tr>';
      table_columns.forEach( function(th) {
        var isWrap = '';
        if (th[2] == true) {
          isWrap = ' data-display-wrap';
        }
        var isCenter = '';
        if (th[3] == true) {
          isWrap = ' data-display-center';
        }
          output += '<th data-column-size="' + th[1] + '"' + isWrap + isCenter + '>' + th[0] + '</th>\n';
      });
      output += '</tr>\n</thead>\n';
      $(target).append(output);
    })();

    /* Build the table body */
    (function() {
      var row_counter = 0;
      var output = '<tbody>\n';
      table_rows.forEach( function(r) {
        output += '<tr data-table-row="' + row_counter + '">';
        col1_data = r[0];
        var col_counter = 0;
        r.forEach( function(td) {
          var isWrap = '';
          if (table_columns[col_counter][2] == true) {
            isWrap = ' data-display-wrap';
          }
          var isCenter = '';
          if (table_columns[col_counter][3] == true) {
            isWrap = ' data-display-center';
          }
          output += '<td' + isWrap + isCenter + '>' + td + '</td>\n';
          col_counter ++;
        });
        output += '</tr>'
        row_counter ++;
      });
      output += '</tbody>\n';
      $(target).append(output);
    })();

    /* Build the actions column */
    /* Sets the width of the column based on how wide the contents are, giving it a width appropriate to the number of buttons being shown for this particular table */
    (function() {
      $(target).find('thead tr').append('<th class="actions-column" aria-label="Actions"></th>\n');
      $(target).find('tbody tr').each( function() {
        var col1_data = $(this).find('td:first-child').text();
        var output = '<td class="actions-column"><span>';
        output += '<button data-open-button aria-label="Open record for ' + col1_data + '">Open</button>';
        //output += '<button data-edit-button aria-label="Edit record for ' + col1_data + '">Edit</button>';
        //output += '<button data-delete-button aria-label="Delete record for ' + col1_data + '">Delete</button>';
        output += '</span></td>\n';
        $(this).append(output);
      });
    })();

  }
  smartTableBuilder('table#data');



  function smartTable(target,options) {
    let optionDefaults = {
      cellXPadding: 0.75, //rem
      baseRemPX: parseFloat(getComputedStyle(document.documentElement).fontSize),
      columnWidthNarrow: 5, //rem
      columnWidthNormal: 10, //rem
      columnWidthWide: 15, //rem
      ignoreFirstColumn: true,
      ignoreLastColumn: true
    }
    o = { ...optionDefaults, ...(options || {}) };

    /* Build the selectable column */
    (function() {
      $(target).find('thead tr th.actions-column').before('<th data-column-selectable></th>\n');

      var firstHidden = $(target).find("thead th:hidden:first").index();
      options = '';
      table_columns.forEach( function(th,i) {
        options += '<option value="' + i + '">' + th[0] + '</option>\n';
      });
      $(target).find('tbody tr td.actions-column').each( function() {
        $(this).before('<td></td>\n');
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

    /* Wrap the target table in a block level div so we can measure the width of the containing space (also used for CSS selectors) */
    $(target).wrap('<div class="table-container"></div>');


    actionsWidth = $(target).find('tbody tr:first-child .actions-column > span').width();
    actionsWidth = actionsWidth + ((o.cellXPadding * o.baseRemPX) * 2);
    $(target).find('thead .actions-column').css('width',actionsWidth).attr('data-actions-col-width',actionsWidth);

    /* Hides columns from right to left depending on the amout of available space, making sure the minimum width of columns is always honoured. Run at page load and on window resize */
    function hideDataColumns(target,baseRemPX) {
      widthTable = $(target).outerWidth();
      widthContainer = $(target).closest('.table-container').outerWidth();

      widthFirstColumn = table_columns[0][1];
      if (widthFirstColumn == 'auto') {
        widthFirstColumn = (o.columnWidthNormal * baseRemPX) + 1;
      }
      else if (widthFirstColumn == 'narrow') {
        widthFirstColumn = (o.columnWidthNarrow * baseRemPX) + 1;
      }
      else if (widthFirstColumn == 'normal') {
        widthFirstColumn = (o.columnWidthNormal * baseRemPX) + 1;
      }
      else if (widthFirstColumn == 'wide') {
        widthFirstColumn = (o.columnWidthWide * baseRemPX) + 1;
      }

      var widestColumn = null;
      if ( $(target).find('thead th[data-column-size="wide"]').length ) {
        widestColumn = (o.columnWidthWide * baseRemPX) + 1;
      }
      else if ( $(target).find('thead th[data-column-size="normal"]').length ) {
        widestColumn = (o.columnWidthNormal * baseRemPX) + 1;
      }
      else if ( $(target).find('thead th[data-column-size="narrow"]').length ) {
        widestColumn = (o.columnWidthNarrow * baseRemPX) + 1;
      }
      else if ( $(target).find('thead th[data-column-size="auto"]').length ) {
        widestColumn = (o.columnWidthNormal * baseRemPX) + 1;
      }

      widthActionsColumn = actionsWidth;
      widthTableAvailable = widthContainer - (widthFirstColumn + widestColumn + widthActionsColumn);
      var counter = 1;
      var sum = 0;

      $(target).find('thead th:not(:first-child):not(:nth-last-of-type(-n+2))').each( function() {
        columnSize = $(this).attr('data-column-size');
        if (columnSize == 'auto') {
          cellWidth = (o.columnWidthNormal * baseRemPX) + 1;
        }
        else if (columnSize == 'narrow') {
          cellWidth = (o.columnWidthNarrow * baseRemPX) + 1;
        }
        else if (columnSize == 'normal') {
          cellWidth = (o.columnWidthNormal * baseRemPX) + 1;
        }
        else if (columnSize == 'wide') {
          cellWidth = (o.columnWidthWide * baseRemPX) + 1;
        }

        sum += cellWidth;
        if (sum > widthTableAvailable) {
          $(this).hide();
          $(target).find('tbody tr').each( function() {
            $(this).find('td').eq(counter).hide();
          })
        } else if ( $(this).is(':nth-last-of-type(3)') ) {
          $(this).hide();
          $(target).find('tbody tr').each( function() {
            $(this).find('td').eq(counter).hide();
          })
        }
        else {
          $(this).show();
          $(target).find('tbody tr').each( function() {
            $(this).find('td').eq(counter).show();
          })
        }
        counter ++;
      });
    }
    hideDataColumns(target,o.baseRemPX);
    $(window).resize( function() {
      hideDataColumns(target,o.baseRemPX);
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

  } //ends smartTable initialisation

  smartTable('table#data',{
    foo: 'bah'
  });










  /* ADDITIONAL FEATURES: Selecting the whole row; button clicks

  /* On click event for the open button in the actions column (if we have one) */

  /*  $('table#data tr[data-row-clickable] td:not(:last-child), table#data button[data-open-button]').on('click',function() {
    var dataIndex = $(this).closest('tr[data-row-clickable]').attr('data-table-row');
    var dataCol1Value = table_rows[dataIndex][0];
    alert('open: ' + dataCol1Value);
  });
  */

  /* On click event for the edit button in the actions column (if we have one) */
  /* $('table#data button[data-edit-button]').on('click',function() {
    var dataIndex = $(this).closest('tr[data-row-clickable]').attr('data-table-row');
    var dataCol1Value = table_rows[dataIndex][0];
    alert('edit: ' + dataCol1Value);
  });
  */


  // end doc ready
});

