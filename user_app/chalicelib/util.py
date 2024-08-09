import os

path_prefix = os.environ.get('PATH_PREFIX', '')
res_suffix = os.environ.get('RES_SUFFIX', '-poc')


def app_name():
    return os.environ.get('APP_NAME', 'genai-user-app')


def path_resolve(str):
    return path_prefix + str


def aws_resource(name):
    return name + res_suffix
