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

function setupFilteringMmDataForm(codeTables, dataItems) {
    const menuSelect = document.querySelector('select[name="menu"]')
    Object.entries(codeTables.menus).forEach(([val, name]) => {
        const opt = document.createElement('option');
        opt.textContent = name;
        opt.value = val;
        menuSelect.appendChild(opt);
    });

    const modeSelect = document.querySelector('select[name="mode"]')
    Object.entries(codeTables.modes).forEach(([val, name]) => {
        const opt = document.createElement('option');
        opt.textContent = name;
        opt.value = val;
        modeSelect.appendChild(opt);
    });

    const periodRadios = document.querySelectorAll('input[name="period"]');
    const rangeStartDate = document.querySelector('input[name="rangeStartDate"]');
    const rangeEndDate = document.querySelector('input[name="rangeEndDate"]');

    const startDate = new Date(dataItems[0].timestamp * 1000).toLocaleDateString('sv-SE');
    const endDate = new Date(dataItems.at(-1).timestamp * 1000).toLocaleDateString('sv-SE');

    rangeStartDate.min = rangeEndDate.min = startDate;
    rangeStartDate.max = rangeEndDate.max = endDate;
    rangeStartDate.value = startDate;
    rangeEndDate.value = endDate;

    const updateDateFieldsState = () => {
        const selectedValue = document.querySelector('input[name="period"]:checked')?.value;
        const isRangeSelected = selectedValue === 'range';

        rangeStartDate.disabled = !isRangeSelected;
        rangeEndDate.disabled = !isRangeSelected;
    
        [rangeStartDate, rangeEndDate].forEach(input => {
            input.parentElement.classList.toggle('disabled', !isRangeSelected);
        });
    }

    periodRadios.forEach(radio => {
        radio.addEventListener('change', updateDateFieldsState);
    });

    // 測定データ絞り込みボタンの処理
    document.getElementById('filterForm').onsubmit = () => {
        const form = document.getElementById('filterForm');
        if (form.reportValidity()) {
            if (form.menu.value === 'all' && form.mode.value === 'all' && form.period.value === 'all') {
                loadData(dataItems);
            } else {
                const minTs = new Date(form.rangeStartDate.value + 'T00:00:00').getTime() / 1000;
                const maxTs = new Date(form.rangeEndDate.value + 'T23:59:59').getTime() / 1000;
                const latestCnt = form.mode.value === 0 ? 20 : 80;

                const results = dataItems.filter((item, idx) => {
                    if (form.menu.value != 'all') {
                        if (item.menu !== Number(form.menu.value)) return false;
                    }
                    if (form.mode.value != 'all') {
                        if (item.mode !== Number(form.mode.value)) return false;
                    }
                    if (form.period.value === 'range') {
                        if (item.timestamp < minTs) return false;
                        if (item.timestamp > maxTs) return false;
                    } else if (form.period.value === 'latest') {
                        if (idx >= latestCnt) return false;
                    }
                    return true;
                });
                loadData(results);
            }
        }
        return false;
    };

    updateDateFieldsState(); // 初期化処理
}

function loadData(dataItems) {
    const mmDataItems = dataItems
        .filter(item => item.mmCode !== undefined)
        .sort((a, b) => {
            return b.timestamp - a.timestamp; // 測定日時
        });
    mmDataTable.clear().rows.add(mmDataItems).draw();

    const mmCodeCountMap = {}
    for (const item of dataItems) {
        const curVal = mmCodeCountMap[item.mmCode];
        mmCodeCountMap[item.mmCode] = curVal === undefined ? 1 : curVal + 1;
    }
    const summary = Object.entries(mmCodeCountMap).sort((a, b) => {
            const r = b[1] - a[1]; // 出現回数降順
            if (r === 0) return a[0] - b[0]; // 測定コード昇順
            return r;
        })
        .map(([mmCode, count], index) => {
            return {
                id: index + 1,
                mmCode,
                count,
            }
        });
    mmSummaryTable.clear().rows.add(summary).draw();
}

// 初期化処理
document.addEventListener('DOMContentLoaded', function() {
    setupFilteringMmDataForm(window.codeTables, window.deviceDataItems);

    // メッセージ生成ボタンの処理
    document.getElementById('generateMessageButton').onclick = () => {
    };

    // 初期ロード
    loadData(window.deviceDataItems);
});