$(document).ready(function() {

  var baseRemPX = 14; //px
  var cellXPadding = 0.75; //rem
  var responsiveTableBreakpointSmallTable = 40; //rem;

  var table_column_widths = [
    //[sizeIndex, Xrem],
    ['0','0'],
    ['1','3'],
    ['2','10'],
    ['3','15']
  ];

  $('tr[data-row-clickable]').on('click',function() {
    row_name = $(this).attr('data-row-clickable');
    alert('opened ' + row_name);
  });


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
  var table_rows = [
    ['Martin','martin.brown@mycompany.com','Male','Blonde','Blue','24','Single','Bolton','Builder','An amazing worker with brevity that would impress a lion'],
    ['Julie','julie.burshendasser@mycompany.com','Female','Brown','Green','62','Married','Wigan','Accountant','If she can\'t add it, it\'s not worth adding'],
    ['Rey','rey.bassy-carrington-jones@mycompany.com','Non-binary','Silver','Blue','42','Single','Leigh','Driver','A nicer person you couldn\'t wish to meet (thisisareallylongwordjustfortesting)'],
    ['Jennifer','jennifer.sundance@mycompany.com','Female','Black','Brown','31','Civil Partnership','Huddersfield','Dentist','The best tooth MOT in Huddersfield']
  ];

  var table = '';

  function makeTableHeader(target) {
    output = '<thead>\n<tr>';
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
    output += '<th data-column-selectable data-column-size="2">\n</th>\n<th class="actions-column">Actions</th>\n';
    output += '</tr>\n</thead>\n';
    $(target).append(output);
  }
  makeTableHeader('table#data');

  function makeTableBody(target) {
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
  }
  makeTableBody('table#data');

  function makeActionsColumn(target) {
    col1_data = 'chips';
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
  }

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

  function clearColumnData() {
    select_column_index = $('th[data-column-selectable]').index();
    $('select[data-column-selected] option[data-choose]').prop('selected', true);
    $('table#data tbody tr').each(function() {
      $(this).find('td:nth-of-type(' + (select_column_index + 1) + ')').empty();
    });
  }

  function setColumnData(data_column) {
    select_column_index = $('th[data-column-selectable]').index();
    counter = 0;
    if (data_column == 'auto') {
      clearColumnData();
    }
    $('select[data-column-selected] option[value="' + data_column + '"]').prop('selected', true);
    $('table#data tbody tr').each(function() {
      targetTD = $(this).find('td:nth-of-type(' + (select_column_index + 1) + ')');
      cell_data = table_rows[counter][data_column];
      targetTD.text(cell_data);
      targetTD.removeAttr('data-column-wrap');
      if (table_columns[data_column][2] == true) {
        targetTD.attr('data-display-wrap','');
      }
      counter ++;
    });
  }

  function autoColumn() {
    var data = $('select[data-column-selected]').attr('data-column-selected');
    $('select[data-column-selected] option[data-choose]').remove();
    if ( data == 'auto') {
      if ( $('table#data thead th:nth-child(2)').is(":hidden") ) {
        setColumnData(1);
      } else {
        clearColumnData();
        $('select[data-column-selected]').prepend('<option data-choose value="auto" aria-label="Choose the data for this column" selected>Choose</option>\n');
      }
    }
  }

  function makeColumnSelect() {
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
  }

  makeColumnSelect();
  makeActionsColumn();
  hideDataColumns();
  autoColumn();

  $(window).resize( function() {
    hideDataColumns();
    autoColumn();
  });


  $('table#data').on('change','select[data-column-selected]',function() {
    var data_column = $(this).val();
    $(this).attr('data-column-selected',data_column);
    setColumnData(data_column);
    $('select[data-column-selected]').find('option[data-choose]').remove();
  });

  $('table#data td:not(:last-child), table#data button[data-open-button]').on('click',function() {
    var dataIndex = $(this).closest('tr[data-row-clickable]').attr('data-table-row');
    var dataCol1Value = table_rows[dataIndex][0];
    alert('open: ' + dataCol1Value);
  });
  $('table#data button[data-edit-button]').on('click',function() {
    var dataIndex = $(this).closest('tr[data-row-clickable]').attr('data-table-row');
    var dataCol1Value = table_rows[dataIndex][0];
    alert('edit: ' + dataCol1Value);
  });

  // end doc ready
});