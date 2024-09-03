// 測定結果テーブル
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
                  return new Date(data).toLocaleString();
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

// 測定コード統計テーブル
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

// メニュー選択
const menuSelect = document.querySelector('select[name="menu"]');

// モード選択
const modeSelect = document.querySelector('select[name="mode"]');

// メッセージタイプ選択
const messageTypeSelect = document.querySelector('select[name="msgtype"]');

// メッセージ生成ボタン
const generateButton = document.getElementById('generateButton');

/**
 * selectタグのoption要素を生成します。
 * @param label 表示ラベル
 * @param value 値
 * @returns option要素
 */
function createOptionElement(label, value) {
    const opt = document.createElement('option');
    opt.textContent = label;
    opt.value = value;
    return opt;
}

/**
 * 測定データリストの絞り込みフォームのセットアップ
 */
function setupFilteringMmDataForm(codeTables, dataItems) {
    Object.entries(codeTables.menus).forEach(([val, item]) => {
        menuSelect.appendChild(createOptionElement(item.label, val));
    });
    Object.entries(codeTables.modes).forEach(([val, name]) => {
        modeSelect.appendChild(createOptionElement(name, val));
    });

    // 検索期間のセットアップ
    const rangeStartDate = document.querySelector('input[name="rangeStartDate"]');
    const rangeEndDate = document.querySelector('input[name="rangeEndDate"]');

    const startDate = new Date(dataItems.at(-1).timestamp).toLocaleDateString('sv-SE');
    const endDate = new Date(dataItems[0].timestamp).toLocaleDateString('sv-SE');

    rangeStartDate.min = rangeEndDate.min = startDate;
    rangeStartDate.max = rangeEndDate.max = endDate;
    rangeStartDate.value = startDate;
    rangeEndDate.value = endDate;

    /**
     * 検索期間のラジオボタン変更時の処理
     * 開始日と終了日選択の有効/無効を切り替える
     */
    const updateDateFieldsState = selectedValue => {
        const rangeNotSelected = selectedValue !== 'range';
        [rangeStartDate, rangeEndDate].forEach(input => {
            input.disabled = rangeNotSelected;
            input.parentElement.classList.toggle('disabled', rangeNotSelected);
        });
    }
    document.querySelectorAll('input[name="period"]').forEach(radio => {
        radio.onchange = evt => {
            updateDateFieldsState(evt.target.value);
        };
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
                    const minTs = new Date(form.rangeStartDate.value + 'T00:00:00').getTime();
                    const maxTs = new Date(form.rangeEndDate.value + 'T23:59:59').getTime();
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

    document.getElementById('exportButton').onclick = () => {
        try {
            const headers = mmDataTable.columns().header().map(d => d.textContent).toArray().slice(1)
            let content = headers.join(',') + '\r\n';

            mmDataTable.rows().every(function (idx, tableLoop, rowLoop ) {
                const data = mmDataTable.cells(idx, '').render('display').toArray().slice(1)
                content += data.join(',') + '\r\n';
            });

            const a = document.createElement('a');
            const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
            a.href = URL.createObjectURL(new Blob([bom, content], { type: 'application/octet-stream' }));
            const datestr = new Date().toLocaleDateString('sv-SE').replaceAll("-", '');
            a.setAttribute('download', `mdatabase${datestr}.csv`);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (err) {
            console.error(err);
        }
        return false;
    };
}

/**
 * ドロップダウンリストの選択肢の表示・非表示切り替え
 */
function resetSelectOptions(select, visibleSet) {
    for (const opt of select.options) {
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
    const loadingProgress = document.getElementById('loadingProgress');
    const messageTextArea = document.getElementById('messageTextArea');
    const speakButton = document.getElementById('speakButton');

    menuSelect.onchange = () => { updatePrompt() };

    messageTypes.forEach(item => {
        messageTypeSelect.appendChild(createOptionElement(item.name, item.code));
    });
    messageTypeSelect.onchange = () => { updatePrompt(); };

    document.querySelectorAll('input[name="msglen"]').forEach(radio => {
        radio.onchange = () => { updatePrompt() };
    });

    // メッセージ生成ボタンの処理
    document.getElementById('messageForm').onsubmit = evt => {
        (async () => {
            const form = evt.target;
            try {
                generateButton.disabled = true; // ボタンを無効化して連打防止
                loadingProgress.style.display = 'block'; // ローディング表示
                messageTextArea.value = '';

                // メッセージ生成APIを呼び出す
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
                messageTextArea.value = message;
                speakButton.disabled = false;
            } catch (err) {
                showAlert('メッセージ生成に失敗しました。');
                console.error(err);
            }
            generateButton.disabled = false;
            loadingProgress.style.display = 'none';
        })();
        return false;
    };

    updatePrompt();

    let utterance = null;
    speakButton.onclick = () => {
        (() => {
            if (utterance) {
                // 再生中は停止
                speechSynthesis.cancel();
                utterance = null;
                return;
            } else {
                // 再生を開始
                utterance = new SpeechSynthesisUtterance(messageTextArea.value);
                utterance.lang = 'ja-JP';

                // Microsoft Keita Online があればセット
                const msKeitaVoice = speechSynthesis.getVoices().find(voice => voice.name.startsWith("Microsoft Keita Online"));
                if (msKeitaVoice) {
                    utterance.voice = msKeitaVoice;
                }

                speechSynthesis.speak(utterance);
                utterance.onend = () => {
                    utterance = null;
                };
            }
        })();
        return false;
    };

    // 音声の事前ロード（時間がかかるため読み上げ直前だと取れない）
    speechSynthesis.getVoices()
}

/**
 * 初期データロード
 */
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

/**
 * アラートを表示します。
 */
function showAlert(message) {
    document.getElementById('snackbarErrMsg').textContent = message;
    ui("#snackbar", 3000);
}

/**
 * なんらかのフィールドが変更されたら関連フィールドから選択値を取得して、
 * テンプレートに値を埋め込んで、プロンプトを更新します。
 */
function updatePrompt() {
    const promptTextArea = document.getElementById('promptTextArea');

    try {
        // メニューのチェック
        if (menuSelect.value === 'all') {
            throw new Error('測定メニューを選択してください。');
        }

        // 統計テーブルから選択された言葉のリストを取得
        const selectedRows = mmSummaryTable.rows('.selected').data();
        if (selectedRows.length < 1) {
            throw new Error('測定コード統計から言葉を選択してください。');
        } else if (selectedRows.length > 8) {
            throw new Error('測定コード統計から選択できる言葉の数は8個までです。');
        }
        const words = selectedRows.map(row => codeTables.mmCodes[row.mmCode]);

        // プロンプトテンプレート
        const tmpl = messageTypes.find(item => item.code === messageTypeSelect.value).userPrompt;

        const vars = {
            menu: codeTables.menus[Number(menuSelect.value)].prompt,
            words: words.map(w => `「${w}」`).join(','),
            charnum: document.querySelector('input[name="msglen"]:checked').value,
        };
        const result = tmpl.replace(/\$\{([^}]+)\}/g, (_, prop) => vars[prop]);

        // 生成ボタンを有効化してエラー表示を消去
        generateButton.disabled = false;
        promptTextArea.value = result;
        promptTextArea.nextElementSibling.textContent = '';
        promptTextArea.parentElement.classList.remove('invalid');
    } catch (err) {
        // 生成ボタンを無効化してエラーメッセージを表示
        generateButton.disabled = true;
        promptTextArea.value = '';
        promptTextArea.nextElementSibling.textContent = err.message;
        promptTextArea.parentElement.classList.add('invalid');
    }
}

// 画面ロード後の初期化処理
window.onload = () => {
    setupFilteringMmDataForm(window.codeTables, window.deviceDataItems);

    setupMessageForm(window.messageTypes);

    loadData(window.deviceDataItems);
};
