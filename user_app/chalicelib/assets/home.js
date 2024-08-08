const mmDataTable = new DataTable('#mmDataTable', {
    data: [],
    columns: [
        {
            data: 'id',
            width: '5ex',
        },
        {
            data: 'timestamp',
            className: 'dt-head-left dt-body-left',
            render: function(data, type, row) {
                if (type === 'display') {
                  return new Date(data * 1000).toLocaleString();
                }
                return data;
              }
          },
        {
            data: 'menu',
            className: 'dt-head-left dt-body-left',
            render: function(data, type, row) {
              if (type === 'display') {
                return codeTables.menus[data] || data;
              }
              return data;
            }
        },
        {
            data: 'mode',
            className: 'dt-head-left dt-body-left',
            render: function(data, type, row) {
              if (type === 'display') {
                return codeTables.modes[data] || data;
              }
              return data;
            }
        },
        {
            data: 'mmCode',
            className: 'dt-head-left dt-body-left',
            width: '12ex',
        },
        {
            data: 'mmCode',
            className: 'dt-head-left dt-body-left',
            render: function(data, type, row) {
              if (type === 'display') {
                return codeTables.mmCodes[data] || data;
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
});

const mmSummaryTable = new DataTable('#mmSummaryTable', {
    data: [],
    columns: [
        {
            data: null,
            orderable: false,
            width: '30px',
            render: DataTable.render.select(),
        },
        {
            data: 'id',
            width: '5ex',
        },
        {
            data: 'mmCode',
            className: 'dt-head-left dt-body-left',
            width: '12ex',
        },
        {
            data: 'mmCode',
            className: 'dt-head-left dt-body-left',
            render: function(data, type, row) {
              if (type === 'display') {
                return codeTables.mmCodes[data] || data;
              }
              return data;
            }
        },
        {
            data: 'count',
            width: '10ex',
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

    const startDate = new Date(dataItems.at(-1).timestamp * 1000).toLocaleDateString('sv-SE');
    const endDate = new Date(dataItems[0].timestamp * 1000).toLocaleDateString('sv-SE');

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
        try {
            const form = document.getElementById('filterForm');
            if (form.reportValidity()) {
                if (form.menu.value === 'all' && form.mode.value === 'all' && form.period.value === 'all') {
                    loadData(dataItems);
                } else {
                    const minTs = new Date(form.rangeStartDate.value + 'T00:00:00').getTime() / 1000;
                    const maxTs = new Date(form.rangeEndDate.value + 'T23:59:59').getTime() / 1000;
                    let count = form.mode.value == 0 ? 20 : 80;
    
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
                            if (--count < 0) return false;
                        }
                        return true;
                    });
                    loadData(results);
                }
            }
        } catch (e) {
            console.error(e);
        }
        return false;
    };

    updateDateFieldsState(); // 初期化処理
}

function setupMessageForm() {
    const button = document.getElementById('generateButton');
    const loading = document.getElementById('loadingProgress');

    // メッセージ生成ボタンの処理
    document.getElementById('messageForm').onsubmit = () => {
        (async () => {
            const form = document.getElementById('messageForm');
            try {
                const selectedRows = mmSummaryTable.rows('.selected').data();
                const words = [];
                for (let i = 0; i < selectedRows.length; i++) {
                    const word = codeTables.mmCodes[selectedRows[i].mmCode];
                    words.push(word);
                }
                if (words.length < 1 || 8 < words.length) {
                    alert('選択できる測定コードの数は最大8個です。');
                    return false;
                }
    
                button.disabled = true;
                loading.style.display = 'block';
    
                const body = {
                    words: words,
                    ai: form.ai.value,
                    msgtype: form.msgtype.value,
                    msglen: form.msglen.value,
                }
        
                const res = await fetch('./message', {
                    method: 'POST',
                    body: JSON.stringify(body),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                })
                const { message } = await res.json();
                document.getElementById('messageTextArea').value = message;
            } catch (e) {
                console.error(e);
            }
            button.disabled = false;
            loading.style.display = 'none';
        })();
        return false;
    };
}

function loadData(dataItems) {
    mmDataTable.clear().rows.add(dataItems).draw();

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

    setupMessageForm();

    // 初期ロード
    loadData(window.deviceDataItems);
});
