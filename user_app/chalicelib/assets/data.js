let csvData; // 読み込んだCSVのデータをダイアログ後に参照するため保持
function setupImportFile() {
    // ファイルの読み込み内容のクリア処理
    const reset = () => {
        csvData = undefined;
        const input = document.getElementById('importFile');
        input.disabled = false;
        input.value = '';
    }

    // ファイルを読み込むボタンが押されたときの処理
    document.getElementById('importFile').onchange = (evt) => {
        evt.target.disabled = true; // 二重処理防止

        try {
            const file = evt.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (re) {
                    csvData = loadCSVFile(re.target.result);
                    postDeviceDataItems(csvData)
                        .then(result => {
                            if (result) {
                                showAlert('測定データの登録に成功しました', 'info');
                                reset();
                            } else {
                                ui('#confirmOverwriteDialog');  // 上書き確認ダイアログを表示
                            }
                        })
                        .catch(err => {
                            console.error(err);
                            reset();
                            showAlert(err.message, 'error');
                        });
                };
                reader.readAsText(file);
            }
        } catch (err) {
            console.error(err);
            reset();
            showAlert(err.message, 'error');
        }
    };

    // 上書き確認ダイアログの上書きボタンが押されたときの処理
    document.getElementById('overwriteImportButton').onclick = (evt) => {
        try {
            postDeviceDataItems(csvData, true)
                .then(() => {
                    showAlert('測定データの登録に成功しました', 'info');
                    reset();
                })
                .catch(err => {
                    console.error(err);
                    reset();
                    showAlert(err.message, 'error');
                });
        } catch (err) {
            console.error(err);
            reset();
            showAlert(err.message, 'error');
        }
    };

    // 上書き確認ダイアログのキャンセルボタンが押されたときの処理
    document.getElementById('cancelImportButton').onclick = (evt) => {
        reset();
    };
}

function loadCSVFile(content) {
    const firstLine = content.split(/\r?\n/)[0];
    const { deviceId, user } = parseFirstLine(firstLine); // 先頭行を解析

    const bodyLines = content.replace(/^.+\r?\n/, ''); // 先頭行を削除
    const { data, errors } = Papa.parse(bodyLines, { header: true });
    const items = [];
    const tsSet = new Set();
    for (const line of data) {
        const timestamp = line["タイムスタンプ"];
        if (!timestamp) continue; // 日時がない行はスキップ

        if (tsSet.has(timestamp)) {
            throw new Error('ファイル内に同一タイムスタンプのデータが存在します。');
        }
        tsSet.add(timestamp);

        const menu = codeTables.menus[line["測定メニュー"]];
        const mode = codeTables.modes[line["測定モード"]];
        items.unshift({
            timestamp: Number(timestamp),
            mmCode: line["測定コード"],
            menu,
            mode,
        }); // 逆順に追加
    }
    return { deviceId, user, items };
}

function parseFirstLine(firstLine) {
    const { data } = Papa.parse(firstLine);
    const [, deviceId, , , , user] = data[0];
    return { deviceId, user: Number(user) };
}

async function postDeviceDataItems(data, overwrite = false) {
    const { deviceId, user, items } = data;
    const res = await fetch('./device/data', {
        method: 'POST',
        body: JSON.stringify({ deviceId, user, items, overwrite }),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (res.ok) return true; // 成功
    if (res.status === 409) {
        return false; // 重複エラーで失敗
    }

    const body = await res.json();
    throw new Error(body.message);
}

/**
 * アラートを表示します。
 */
function showAlert(message, kind) {
    document.getElementById('snackbarMsg').textContent = message;
    if (kind === 'error') {
        document.getElementById('snackbar').classList.add('error');
    } else {
        document.getElementById('snackbar').classList.remove('error');
    }
    ui("#snackbar", 3000);
}

// 画面ロード後の初期化処理
window.onload = () => {
    setupImportFile();
};
