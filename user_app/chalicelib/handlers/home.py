from chalice import Blueprint, Response

extra_routes = Blueprint(__name__)

@extra_routes.route('/')
def home_page():
    req = extra_routes.current_request
    error_message = req.query_params.get('error') if req.query_params else None

    html = f"""
    <html>
        <head>
            <title>Gen AI App Viewer</title>
            <style>
                .error {{
                    color: red;
                    font-weight: bold;
                }}
            </style>
            <script src="./assets/jquery-3.7.1.min.js"></script>
            <link rel="stylesheet" href="./assets/datatables.css">
            <link rel="stylesheet" href="./assets/select.dataTables.css">
            <script src="./assets/datatables.js"></script>
            <script src="./assets/dataTables.select.js"></script>
        </head>
        <body>
            <h1>Gen AI App Viewer</h1>
            {f'<p class="error">Error: {error_message}</p>' if error_message else ''}
            <section>
                <table id="mmDataTable" class="stripe row-border order-column nowrap">
                    <thead>
                        <tr>
                            <th></th>
                            <th>No.</th>
                            <th>測定日時</th>
                            <th>測定メニュー</th>
                            <th>測定モード</th>
                            <th>測定コード</th>
                            <th>日本語名</th>
                        </tr>
                    </thead>
                </table>
            </section>
            <section>
                <table id="mmSummaryTable" class="stripe row-border order-column nowrap">
                    <thead>
                        <tr>
                            <th></th>
                            <th>No.</th>
                            <th>測定コード</th>
                            <th>日本語名</th>
                            <th>出現回数</th>
                        </tr>
                    </thead>
                </table>
            </section>
            <script src="./assets/main.js"></script>
        </body>
    </html>
    """
    return Response(body=html, status_code=200, headers={'Content-Type': 'text/html;charset=utf-8'})
