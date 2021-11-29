$(document).ready(function() {

  var baseRemPX = 14; //px
  var cellXPadding = 0.74; //rem
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


  var table_header = [
    ['Name',2],
    ['Gender',2],
    ['Hair',2],
    ['Eyes',2],
    ['Age',1],
    ['Status',2],
    ['Town',2],
    ['Home',2],
    ['Job',2],
    ['Narrative',3]
  ];
  var table_data = [
    ['Martin','Male','Blonde','Blue','24','Single','Bolton','Terrace','Builder','An amazing worker with brevity that would impress a lion'],
    ['Julie','Female','Brown','Green','62','Married','Wigan','Detached','Accountant','If she can\'t add it, it\'s not worth adding'],
    ['Rey','Non-binary','Silver','Blue','42','Single','Leigh','Flat','Driver','A nicer person you couldn\'t wish to meet'],
    ['Jennifer','Female','Black','Brown','31','Civil Partnership','Huddersfield','Semi','Dentist','The best tooth MOT in Huddersfield']
  ];

  var counter = 0;
  var table = '';

  function makeTableHeader(target) {
    output = '<thead>\n<tr>';
    table_header.forEach( function(th) {
        output += '<th data-column-size="' + th[1] + '">' + th[0] + '</th>\n';
    });
    output += '<th data-column-selectable>\n</th>\n<th>Open</th>\n';
    output += '</tr>\n</thead>\n';
    $(target).append(output);
  }
  makeTableHeader('table#data');

  function makeTableBody(target) {
    var output = '<tbody>\n';
    table_data.forEach( function(r) {
      output += '<tr data-row-clickable data-table-row="' + counter + '">';
      col1_data = r[0];
      r.forEach( function(td) {
        output += '<td>' + td + '</td>\n';
      });
      output += '<td></td>\n<td><button data-open-button aria-label="Open record for ' + col1_data + '">Open</button></td>\n';
      output += '</tr>'
      counter ++;
    });
    output += '</tbody>\n';
    $(target).append(output);
  }
  makeTableBody('table#data');

  function hideDataColumns() {
    widthTable = $('table#data').outerWidth();
    widthContainer = $('table#data').closest('.table-container').outerWidth();
    widthLastColumn = $('table#data thead th:nth-last-of-type(1)').outerWidth();
    widthSelectColumn = $('table#data thead th:nth-last-of-type(2)').outerWidth();
    widthTableAvailable = widthContainer - (widthSelectColumn + widthLastColumn);
    var counter = 0;
    var sum = 0;

    $('table#data thead th:not(:nth-last-of-type(-n+2))').each( function() {
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
      cell_data = table_data[counter][data_column];
      $(this).find('td:nth-of-type(' + (select_column_index + 1) + ')').text(cell_data);
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
    table_header.forEach( function(th,i) {
      options += '<option value="' + i + '">' + th[0] + '</option>\n';
    });
    var column_select = '<select data-column-selected="auto" aria-label="Choose the data for this column">\n' + options + '</select>\n';
    $('table#data th[data-column-selectable]').html(column_select);
  }

  hideDataColumns();
  makeColumnSelect();
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
    var dataCol1Value = table_data[dataIndex][0];
    alert('open: ' + dataCol1Value);
  });
  $('table#data button[data-edit-button]').on('click',function() {
    var dataIndex = $(this).closest('tr[data-row-clickable]').attr('data-table-row');
    var dataCol1Value = table_data[dataIndex][0];
    alert('edit: ' + dataCol1Value);
  });

  // end doc ready
});