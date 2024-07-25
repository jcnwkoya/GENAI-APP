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
        </head>
        <body>
            <h1>Gen AI App Viewer</h1>
            {f'<p class="error">Error: {error_message}</p>' if error_message else ''}
        </body>
    </html>
    """
    return Response(body=html, status_code=200, headers={'Content-Type': 'text/html;charset=utf-8'})
