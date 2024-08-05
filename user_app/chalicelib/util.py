import os


path_prefix = os.environ.get('PATH_PREFIX', '')


def path_resolve(str):
    return path_prefix + str
