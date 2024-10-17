
function setupImportFile() {
    document.getElementById('importFile').onchange = (evt) => {
        try {
            // CSVの入力処理
            const file = evt.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (re) {
                    const csvData = re.target.result;

                    const firstLine = csvData.split(/\r?\n/)[0];
                    const { deviceId, user } = parseFirstLine(firstLine); // 先頭行を解析

                    const bodyLines = csvData.replace(/^.+\r?\n/, ''); // 先頭行を削除
                    const { data, errops, meta } = Papa.parse(bodyLines, { header: true });
                    for (const line of data) {
                        const timestamp = new Date(line["測定日時"]).getTime();
                        const mmCode = line["測定コード"];
                        const menu = codeTables.menus[line["測定メニュー"]];
                        const mode = codeTables.modes[line["測定モード"]];
                        console.info({
                            deviceId,
                            timestamp,
                            mmCode,
                            menu,
                            mode,
                            user,
                        });
                    }
                };
                reader.readAsText(file);
            }
        } catch (err) {
            console.error(err);
        }
    };
}

function parseFirstLine(firstLine) {
    const { data } = Papa.parse(firstLine);
    const [, deviceId, , , , user] = data[0];
    return { deviceId, user: Number(user) };
}


// 画面ロード後の初期化処理
window.onload = () => {
    setupImportFile();
};
