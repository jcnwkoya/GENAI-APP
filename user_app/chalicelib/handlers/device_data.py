import json
from chalice import Blueprint, Response

from ..auth import verify_auth
from ..repositories.device_data import (
    delete_device_data_item,
    put_device_data_item,
    query_device_data_items,
)

extra_routes = Blueprint(__name__)


@extra_routes.route("/device/data", methods=["POST"])
def post_device_data():
    req = extra_routes.current_request

    body = req.json_body
    device_id = body.get("deviceId", "")
    user = body.get("user", 0)
    items = body.get("items", [])
    overwrite = body.get("overwrite", False)

    try:
        # デバイスIDが該当の測定データのデータベースから全取得
        db_items = query_device_data_items(device_id, user)

        # db_itemsのtimestampをセットに変換して高速な検索を可能にする
        db_timestamps = set(item["timestamp"] for item in db_items)

        if not overwrite:
            # 上書きフラグがオフの場合
            for item in items:
                # itemのtimestampがdb_timestampsに存在するかチェック
                timestamp = item["timestamp"]
                if timestamp in db_timestamps:
                    extra_routes.log.warning(
                        "timestamp already exists in the database",
                        extra={"device_id": device_id, "timestamp": timestamp},
                    )
                    return Response(
                        body=json.dumps(
                            {
                                "message": "データベース内に同一タイムスタンプのデータが存在します。",
                            }
                        ),
                        status_code=409,
                        headers={"Content-Type": "application/json"},
                    )

        # 登録処理
        for item in items:
            timestamp = item["timestamp"]
            put_device_data_item(
                device_id, timestamp, item["mmCode"], item["menu"], item["mode"], user
            )
            extra_routes.log.info(
                "Succeeded to save device data",
                extra={"device_id": device_id, "timestamp": timestamp},
            )

        return Response(
            body=json.dumps({}),
            status_code=200,
            headers={"Content-Type": "application/json"},
        )
    except:
        extra_routes.log.exception("Failed to save device data")
        return Response(
            body=json.dumps(
                {
                    "message": "測定データの追加に失敗しました。",
                }
            ),
            status_code=500,
            headers={"Content-Type": "application/json"},
        )


@extra_routes.route("/device/data/delete", methods=["POST"])
def post_device_data_delete():
    req = extra_routes.current_request
    auth_res = verify_auth(req)
    if not auth_res:
        return Response(body="Unauthorized", status_code=401)

    device_id = auth_res["device_id"]
    body = req.json_body
    timestamps = body.get("timestamps", [])

    # タイムスタンプ配列に入っている項目を一件ずつデータベースから削除して、
    # 削除に成功したタイムスタンプを記録してレスポンスに含めます。
    deleted_tss = []
    try:
        for timestamp in timestamps:
            delete_device_data_item(device_id, timestamp)
            deleted_tss.append(timestamp)

        extra_routes.log.info(
            "Succeeded to delete device data",
            {"device_id": device_id, "deleted_timestamps": deleted_tss},
        )

        return Response(
            body=json.dumps({"deleted_timestamps": deleted_tss}),
            status_code=200,
            headers={"Content-Type": "application/json"},
        )
    except:
        extra_routes.log.exception("Failed to delete device data")
        return Response(
            body=json.dumps(
                {
                    "message": "測定データの削除に失敗しました。",
                    "deleted_timestamps": deleted_tss,
                }
            ),
            status_code=500,
            headers={"Content-Type": "application/json"},
        )
