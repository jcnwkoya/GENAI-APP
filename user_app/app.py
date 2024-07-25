from chalice import Chalice
from chalicelib.handlers.home import extra_routes as home
from chalicelib.handlers.login import extra_routes as login

app = Chalice(app_name='user_app')

app.register_blueprint(home)
app.register_blueprint(login)
