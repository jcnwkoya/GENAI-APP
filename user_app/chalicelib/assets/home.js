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
                return codeTables.menus[data].label || data;
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
mmSummaryTable.on('select deselect', () => {
    updatePrompt();
});

/**
 * 測定データリストの絞り込みフォームのセットアップ
 */
function setupFilteringMmDataForm(codeTables, dataItems) {
    const menuSelect = document.querySelector('select[name="menu"]');
    Object.entries(codeTables.menus).forEach(([val, item]) => {
        const opt = document.createElement('option');
        opt.textContent = item.label;
        opt.value = val;
        menuSelect.appendChild(opt);
    });
    const modeSelect = document.querySelector('select[name="mode"]');
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
                let results;
                if (form.period.value === 'latest' && dataItems.length > 0) {
                    switch (dataItems[0].mode) {
                        case 0: // エーテル
                            results = dataItems.slice(0, 20);
                            break;
                        case 1: // アストラル
                            results = dataItems.slice(0, 80);
                            break;
                    }
                } else if (form.period.value === 'range') {
                    const minTs = new Date(form.rangeStartDate.value + 'T00:00:00').getTime() / 1000;
                    const maxTs = new Date(form.rangeEndDate.value + 'T23:59:59').getTime() / 1000;  
                    results = dataItems.filter(item => {
                        if (item.timestamp < minTs) return false;
                        if (item.timestamp > maxTs) return false;
                        return true;
                    });
                } else {
                    results = dataItems;
                }

                const menuSet = new Set(); // ドロップダウンリストに表示するメニューの集合
                const modeSet = new Set(); // ドロップダウンリストに表示するモードの集合
                const targetMenu = Number(form.menu.value); // all は NaN になる
                const targetMode = Number(form.mode.value); // all は NaN になる
                results = results.filter(item => {
                    menuSet.add(item.menu);
                    modeSet.add(item.mode);
                    if (!isNaN(targetMenu) && item.menu !== targetMenu) return false;
                    if (!isNaN(targetMode) && item.mode !== targetMode) return false;
                    return true;
                });

                loadData(results);
                resetSelectOptions(menuSelect, menuSet);
                resetSelectOptions(modeSelect, modeSet);
            }
        } catch (err) {
            console.error(err);
        }
        return false;
    };

    updateDateFieldsState(); // 初期化処理
}

/**
 * ドロップダウンリストの選択肢の表示・非表示切り替え
 */
function resetSelectOptions(select, visibleSet) {
    for (let i = 1; i < select.options.length; i++) {
        const opt = select.options[i];
        if (visibleSet.has(Number(opt.value))) {
            opt.style.display = 'block';
        } else {
            opt.style.display = 'none';
        }
    }
}

/**
 * メッセージ生成フォームのセットアップ
 */
function setupMessageForm(messageTypes) {
    const menuSelect = document.querySelector('select[name="menu"]');
    const messageTypeSelect = document.querySelector('select[name="msgtype"]');
    const button = document.getElementById('generateButton');
    const loading = document.getElementById('loadingProgress');
    const msgTextArea = document.getElementById('messageTextArea');

    menuSelect.onchange = () => { updatePrompt() };
    messageTypes.forEach(item => {
        const opt = document.createElement('option');
        opt.textContent = item.name;
        opt.value = item.code;
        messageTypeSelect.appendChild(opt);
    });
    messageTypeSelect.onchange = () => { updatePrompt(); };
    document.getElementsByName('msglen').forEach(radio => {
        radio.onchange = () => { updatePrompt() };
    });

    // メッセージ生成ボタンの処理
    document.getElementById('messageForm').onsubmit = evt => {
        (async () => {
            const form = evt.target;
            try {
                button.disabled = true;
                loading.style.display = 'block';
                msgTextArea.value = '';

                const body = {
                    ai: form.ai.value,
                    msglen: Number(form.msglen.value),
                    prompt: form.prompt.value,
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
            } catch (err) {
                showAlert('メッセージ生成に失敗しました。');
                console.error(err);
            }
            button.disabled = false;
            loading.style.display = 'none';
        })();
        return false;
    };

    updatePrompt();
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

function showAlert(message) {
    const span = document.getElementById('snackbarErrMsg');
    span.textContent = message;
    ui("#snackbar", 3000);
}

function updatePrompt() {
    const generateButton = document.getElementById('generateButton');
    const promptTextArea = document.getElementById('promptTextArea');
    const errMsgSpan = document.getElementById('promptTextAreaErrMsg');

    try {
        const menuVal = document.querySelector('select[name="menu"]').value;
        if (menuVal === 'all') {
            throw new Error('測定メニューを選択してください。');
        }

        const selectedRows = mmSummaryTable.rows('.selected').data();
        if (selectedRows.length < 1) {
            throw new Error('測定コード統計から言葉を選択してください。');
        } else if (selectedRows.length > 8) {
            throw new Error('測定コード統計から選択できる言葉の数は8個までです。');
        }

        const selectedWords = [];
        for (let i = 0; i < selectedRows.length; i++) {
            const word = codeTables.mmCodes[selectedRows[i].mmCode];
            selectedWords.push(word);
        }

        const msgTypeVal = document.querySelector('select[name="msgtype"]').value;
        const tmpl = messageTypes.find(item => item.code === msgTypeVal).userPrompt;

        const vars = {
            menu: codeTables.menus[Number(menuVal)].prompt,
            words: selectedWords.map(w => `「${w}」`).join(','),
            charnum: document.querySelector('input[name="msglen"]:checked').value,
        };
        const result = tmpl.replace(/\$\{([^}]+)\}/g, (_, prop) => vars[prop]);

        generateButton.disabled = false;
        promptTextArea.value = result;
        errMsgSpan.textContent = '';
        $(promptTextArea).parent().removeClass('invalid');
    } catch (err) {
        generateButton.disabled = true;
        promptTextArea.value = '';
        errMsgSpan.textContent = err.message;
        $(promptTextArea).parent().addClass('invalid');
    }
}
