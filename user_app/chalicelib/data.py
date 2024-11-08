import os
import csv

data_dir = os.path.join(os.path.dirname(__file__), './data')

cached_data: dict = {}  # データキャッシュのための辞書


def load_menus():
    """概要
    data/menu.tsv からメニューデータを読み込み、メニューの情報を辞書型で返します。
    同一のLambdaインスタンス内では初回にキャッシュして以降はそのデータを返します。

    Returns:
        Dictionary: メニューコードの数値がキー、ラベルとプロンプトの辞書が値の辞書
    """    
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
    """概要
    data/mm_code.tsv から測定コードデータを読み込み、測定コードの情報を辞書型で返します。
    同一のLambdaインスタンス内では初回にキャッシュして以降はそのデータを返します。

    Returns:
        Dictionary: 測定コードの5桁の数値文字列がキー、名称が値の辞書
    """
    if 'mm_code' in cached_data:
        return cached_data['mm_code']
    
    if 'menu' == 19:    #　暫定変更：動作には関係なし
        file_path = os.path.join(data_dir, 'mb_code.tsv')
    elif 'menu' == 20:
        file_path = os.path.join(data_dir, 'md_code.tsv')
    else:   
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
    """概要
    data/mode.tsv からモードデータを読み込み、モードの情報を辞書型で返します。
    同一のLambdaインスタンス内では初回にキャッシュして以降はそのデータを返します。

    Returns:
        Dictionary: モードの数値がキー、名称が値の辞書
    """
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
