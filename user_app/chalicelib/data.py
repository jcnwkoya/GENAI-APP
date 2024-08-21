import os
import csv

data_dir = os.path.join(os.path.dirname(__file__), './data')

cached_data = {}


def load_menus():
    if 'menu' in cached_data:
        return cached_data['menu']

    file_path = os.path.join(data_dir, 'menu.tsv')
    data_dict = {}

    with open(file_path, 'r', encoding='utf-8') as file:
        tsv_reader = csv.reader(file, delimiter='\t')

        for row in tsv_reader:
            if len(row) >= 3:  # 少なくとも3列あることを確認
                key = int(row[0])
                data_dict[key] = {
                    'label': row[1],
                    'prompt': row[2],
                }

    cached_data['menu'] = data_dict
    return data_dict


def load_mm_codes():
    if 'mm_code' in cached_data:
        return cached_data['mm_code']

    file_path = os.path.join(data_dir, 'mm_code.tsv')
    data_dict = {}

    with open(file_path, 'r', encoding='utf-8') as file:
        tsv_reader = csv.reader(file, delimiter='\t')

        for row in tsv_reader:
            if len(row) >= 2:  # 少なくとも2列あることを確認
                key = str(row[0]).zfill(5)  # 先頭0埋め
                value = row[1]
                data_dict[key] = value

    cached_data['mm_code'] = data_dict
    return data_dict


def load_modes():
    if 'mode' in cached_data:
        return cached_data['mode']

    file_path = os.path.join(data_dir, 'mode.tsv')
    data_dict = {}

    with open(file_path, 'r', encoding='utf-8') as file:
        tsv_reader = csv.reader(file, delimiter='\t')

        for row in tsv_reader:
            if len(row) >= 2:  # 少なくとも2列あることを確認
                key = int(row[0])
                value = row[1]
                data_dict[key] = value

    cached_data['mode'] = data_dict
    return data_dict
