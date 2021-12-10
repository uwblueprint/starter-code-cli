import json
import requests


def get_entities(auth_header, fs):
    if fs:
        query = """
        query {
            entities {
                id
                stringField
                intField
                enumField
                stringArrayField
                boolField
                fileName
            }
        }
        """
    else:
        query = """
        query {
            entities {
                id
                stringField
                intField
                enumField
                stringArrayField
                boolField
            }
        }
        """
    response = requests.post(
        "http://localhost:5000/graphql",
        json={"query": query},
        headers=auth_header,
    )
    assert "data" in response.json()
    assert "entities" in response.json()["data"]
    return response.json()["data"]["entities"]


def get_entity_by_id(auth_header, id, fs):
    if fs:
        query = """
        query($id: ID!) {
            entity(id: $id) {
                id
                stringField
                intField
                enumField
                stringArrayField
                boolField
                fileName
            }
        }
        """
    else:
        query = """
        query($id: ID!) {
            entity(id: $id) {
                id
                stringField
                intField
                enumField
                stringArrayField
                boolField
            }
        }
        """
    response = requests.post(
        "http://localhost:5000/graphql",
        json={"query": query, "variables": {"id": id}},
        headers=auth_header,
    )
    assert "data" in response.json()
    assert "entity" in response.json()["data"]
    return response.json()["data"]["entity"]


def get_file(auth_header, filename):
    query = """
    query($fileUUID: ID!) {
        file(fileUUID: $fileUUID)
    }
    """
    response = requests.post(
        "http://localhost:5000/graphql",
        json={"query": query, "variables": {"fileUUID": filename}},
        headers=auth_header,
    )
    assert "data" in response.json()
    assert "file" in response.json()["data"]
    return response.json()["data"]["file"]


def create_entity(auth_header, body, fs, file):
    if fs:
        query = """
        mutation($entity: EntityRequestDTO!, $file: Upload) {
            createEntity(
                entity: $entity, file: $file
            ) {
                id
                stringField
                intField
                stringArrayField
                boolField
                enumField
                fileName
            }
        }        
        """
        # https://github.com/jaydenseric/graphql-multipart-request-spec
        operations = json.dumps(
            {
                "query": query,
                "variables": {"entity": body, "file": None},
            }
        )
        map = json.dumps({"0": ["variables.file"]})
        response = requests.post(
            "http://localhost:5000/graphql",
            data={"operations": operations, "map": map},
            files={"0": file},
            headers=auth_header,
        )
    else:
        query = """
        mutation($entity: EntityRequestDTO!) {
            createEntity(entity: $entity) {
                id
                stringField
                intField
                stringArrayField
                boolField
                enumField
            }
        }      
        """
        response = requests.post(
            "http://localhost:5000/graphql",
            json={"query": query, "variables": {"entity": body}},
            headers=auth_header,
        )
    assert "data" in response.json()
    assert "createEntity" in response.json()["data"]
    data = response.json()["data"]["createEntity"]
    actual = {k: v for k, v in data.items() if k in body}
    assert actual == body
    return data


def update_entity(auth_header, id, body, fs, file):
    if fs:
        query = """
        mutation($id: ID!, $entity: EntityRequestDTO!, $file: Upload) {
            updateEntity(
                id: $id, entity: $entity, file: $file
            ) {
                id
                stringField
                intField
                stringArrayField
                boolField
                enumField
                fileName
            }
        }
        """
        # https://github.com/jaydenseric/graphql-multipart-request-spec
        operations = json.dumps(
            {
                "query": query,
                "variables": {"id": id, "entity": body, "file": None},
            }
        )
        map = json.dumps({"0": ["variables.file"]})
        response = requests.post(
            "http://localhost:5000/graphql",
            data={"operations": operations, "map": map},
            files={"0": file},
            headers=auth_header,
        )
    else:
        query = """
        mutation($id: ID!, $entity: EntityRequestDTO!) {
            updateEntity(
                id: $id, entity: $entity
            ) {
                id
                stringField
                intField
                stringArrayField
                boolField
                enumField
            }
        }
        """
        response = requests.post(
            "http://localhost:5000/graphql",
            json={"query": query, "variables": {"id": id, "entity": body}},
            headers=auth_header,
        )
    assert "data" in response.json()
    assert "updateEntity" in response.json()["data"]
    data = response.json()["data"]["updateEntity"]
    actual = {k: v for k, v in data.items() if k in body}
    assert actual == body
    return data


def delete_entity(auth_header, id):
    query = """
    mutation($id: ID!) {
        deleteEntity(id: $id)
    }
    """
    response = requests.post(
        "http://localhost:5000/graphql",
        json={"query": query, "variables": {"id": id}},
        headers=auth_header,
    )
    assert "data" in response.json()
    assert "deleteEntity" in response.json()["data"]
    return response.json()["data"]["deleteEntity"]


def test_entities(auth_header, lang, api, fs):
    if api == "rest":
        return

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
        filenameField = "fileName"
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
        filenameField = "file_name"
    file1 = ("dog.jpg", open("dog.jpg", "rb"), "image/jpeg")
    file2 = ("cat.png", open("cat.png", "rb"), "image/png")
    entity = create_entity(auth_header, body1, fs, file1)
    if fs:
        get_file(auth_header, entity[filenameField])
    updated_entity = update_entity(auth_header, entity["id"], body2, fs, file2)
    if fs:
        get_file(auth_header, updated_entity[filenameField])
    retrieved_entity = get_entity_by_id(auth_header, entity["id"], fs)
    assert updated_entity == retrieved_entity
    get_entities(auth_header, fs)
    delete_entity(auth_header, entity["id"])
