import logging
from chalice import Chalice
from chalicelib.handlers.asset import extra_routes as asset
from chalicelib.handlers.home import extra_routes as home
from chalicelib.handlers.login import extra_routes as login
from chalicelib.handlers.message import extra_routes as message
from chalicelib.handlers.command import extra_routes as command
from chalicelib.handlers.device_data import extra_routes as device_data
from chalicelib.handlers.data import extra_routes as data
from chalicelib.util import app_name

app = Chalice(app_name=app_name())
app.log.setLevel(logging.INFO)

app.register_blueprint(asset)
app.register_blueprint(home)
app.register_blueprint(login)
app.register_blueprint(message)
app.register_blueprint(command)
app.register_blueprint(device_data)
app.register_blueprint(data)
