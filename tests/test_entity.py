import json
import requests


def get_entities(token):
    response = requests.get(
        "http://localhost:5000/entities", headers={"Authorization": "Bearer " + token}
    )
    assert response.status_code == 200
    return response.json()


def get_entity_by_id(token, id):
    response = requests.get(
        f"http://localhost:5000/entities/{id}",
        headers={"Authorization": "Bearer " + token},
    )
    assert response.status_code == 200
    return response.json()


def get_file(token, filename):
    response = requests.get(
        f"http://localhost:5000/entities/files/{filename}",
        headers={"Authorization": "Bearer " + token},
    )
    assert response.status_code == 200


def create_entity(token, body):
    response = requests.post(
        f"http://localhost:5000/entities/",
        headers={"Authorization": "Bearer " + token},
        files={},
        data={"body": json.dumps(body)},
    )
    assert response.status_code == 201
    actual = {k: v for k, v in response.json().items() if k in body}
    assert actual == body
    return response.json()


def update_entity(token, id, body):
    response = requests.put(
        f"http://localhost:5000/entities/{id}",
        headers={"Authorization": "Bearer " + token},
        files={},
        data={"body": json.dumps(body)},
    )
    assert response.status_code == 200
    actual = {k: v for k, v in response.json().items() if k in body}
    assert actual == body
    return response.json()


def delete_entity(token, id):
    response = requests.delete(
        f"http://localhost:5000/entities/{id}",
        headers={"Authorization": "Bearer " + token},
    )
    assert response.status_code == 200


def test_entities(token, lang):
    if lang == "ts":
        body1 = {
            "stringField": "test 1",
            "intField": 1,
            "enumField": "A",
            "stringArrayField": ["test1"],
            "boolField": True,
        }
        body2 = {
            "stringField": "test 2",
            "intField": 2,
            "enumField": "B",
            "stringArrayField": ["test2"],
            "boolField": False,
        }
    else:
        body1 = {
            "string_field": "test 1",
            "int_field": 1,
            "enum_field": "A",
            "string_array_field": ["test1"],
            "bool_field": True,
        }
        body2 = {
            "string_field": "test 2",
            "int_field": 2,
            "enum_field": "B",
            "string_array_field": ["test2"],
            "bool_field": False,
        }
    entity = create_entity(token, body1)
    updated_entity = update_entity(token, entity["id"], body2)
    retrieved_entity = get_entity_by_id(token, entity["id"])
    assert updated_entity == retrieved_entity
    get_entities(token)
    delete_entity(token, entity["id"])
