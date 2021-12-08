import json
import requests


def get_entities(auth_header):
    response = requests.get("http://localhost:5000/entities", headers=auth_header)
    assert response.status_code == 200
    return response.json()


def get_entity_by_id(auth_header, id):
    response = requests.get(
        f"http://localhost:5000/entities/{id}",
        headers=auth_header,
    )
    assert response.status_code == 200
    return response.json()


def get_file(auth_header, filename):
    response = requests.get(
        f"http://localhost:5000/entities/files/{filename}",
        headers=auth_header,
    )
    assert response.status_code == 200


def create_entity(auth_header, body, fs):
    if fs:
        response = requests.post(
            f"http://localhost:5000/entities/",
            headers=auth_header,
            files={},
            data={"body": json.dumps(body)},
        )
    else:
        response = requests.post(
            f"http://localhost:5000/entities/",
            json=body,
            headers=auth_header,
        )
    assert response.status_code == 201
    actual = {k: v for k, v in response.json().items() if k in body}
    assert actual == body
    return response.json()


def update_entity(auth_header, id, body, fs):
    if fs:
        response = requests.put(
            f"http://localhost:5000/entities/{id}",
            headers=auth_header,
            files={},
            data={"body": json.dumps(body)},
        )
    else:
        response = requests.put(
            f"http://localhost:5000/entities/{id}",
            json=body,
            headers=auth_header,
        )
    assert response.status_code == 200
    actual = {k: v for k, v in response.json().items() if k in body}
    assert actual == body
    return response.json()


def delete_entity(auth_header, id):
    response = requests.delete(
        f"http://localhost:5000/entities/{id}",
        headers=auth_header,
    )
    assert response.status_code == 200


def test_entities(auth_header, lang, fs):
    if lang == "ts":
        body1 = {
            "stringField": "TestScript1",
            "intField": 1,
            "enumField": "A",
            "stringArrayField": ["test1", "test2"],
            "boolField": True,
        }
        body2 = {
            "stringField": "TestScript2",
            "intField": 2,
            "enumField": "B",
            "stringArrayField": ["test2"],
            "boolField": False,
        }
    else:
        body1 = {
            "string_field": "TestScript1",
            "int_field": 1,
            "enum_field": "A",
            "string_array_field": ["test1", "test2"],
            "bool_field": True,
        }
        body2 = {
            "string_field": "TestScript2",
            "int_field": 2,
            "enum_field": "B",
            "string_array_field": ["test2"],
            "bool_field": False,
        }
    entity = create_entity(auth_header, body1, fs)
    updated_entity = update_entity(auth_header, entity["id"], body2, fs)
    retrieved_entity = get_entity_by_id(auth_header, entity["id"])
    assert updated_entity == retrieved_entity
    get_entities(auth_header)
    delete_entity(auth_header, entity["id"])
