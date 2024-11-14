/**
 * 測定結果テーブルの定義と列ごとのレンダリング処理
 */
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
                return codeTables.mmCodes[data] || 'パーソナルコード';
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
    language: {
        emptyTable: '端末IDのユーザーNo.に該当する測定データはありません。',
    }
});

/**
 * 測定コード統計テーブルの定義と列ごとのレンダリング処理
 */
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
                return codeTables.mmCodes[data] || 'パーソナルコード';
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
 * 測定コード統計テーブルの選択および選択解除時の処理
 */
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
    // メニューの選択肢をドロップダウンリストに追加
    Object.entries(codeTables.menus).forEach(([val, item]) => {
        menuSelect.appendChild(createOptionElement(item.label, val));
    });

    // モードの選択肢をドロップダウンリストに追加
    Object.entries(codeTables.modes).forEach(([val, name]) => {
        modeSelect.appendChild(createOptionElement(name, val));
    });

    // 検索期間のセットアップ
    const rangeStartDate = document.querySelector('input[name="rangeStartDate"]');
    const rangeEndDate = document.querySelector('input[name="rangeEndDate"]');

    // データ上の最初と最後の日付を取得して、検索期間の選択範囲と初期値を設定
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
                // データ内のメニュー、モードの集合を組み立てつつ、選択と一致しない項目を除外して絞り込む
                results = results.filter(item => {
                    menuSet.add(item.menu);
                    modeSet.add(item.mode);
                    if (!isNaN(targetMenu) && item.menu !== targetMenu) return false;
                    if (!isNaN(targetMode) && item.mode !== targetMode) return false;
                    return true;
                });

                /** 
                 * 絞り込んだデータの表示と
                 * メニューとモードのドロップダウンリストの選択肢をそのデータ内のものに更新
                 */
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
            // CSVの出力処理

            // デバイスIDと名前の先頭行を作成
            const deviceId = document.getElementById('deviceId').textContent;
            const username = document.getElementById('username').textContent;
            const user = document.getElementById('user').textContent;
            let content = `SN,${deviceId},USER,${username},USER_NO,${user}\r\n`;

            // ヘッダ行を追加
            const headers = mmDataTable.columns().header().map(d => d.textContent).toArray().slice(1)
            headers.unshift('タイムスタンプ'); // タイムスタンプを1列目に挿入
            content += headers.join(',') + '\r\n';

            // データ行を追加
            mmDataTable.rows().every(function (idx, tableLoop, rowLoop ) {
                const rawData = this.data();
                const data = mmDataTable.cells(idx, '').render('display').toArray().slice(1)
                data.unshift(rawData['timestamp']); // タイムスタンプを1列目に挿入
                content += data.join(',') + '\r\n';
            });

            const a = document.createElement('a');
            const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); // UTF-8 BOM

            // AタグのリンクにデータURI形式でCSVデータをセットして
            // 疑似的にクリックイベントを発火させてダウンロードさせる
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

    document.getElementById('runDeleteButton').onclick = () => {
        (async () => {
            // ホーム画面の削除ボタン
            const deleteButton = document.getElementById('deleteButton');
            deleteButton.disabled = true;
            try {
                // リストに表示しているデータのタイムスタンプの配列を取得
                const tss = [];
                mmDataTable.rows().every(function () {
                    tss.push(this.data().timestamp);
                });

                // データ削除APIを呼び出す
                const res = await fetch('./device/data/delete', {
                    method: 'POST',
                    body: JSON.stringify({
                        timestamps: tss
                    }),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                })
                const { deleted_timestamps, message } = await res.json();
                deleteFromData(window.deviceDataItems, deleted_timestamps); // メモリ上のデータから削除
                deleteFromData(currentData, deleted_timestamps); // リスト表示中のデータから削除
                loadData(currentData); // リストを更新（全て削除されていれば空になる）
                if (message) {
                    showAlert(message); // エラー時はメッセージを表示する
                }
            } catch (err) {
                console.error(err);
            }
            deleteButton.disabled = false;
        })();
        return false;
    };
}

/**
 * ドロップダウンリストの選択肢の表示・非表示切り替え
 */
function resetSelectOptions(select, visibleSet) {
    for (const opt of select.options) {
        if (opt.value === 'all') continue; // すべては常に表示

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

    // メッセージタイプの選択肢を追加
    messageTypes.forEach(item => {
        messageTypeSelect.appendChild(createOptionElement(item.name, item.code));
    });

    // メニュー、メッセージタイプ、メッセージの長さを変更したらプロンプトを更新
    menuSelect.onchange = () => { updatePrompt() };
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

    // 初期プロンプトのセット
    updatePrompt();

    // 音声読み上げボタンの処理
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
 * 本体制御フォームのセットアップ
 */
function setupControlForm() {
    const commandButton = document.getElementById('commandButton');

    // コマンド送信ボタンの処理
    document.getElementById('controlForm').onsubmit = evt => {
        (async () => {
            const form = evt.target;
            try {
                commandButton.disabled = true; // ボタンを無効化して連打防止

                const fnc = form.fnc.value;
                const body = { fnc };

                // 測定コード送出のとき、統計テーブルから選択コード配列をセット
                if (fnc === 'cde') {
                    body.mmcodes = getSelectedSummaryTableRows().map(row => ({ code: row.mmCode, count: row.count }));
                }

                // 測定コード、メッセージ内容、メニューNo. のときメニュー値をセット
                switch (fnc) {
                    case 'cde':
                    case 'msg':
                    case 'mnu':
                        {
                            // メニュー値をセット
                            if (menuSelect.value === 'all') {
                                throw new Error('測定メニューを選択してください。');
                            }
                            body.menu = menuSelect.value;
                        }
                        break;
                }

                // メッセージ内容のときメッセージをセット
                if (fnc === 'msg') {
                    const msg = document.getElementById('messageTextArea').value;
                    if (!msg) {
                        throw new Error('メッセージは生成されていません。');
                    }
                    body.message = msg;
                }

                // コマンド送信APIを呼び出す
                const res = await fetch('./command', {
                    method: 'POST',
                    body: JSON.stringify(body),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                })
                await res.json();
                commandButton.disabled = false;
            } catch (err) {
                showAlert(err.message || 'コマンドの送信に失敗しました。');
                console.error(err);
            }
            commandButton.disabled = false;
        })();
        return false;
    };
}

/**
 * 測定データを表にロードします。さらに合わせて測定コード統計を更新します。
 */
function loadData(dataItems) {
    currentData = dataItems;
    mmDataTable.clear().rows.add(dataItems).draw();

    // 各測定コードごとに出現ごとにカウントアップして記録
    const mmCodeCountMap = {}
    for (const item of dataItems) {
        const curVal = mmCodeCountMap[item.mmCode];
        mmCodeCountMap[item.mmCode] = curVal === undefined ? 1 : curVal + 1;
    }

    // 表用のマトリックスデータに変換
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
let currentData = null;

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
        const words = getSelectedSummaryTableRows().map(row => codeTables.mmCodes[row.mmCode]);

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

/**
 * 統計テーブルから選択された行リストを取得します。
 */
function getSelectedSummaryTableRows() {
    const selectedRows = mmSummaryTable.rows('.selected').data();
    if (selectedRows.length < 1) {
        throw new Error('測定コード統計から言葉を選択してください。');
    } else if (selectedRows.length > 8) {
        throw new Error('測定コード統計から選択できる言葉の数は8個までです。');
    }
    return Array.from(selectedRows);
}

/**
 * 測定データ配列から指定された日時の項目を全て削除します。
 *
 * @param dataItems 削除元のデータの配列
 * @param timestamps 削除する測定日時の配列
 */
function deleteFromData(dataItems, timestamps) {
    for (const ts of timestamps) {
        const idx = dataItems.findIndex(item => item.timestamp === ts);
        if (idx >= 0) {
            dataItems.splice(idx, 1);
        }
    }
}

// 画面ロード後の初期化処理
window.onload = () => {
    setupFilteringMmDataForm(window.codeTables, window.deviceDataItems);

    setupMessageForm(window.messageTypes);

    setupControlForm();

    loadData(window.deviceDataItems);
};
