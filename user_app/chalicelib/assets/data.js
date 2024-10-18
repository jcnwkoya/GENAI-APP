
function setupImportFile() {
    document.getElementById('importFile').onchange = (evt) => {
        try {
            // CSVの入力処理
            const file = evt.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (re) {
                    loadCSVFile(re.target.result);
                };
                reader.readAsText(file);
            }
        } catch (err) {
            console.error(err);
        }
    };
}

async function loadCSVFile(content) {
    const firstLine = content.split(/\r?\n/)[0];
    const { deviceId, user } = parseFirstLine(firstLine); // 先頭行を解析

    const bodyLines = content.replace(/^.+\r?\n/, ''); // 先頭行を削除
    const { data, errors } = Papa.parse(bodyLines, { header: true });
    const items = [];
    for (const line of data) {
        const datetime = line["測定日時"];
        if (!datetime) continue; // 日時がない行はスキップ

        const timestamp = new Date(datetime).getTime();
        const mmCode = line["測定コード"];
        const menu = codeTables.menus[line["測定メニュー"]];
        const mode = codeTables.modes[line["測定モード"]];
        items.unshift({
            deviceId,
            timestamp,
            mmCode,
            menu,
            mode,
            user,
        }); // 逆順に追加
    }

    // 1件ずつ登録処理
    for (const item of items) {
        await postDeviceDataItem(item);
    }
}

function parseFirstLine(firstLine) {
    const { data } = Papa.parse(firstLine);
    const [, deviceId, , , , user] = data[0];
    return { deviceId, user: Number(user) };
}

async function postDeviceDataItem(item) {
    const url = '/device/data';
    const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(item),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (res.ok) return true;
    if (res.status < 500) {
        const body = await res.json();
        throw new Error(body.message);
    }
    throw new Error('Failed to post data');
}


// 画面ロード後の初期化処理
window.onload = () => {
    setupImportFile();
};
