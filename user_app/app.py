from chalice import Chalice
from chalicelib.handlers.asset import extra_routes as asset
from chalicelib.handlers.home import extra_routes as home
from chalicelib.handlers.login import extra_routes as login
from chalicelib.handlers.message import extra_routes as message

app = Chalice(app_name='user_app')

app.register_blueprint(asset)
app.register_blueprint(home)
app.register_blueprint(login)
app.register_blueprint(message)
