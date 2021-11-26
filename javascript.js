$(document).ready(function() {

  $('tr[data-row-clickable]').on('click',function() {
    row_name = $(this).attr('data-row-clickable');
    alert('opened ' + row_name);
  });

  var table_data = [
    ['Name','Gender','Hair','Eyes','Status','Town','Home','Job','Narative'],
    ['Martin','Male','Blonde','Blue','Single','Bolton','Terrace','Builder','An amazing worker with brevity that would impress a lion'],
    ['Julie','Female','Brown','Green','Married','Wigan','Detached','Accountant','If she can\'t add it, it\'s not worth adding'],
    ['Rey','Non-binary','Silver','Blue','Single','Leigh','Flat','Driver','A nicer person you couldn\'t wish to meet'],
    ['Jennifer','Female','Black','Brown','Civil Partnership','Huddersfield','Semi','Dentist','The best tooth MOT in Huddersfield']
  ];

  var counter = 0;
  var table = '';

  // make the table
  table_data.forEach( function(r) {
    if (counter == 0) {
      output = '<tr>';
      r.forEach( function(th) {
        output += '<th>' + th + '</th>\n';
      });
      output += '<th data-column-selectable>\n</th>\n<th>Open</th>\n';
      $('table#data thead').append(output);
    } else {
      output = '<tr data-row-clickable data-table-row="' + counter + '">';
      col1_data = r[0];
      r.forEach( function(td) {
        output += '<td>' + td + '</td>\n';
      });
      output += '<td></td>\n<td><button data-open-button aria-label="Open record for ' + col1_data + '">Open</button></td>\n';
      $('table#data tbody').append(output);
    }
    counter ++;
  });


  function clearColumnData() {
    select_column_index = $('th[data-column-selectable]').index();
    $('table#data tbody tr').each(function() {
      $(this).find('td:nth-of-type(' + (select_column_index + 1) + ')').empty();
    });
  }

  function setColumnData(data_column) {
    select_column_index = $('th[data-column-selectable]').index();
    counter = 1;
    $('select[data-column-selected]').find('option[data-choose]').remove();
    $('table#data tbody tr').each(function() {
      cell_data = table_data[counter][data_column];
      $(this).find('td:nth-of-type(' + (select_column_index + 1) + ')').text(cell_data);
      counter ++;
    });
  }

  function refreshColumnSelect() {
    if ( $('select[data-column-selected]').length ) {
      var selected = $('select[data-column-selected]').attr('data-column-selected');
    } else {
      var selected = 'auto';
    }
    if (selected == 'auto') {
      var firstHidden = $("table#data thead th:hidden:first").index();
      options = '';
      if (firstHidden == -1) {
        options +='<option data-choose aria-label="Choose the data for this column">Choose</option>\n';
        clearColumnData();
      }
      table_data[0].forEach( function(th,i) {
        var selected = '';
        if (firstHidden == i) {
          selected = ' selected';
          setColumnData(i);
        }
        options += '<option value="' + i + '"' + selected + '>' + th + '</option>\n';
      });
      var column_select = '<select data-column-selected="auto" aria-label="Choose the data for this column">\n' + options + '</select>\n';
      $('table#data th[data-column-selectable]').html(column_select);
    }
  }
  refreshColumnSelect();
  $(window).resize( function() {
    refreshColumnSelect();
  });


  $('table#data').on('change','select[data-column-selected]',function() {
    var data_column = $(this).val();
    $(this).attr('data-column-selected',data_column);
    setColumnData(data_column);
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