import os


path_prefix = os.environ.get('PATH_PREFIX', '')
res_suffix = os.environ.get('RES_SUFFIX', '-poc')


def path_resolve(str):
    return path_prefix + str


def aws_resource(name):
    return name + res_suffix
