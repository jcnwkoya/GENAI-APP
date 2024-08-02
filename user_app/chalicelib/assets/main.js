const mmDataTable = new DataTable('#mmDataTable', {
    data: [],
    columnDefs: [
        {
            orderable: false,
            render: DataTable.render.select(),
            targets: 0
        }
    ],
    fixedColumns: {
        start: 2
    },
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

const mmSummaryTable = new DataTable('#mmSummaryTable', {
    data: [],
    columnDefs: [
        {
            orderable: false,
            render: DataTable.render.select(),
            targets: 0
        }
    ],
    fixedColumns: {
        start: 2
    },
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

function loadData() {
    const data = [
        ["", 1, "2024-05-10", "貴男のメンタル", "エーテル", "65366", "ショック"],
        ["", 2, "2024-05-10", "貴男のメンタル", "エーテル", "55507", "閉所恐怖症"],
        ["", 3, "2024-05-10", "貴男のメンタル", "エーテル", "35376", "極度の疲労"],
        ["", 4, "2024-05-10", "貴男のメンタル", "エーテル", "55603", "ありがとう"],
        ["", 5, "2024-05-10", "貴男のメンタル", "エーテル", "35774", "強欲"],
        ["", 6, "2024-05-10", "貴男のメンタル", "エーテル", "45941", "強い自惚れ"],
        ["", 7, "2024-05-10", "貴男のメンタル", "エーテル", "75107", "受容"],
        ["", 8, "2024-05-10", "貴男のメンタル", "エーテル", "35669", "操る、操作する"],
        ["", 9, "2024-05-10", "貴男のメンタル", "エーテル", "65714", "不確かな"],
        ["", 10, "2024-05-10", "貴男のメンタル", "エーテル", "25316", "隠れた精神的な疲労"],
        ["", 11, "2024-05-10", "貴男のメンタル", "エーテル", "15339", "恐怖"],
        ["", 12, "2024-05-10", "貴男のメンタル", "エーテル", "65597", "判断、評価"],
        ["", 13, "2024-05-10", "貴男のメンタル", "エーテル", "35088", "混乱した思考"],
        ["", 14, "2024-05-10", "貴男のメンタル", "エーテル", "55038", "悲しみ"],
        ["", 15, "2024-05-10", "貴男のメンタル", "エーテル", "35376", "極度の疲労"]
      ];
    mmDataTable.clear().rows.add(data).draw();

    const summary = [
        ['', 1,	'35388', '愛情', '81'],
        ['', 2,	'75059', '穏やかな・平静', '74'],
        ['', 3,	'35088', '混乱した思考', '71'],
        ['', 4,	'65018', '不注意な', '69'],
        ['', 5,	'75488', '食品の問題', '68'],
        ['', 6,	'75027', '細かい配慮をする', '68'],
        ['', 7,	'65496', '屈辱', '68'],
        ['', 8,	'75746', '感情を抑制', '67'],
        ['', 9,	'35896', '虚偽', '66'],
        ['', 10,	'85596', '厳密な', '64']
    ];
    mmSummaryTable.clear().rows.add(summary).draw();
}

loadData();
