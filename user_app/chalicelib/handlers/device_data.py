import json
from chalice import Blueprint, Response
from logging import getLogger

from ..auth import verify_auth
from ..repositories.device_data import delete_device_data_item

logger = getLogger(__name__)

extra_routes = Blueprint(__name__)


@extra_routes.route("/device/data/delete", methods=["POST"])
def post_device_data_delete():
    req = extra_routes.current_request
    auth_res = verify_auth(req)
    if not auth_res:
        return Response(body="Unauthorized", status_code=401)

    device_id = auth_res["device_id"]
    body = req.json_body
    timestamps = body.get("timestamps", [])

    deleted_tss = []
    try:
        for timestamp in timestamps:
            delete_device_data_item(device_id, timestamp)
            deleted_tss.append(timestamp)

        logger.info(
            "Succeeded to delete device data",
            {"device_id": device_id, "deleted_timestamps": deleted_tss},
        )

        return Response(
            body=json.dumps({"deleted_timestamps": deleted_tss}),
            status_code=200,
            headers={"Content-Type": "application/json"},
        )
    except Exception as e:
        logger.error(e)
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
