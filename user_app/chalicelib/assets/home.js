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

/**
 * 測定データリストの絞り込みフォームのセットアップ
 */
function setupFilteringMmDataForm(codeTables, dataItems) {
    // メニューの選択肢をセットアップ
    const menuSelect = document.querySelector('select[name="menu"]')
    Object.entries(codeTables.menus).forEach(([val, name]) => {
        const opt = document.createElement('option');
        opt.textContent = name;
        opt.value = val;
        menuSelect.appendChild(opt);
    });

    // モードの選択肢をセットアップ
    const modeSelect = document.querySelector('select[name="mode"]')
    Object.entries(codeTables.modes).forEach(([val, name]) => {
        const opt = document.createElement('option');
        opt.textContent = name;
        opt.value = val;
        modeSelect.appendChild(opt);
    });

    // 検索期間のセットアップ
    const periodRadios = document.querySelectorAll('input[name="period"]');
    const rangeStartDate = document.querySelector('input[name="rangeStartDate"]');
    const rangeEndDate = document.querySelector('input[name="rangeEndDate"]');

    const startDate = new Date(dataItems.at(-1).timestamp * 1000).toLocaleDateString('sv-SE');
    const endDate = new Date(dataItems[0].timestamp * 1000).toLocaleDateString('sv-SE');

    rangeStartDate.min = rangeEndDate.min = startDate;
    rangeStartDate.max = rangeEndDate.max = endDate;
    rangeStartDate.value = startDate;
    rangeEndDate.value = endDate;

    /**
     * 検索期間のラジオボタン変更時の処理
     * 開始と終了の入力欄の有効/無効を切り替える
     */
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

    // 検索ボタンの処理
    document.getElementById('filterForm').onsubmit = evt => {
        try {
            const form = evt.target;
            if (form.reportValidity()) {
                if (form.menu.value === 'all' && form.mode.value === 'all' && form.period.value === 'all') {
                    loadData(dataItems);
                } else {
                    const targetMenu = Number(form.menu.value); // all は NaN になる
                    const targetMode = Number(form.mode.value); // all は NaN になる

                    const isRange = form.period.value === 'range';
                    const minTs = new Date(form.rangeStartDate.value + 'T00:00:00').getTime() / 1000;
                    const maxTs = new Date(form.rangeEndDate.value + 'T23:59:59').getTime() / 1000;    

                    let results = dataItems.filter(item => {
                        if (!isNaN(targetMenu) && item.menu !== targetMenu) return false;
                        if (!isNaN(targetMode) && item.mode !== targetMode) return false;

                        if (isRange) {
                            if (item.timestamp < minTs) return false;
                            if (item.timestamp > maxTs) return false;
                        }
                        return true;
                    });

                    if (form.period.value === 'latest' && results.length > 0) {
                        switch (results[0].mode) {
                            case 0: // エーテル
                                results = results.slice(0, 20);
                                break;
                            case 1: // アストラル
                                results = results.slice(0, 80);
                                break;
                        }
                        results
                    }

                    loadData(results);
                }
            }
        } catch (err) {
            console.error(err);
        }
        return false;
    };

    updateDateFieldsState(); // 初期化処理
}

/**
 * メッセージ生成フォームのセットアップ
 */
function setupMessageForm(messageTypes) {
    const messageTypeSelect = document.querySelector('select[name="msgtype"]');
    const button = document.getElementById('generateButton');
    const loading = document.getElementById('loadingProgress');
    const promptTextArea = document.getElementById('promptTextArea');
    const msgTextArea = document.getElementById('messageTextArea');

    messageTypes.forEach(item => {
        const opt = document.createElement('option');
        opt.textContent = item.name;
        opt.value = item.code;
        messageTypeSelect.appendChild(opt);
    });
    promptTextArea.value = messageTypes[0].userPrompt;
    messageTypeSelect.onchange = evt => {
        const val = evt.target.value;
        if (val === 'free') {
            promptTextArea.disabled = false;
        } else {
            promptTextArea.value = messageTypes.find(item => item.code === val).userPrompt;
            promptTextArea.disabled = true;
        }
    };

    // メッセージ生成ボタンの処理
    document.getElementById('messageForm').onsubmit = evt => {
        (async () => {
            const form = evt.target;
            try {
                const selectedRows = mmSummaryTable.rows('.selected').data();
                const words = [];
                for (let i = 0; i < selectedRows.length; i++) {
                    const word = codeTables.mmCodes[selectedRows[i].mmCode];
                    words.push(word);
                }
                if (words.length < 1 || 8 < words.length) {
                    alert('測定コード統計からワードを選択してください。選択できる測定コードの数は最大8個です。');
                    return false;
                }

                button.disabled = true;
                loading.style.display = 'block';
                msgTextArea.value = '';

                const body = {
                    words: words,
                    ai: form.ai.value,
                    msgtype: form.msgtype.value,
                    msglen: form.msglen.value,
                    prompt: form.msgtype.value === 'free' ? form.prompt.value : undefined,
                }

                const res = await fetch('./message', {
                    method: 'POST',
                    body: JSON.stringify(body),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                })
                const { message } = await res.json();
                msgTextArea.value = message;
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

    setupMessageForm(window.messageTypes);

    // 初期ロード
    loadData(window.deviceDataItems);
});
