const mmDataTable = new DataTable('#mmDataTable', {
    data: [],
    columns: [
        {
            data: null,
            orderable: false,
            render: DataTable.render.select(),
        },
        {
            data: 'id'
        },
        {
            data: 'timestamp',
            render: function(data, type, row) {
                if (type === 'display') {
                  return new Date(data * 1000).toLocaleString();
                }
                return data;
              }
          },
        {
            data: 'menu',
            render: function(data, type, row) {
              if (type === 'display') {
                return codeTables.menus[data] || data;
              }
              return data;
            }
        },
        {
            data: 'mode',
            render: function(data, type, row) {
              if (type === 'display') {
                return codeTables.modes[data] || data;
              }
              return data;
            }
        },
        {
            data: 'mmCode'
        },
        {
            data: 'mmCode',
            render: function(data, type, row) {
              if (type === 'display') {
                return codeTables.codes[data] || data;
              }
              return data;
            }
        },
    ],
    info: false,
    paging: false,
    scrollCollapse: true,
    scrollX: true,
    scrollY: 300,
    searching: false,
    select: {
        style: 'multi',
        selector: 'td:first-child'
    }
});

const mmSummaryTable = new DataTable('#mmSummaryTable', {
    data: [],
    columns: [
        {
            data: null,
            orderable: false,
            render: DataTable.render.select(),
        },
        {
            data: 'id'
        },
        {
            data: 'mmCode'
        },
        {
            data: 'mmCode',
            render: function(data, type, row) {
              if (type === 'display') {
                return codeTables.codes[data] || data;
              }
              return data;
            }
        },
        {
            data: 'count',
        },
    ],
    info: false,
    order: [[1, 'asc']],
    paging: false,
    scrollCollapse: true,
    scrollX: true,
    scrollY: 300,
    searching: false,
    select: {
        style: 'multi',
        selector: 'td:first-child'
    }
});

function loadData() {
    mmDataTable.clear().rows.add(deviceDataItems).draw();

    const mmCodeCountMap = {}
    for (const item of deviceDataItems) {
        const curVal = mmCodeCountMap[item.mmCode];
        mmCodeCountMap[item.mmCode] = curVal === undefined ? 1 : curVal + 1;
    }
    const summary = Object.entries(mmCodeCountMap).sort((a, b) => b[1] - a[1])
        .map(([mmCode, count], index) => {
            return {
                id: index + 1,
                mmCode,
                count,
            }
        });
    mmSummaryTable.clear().rows.add(summary).draw();
}

loadData();
