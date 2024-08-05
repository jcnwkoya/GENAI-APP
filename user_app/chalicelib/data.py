import os
import csv

data_dir = os.path.join(os.path.dirname(__file__), './data')

cached_data = {}


def load_data(name):
    if name in cached_data:
        return cached_data[name]

    file_path = os.path.join(data_dir, f'{name}.tsv')
    data_dict = {}

    with open(file_path, 'r', encoding='utf-8') as file:
        tsv_reader = csv.reader(file, delimiter='\t')

        for row in tsv_reader:
            if len(row) >= 2:  # 少なくとも2列あることを確認
                key = int(row[0])
                value = row[1]
                data_dict[key] = value

    cached_data[name] = data_dict
    return data_dict
