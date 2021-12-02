$(document).ready(function() {

//  var target = 'table#data';

  /* Set some basic styling variables, reflecting what's in the stylesheet */
  var cellXPadding = 0.76; //rem

  /* Set the different basic column widths for the column hiding calculations, reflecting what's in the stylesheet */
  var table_column_widths = [
    //[sizeIndex, Xrem],
    ['0','0'],
    ['1','5'],
    ['2','10'],
    ['3','15']
  ];

  w = [];
  table_columns.forEach(function(i) {
    w.push(i[1]);
  });
  const widestColumn = Math.max(...[].concat(...w));

  function smartTable(target,options) {
    let optionDefaults = {
      cellXPadding: 0.75, //rem
      baseRemPX: parseFloat(getComputedStyle(document.documentElement).fontSize)
    }
    o = { ...optionDefaults, ...(options || {}) };


    $(target).wrap('<div class="table-container"></div>');


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
        output += '<tr data-row-clickable data-table-row="' + row_counter + '">';
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

    /* Build the selectable column */
    (function() {
      $(target).find('thead tr').append('<th data-column-selectable data-column-size="' + widestColumn + '"></th>\n');
      var firstHidden = $(target).find("thead th:hidden:first").index();
      options = '';
      table_columns.forEach( function(th,i) {
        options += '<option value="' + i + '">' + th[0] + '</option>\n';
      });
      $(target).find('tbody tr').each( function() {
        $(this).append('<td></td>\n');
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

      actionsWidth = $(target).find('tbody tr:first-child .actions-column > span').width();
      actionsWidth = actionsWidth + ((o.cellXPadding * o.baseRemPX) * 2);
      $(target).find('thead .actions-column').css('width',actionsWidth).attr('data-actions-col-width',actionsWidth);
    })();

    /* Hides columns from right to left depending on the amout of available space, making sure the minimum width of columns is always honoured. Run at page load and on window resize */
    function hideDataColumns(target,baseRemPX) {
      widthTable = $(target).outerWidth();
      widthContainer = $(target).closest('.table-container').outerWidth();
      widthFirstColumn = table_columns[0][1];
      widthFirstColumn = table_column_widths[widthFirstColumn][1] * baseRemPX + 1;
      widthSelectColumn = (table_column_widths[widestColumn][1] * baseRemPX) + 1;
      widthActionsColumn = actionsWidth;
      widthTableAvailable = widthContainer - (widthFirstColumn + widthSelectColumn + widthActionsColumn);
      var counter = 1;
      var sum = 0;

      $(target).find('thead th:not(:first-child):not(:nth-last-of-type(-n+2))').each( function() {
        columnSize = $(this).attr('data-column-size');
        columnWidth = table_column_widths[columnSize][1];
        cellWidth = (columnWidth * baseRemPX) + 1;
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
  $('table#data tr[data-row-clickable] td:not(:last-child), table#data button[data-open-button]').on('click',function() {
    var dataIndex = $(this).closest('tr[data-row-clickable]').attr('data-table-row');
    var dataCol1Value = table_rows[dataIndex][0];
    alert('open: ' + dataCol1Value);
  });

  /* On click event for the edit button in the actions column (if we have one) */
  $('table#data button[data-edit-button]').on('click',function() {
    var dataIndex = $(this).closest('tr[data-row-clickable]').attr('data-table-row');
    var dataCol1Value = table_rows[dataIndex][0];
    alert('edit: ' + dataCol1Value);
  });


  // end doc ready
});

