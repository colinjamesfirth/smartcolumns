
  function smartColumnsBuilder(target,options) {


    let optionDefaults = {
      makeActionsColumn: true
    }
    o = { ...optionDefaults, ...(options || {}) };


    /* Build the table header */
    (function() {
      var col_counter = 1;
      var output = '<thead>\n<tr>';
      table_columns.forEach( function(th) {
        var isWrap = '';
        if (th[2] == true) {
          isWrap = ' data-smartcol-wrap';
        }
        var isCenter = '';
        if (th[3] == true) {
          isWrap = ' data-smartcol-center';
        }
        output += '<th data-smartcol-index="' + col_counter + '" data-smartcol-width="' + th[1] + '"' + isWrap + isCenter + '>' + th[0] + '</th>\n';
        col_counter ++;
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
            isWrap = ' data-smartcol-wrap';
          }
          var isCenter = '';
          if (table_columns[col_counter][3] == true) {
            isWrap = ' data-smartcol-center';
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
    if (o.makeActionsColumn == true) {
      (function() {
        $(target).find('thead tr').append('<th data-smartcol-actions aria-label="Actions"></th>\n');
        $(target).find('tbody tr').each( function() {
          var col1_data = $(this).find('td:first-child').text();
          var output = '<td class="actions">';
          output += '<button data-open-button aria-label="Open record for ' + col1_data + '">Open</button>';
          output += '<button data-edit-button aria-label="Edit record for ' + col1_data + '">Edit</button>';
          //output += '<button data-delete-button aria-label="Delete record for ' + col1_data + '">Delete</button>';
          output += '</td>\n';
          $(this).append(output);
        });
      })();
    }
  }





  $(document).ready(function() {


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



}); // end doc ready