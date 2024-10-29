let importData; // 登録するデータをダイアログ後に参照するため保持
function setupImportFile() {
    // ファイルの読み込み内容のクリア処理
    const reset = () => {
        importData = undefined;
        const input = document.getElementById('importFile');
        input.disabled = false;
        input.value = '';
    }

    // ファイルを読み込むボタンが押されたときの処理
    document.getElementById('importFile').onchange = (evt) => {
        const file = evt.target.files[0];
        if (!file) return;

        (async () => {
            evt.target.disabled = true; // 二重処理防止

            try {
                const deviceId = document.getElementById('deviceIdInput').value;
                if (!deviceId) throw new Error('端末IDを入力してください');

                const user = Number(document.getElementById('userInput').value);
                if (isNaN(user)) throw new Error('ユーザー No.を入力してください');

                const textContent = await readFileAsText(file);
                const items = loadCSVFile(textContent);
                importData = { deviceId, user, items };
                const result = await postDeviceDataItems(importData);
                if (result) {
                    showAlert('測定データの登録に成功しました', 'info');
                    reset();
                } else {
                    ui('#confirmOverwriteDialog');  // 上書き確認ダイアログを表示
                }
            } catch (err) {
                console.error(err);
                reset();
                showAlert(err.message, 'error');
            }
        })();
    };

    // 上書き確認ダイアログの上書きボタンが押されたときの処理
    document.getElementById('overwriteImportButton').onclick = (evt) => {
        (async () => {
            try {
                await postDeviceDataItems(importData, true);
                showAlert('測定データの登録に成功しました', 'info');
            } catch (err) {
                console.error(err);
                showAlert(err.message, 'error');
            } finally {
                reset();
            }
        })();
    };

    // 上書き確認ダイアログのキャンセルボタンが押されたときの処理
    document.getElementById('cancelImportButton').onclick = (evt) => {
        reset();
    };
}

/**
 * テキストファイルを読み込んで、内容を全体を文字列として返します。
 */
async function readFileAsText(file) {
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (re) {
            resolve(re.target.result);
        };
        reader.onerror = function (err) {
            reject(err);
        };
        reader.readAsText(file);
    });
}

/**
 * 文字列をCSVとして解析して、
 * 行のセルをタイムスタンプ,メニュー,モード,測定コードとして
 * 登録データの配列を返します。
 */
function loadCSVFile(content) {
    const { data } = Papa.parse(content, { skipEmptyLines: true });
    const items = [];
    const tsSet = new Set();
    for (const line of data) {
        const [timestamp, menu, mode, mmCode] = line;

        if (tsSet.has(timestamp)) {
            throw new Error('ファイル内に同一タイムスタンプのデータが存在します。');
        }
        tsSet.add(timestamp);

        items.push({
            timestamp: Number(timestamp),
            mmCode,
            menu: codeTables.menus[menu],
            mode: codeTables.modes[mode],
        });
    }
    return items;
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
