
function setupImportFile() {
    document.getElementById('importFile').onchange = (evt) => {
        try {
            // CSVの入力処理
            const file = evt.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (re) {
                    loadCSVFile(re.target.result)
                        .then(() => {
                            showAlert('測定データの登録に成功しました', 'info');
                        })
                        .catch(err => {
                            console.error(err);
                            showAlert(err.message, 'error');
                        });
                };
                reader.readAsText(file);
            }
        } catch (err) {
            console.error(err);
            showAlert(err.message, 'error');
        }
    };
}

async function loadCSVFile(content) {
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
            user,
        }); // 逆順に追加
    }

    await postDeviceDataItems(deviceId, user, items);
}

function parseFirstLine(firstLine) {
    const { data } = Papa.parse(firstLine);
    const [, deviceId, , , , user] = data[0];
    return { deviceId, user: Number(user) };
}

async function postDeviceDataItems(deviceId, user, items) {
    const res = await fetch('./device/data', {
        method: 'POST',
        body: JSON.stringify({ deviceId, user, items }),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (res.ok) return true;
    if (res.status < 500) {
        const body = await res.json();
        throw new Error(body.message);
    }
    throw new Error('測定データの登録に失敗しました。');
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
