$(document).ready(function() {

  var target = 'table#data';

  /* Set some basic styling variables, reflecting what's in the stylesheet */
  var baseRemPX = 14; //px
  var cellXPadding = 0.75; //rem

  /* Set the different basic column widths for the column hiding calculations, reflecting what's in the stylesheet */
  var table_column_widths = [
    //[sizeIndex, Xrem],
    ['0','0'],
    ['1','3'],
    ['2','10'],
    ['3','15']
  ];

  /* Set the column characteristics */
  var table_columns = [
    //ColumnName,ColumnWidthIndex,DataWrap,DataCenter
    ['Name',2,false,false],
    ['Email',3,true,false],
    ['Gender',2,false,false],
    ['Hair',2,false,false],
    ['Eyes',2,false,false],
    ['Age',1,false,true],
    ['Status',2,false,false],
    ['Town',2,false,false],
    ['Job',2,false,false],
    ['Narrative',3,true,false]
  ];

  /* Define the row data */
  var table_rows = [
    ['Martin','martin.brown@mycompany.com','Male','Blonde','Blue','24','Single','Bolton','Builder','An amazing worker with brevity that would impress a lion'],
    ['Julie','julie.burshendasser@mycompany.com','Female','Brown','Green','62','Married','Wigan','Accountant','If she can\'t add it, it\'s not worth adding'],
    ['Rey','rey.bassy-carrington-jones@mycompany.com','Non-binary','Silver','Blue','42','Single','Leigh','Driver','A nicer person you couldn\'t wish to meet (thisisareallylongwordjustfortesting)'],
    ['Jennifer','jennifer.sundance@mycompany.com','Female','Black','Brown','31','Civil Partnership','Huddersfield','Dentist','The best tooth MOT in Huddersfield']
  ];

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
    $(target).find('thead tr').append('<th data-column-selectable data-column-size="3"></th>\n');
    var firstHidden = $("table#data thead th:hidden:first").index();
    options = '';
    table_columns.forEach( function(th,i) {
      options += '<option value="' + i + '">' + th[0] + '</option>\n';
    });
    $('table#data tbody tr').each( function() {
      $(this).append('<td></td>\n');
    });
    var column_select = '<select data-column-selected="auto" aria-label="Choose the data for this column">\n' + options + '</select>\n';
    $('table#data th[data-column-selectable]').html(column_select);
  })();

  /* Build the actions column */
  /* Sets the width of the column based on how wide the contents are, giving it a width appropriate to the number of buttons being shown for this particular table */
  (function() {
    $(target).find('thead tr').append('<th class="actions-column">Actions</th>\n');

    var col1_data = 'chips';
    var output = '<td class="actions-column"><span>';
    output += '<button data-open-button aria-label="Open record for ' + col1_data + '">Open</button>';
    //output += '<button data-edit-button aria-label="Edit record for ' + col1_data + '">Edit</button>';
    //output += '<button data-delete-button aria-label="Delete record for ' + col1_data + '">Delete</button>';
    output += '</span></td>\n';

    $('table#data tbody tr').each( function() {
      $(this).append(output);
    });

    var actionsWidth = $('table#data tbody tr:first-child .actions-column > span').width();
    actionsWidth = actionsWidth + ((cellXPadding * baseRemPX) * 2);
    $('table#data thead .actions-column').css('width',actionsWidth).attr('data-actions-col-width',actionsWidth);
  })();

  /* Hides columns from right to left depending on the amout of available space, making sure the minimum width of columns is always honoured. Run at page load and on window resize */
  function hideDataColumns() {
    widthTable = $('table#data').outerWidth();
    widthContainer = $('table#data').closest('.table-container').outerWidth();
    widthSelectColumn = $('table#data th[data-column-selectable]').attr('data-column-size');
    widthSelectColumn = table_column_widths[widthSelectColumn][1];
    widthSelectColumn = (widthSelectColumn * baseRemPX) + 1;
    widthActionsColumn = 188;
    widthTableAvailable = widthContainer - (widthSelectColumn + widthActionsColumn);
    var counter = 1;
    var sum = 0;

    $('table#data thead th:not(:first-child):not(:nth-last-of-type(-n+2))').each( function() {
      cellWidth = $(this).attr('data-column-size');
      cellWidth = table_column_widths[cellWidth][1];
      cellWidth = (cellWidth * baseRemPX) + 1;
      sum += cellWidth;
      if (sum > widthTableAvailable) {
        $(this).hide();
        $('table#data tbody tr').each( function() {
          $(this).find('td').eq(counter).hide();
        })
      }
      else {
        $(this).show();
        $('table#data tbody tr').each( function() {
          $(this).find('td').eq(counter).show();
        })
      }
      counter ++;
    });
  }
  hideDataColumns();
  $(window).resize( function() {
    hideDataColumns();
  });

  /* Automatically set the selectable column */
  /* If all columns (exclusing the first) are hidden then show the first hidden column's data instead of a blank column; then make it blank again if the window size increases and more columns can show. But, if the user selects data for the selectable column, then that selection persists. Run at page load and on window resize */
  function selectableColumn_auto() {
    var data = $('select[data-column-selected]').attr('data-column-selected');
    $('select[data-column-selected] option[data-choose]').remove();
    if ( data == 'auto') {
      if ( $('table#data thead th:nth-last-child(3)').is(":visible") ) {
        selectableColumn_clear();
        $('select[data-column-selected]').prepend('<option data-choose value="auto" aria-label="Choose the data for this column" selected>Choose...</option>\n');
      } else {
        var firstHidden = $('table#data thead th:hidden:first').index();
        selectableColumn_set(firstHidden);
      }
    }
  }
  selectableColumn_auto();
  $(window).resize( function() {
    selectableColumn_auto();
  });

  /* Clear the selectable column if we need to */
  function selectableColumn_clear() {
    select_column_index = $('th[data-column-selectable]').index();
    $('select[data-column-selected] option[data-choose]').prop('selected', true);
    $('table#data tbody tr').each(function() {
      $(this).find('td:nth-of-type(' + (select_column_index + 1) + ')').empty();
    });
  }

  /* Sets the selectable column's data when we need to put data into it */
  function selectableColumn_set(data_column) {
    select_column_index = $('th[data-column-selectable]').index();
    counter = 0;
    if (data_column == 'auto') {
      selectableColumn_clear();
    }
    $('select[data-column-selected] option[value="' + data_column + '"]').prop('selected', true);
        $('table#data tbody tr').each(function() {
      targetTD = $(this).find('td:nth-of-type(' + (select_column_index + 1) + ')');
      cell_data = table_rows[counter][data_column];
      targetTD.removeAttr('data-column-wrap');
      if (table_columns[data_column][2] == true) {
        targetTD.attr('data-display-wrap','');
      }
      targetTD.text(cell_data);
      counter ++;
    });
  }

  /* When user manually selects data for the selectable column... */
  $('table#data').on('change','select[data-column-selected]',function() {
    var data_column = $(this).val();
    $(this).attr('data-column-selected',data_column);
    selectableColumn_set(data_column);
    $('select[data-column-selected]').find('option[data-choose]').remove();
  });

  /* Makes the whole row clickable */
  $('tr[data-row-clickable]').on('click',function() {
    row_name = $(this).attr('data-row-clickable');
    alert('opened ' + row_name); //replace with something proper
  });

  /* On click event for the open button in the actions column (if we have one) */
  $('table#data td:not(:last-child), table#data button[data-open-button]').on('click',function() {
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