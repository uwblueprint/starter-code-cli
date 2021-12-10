import requests


def get_users(auth_header):
    response = requests.get("http://localhost:5000/users", headers=auth_header)
    assert response.status_code == 200
    return response.json()


def get_user_by_id(auth_header, id, lang):
    if lang == "ts":
        response = requests.get(
            f"http://localhost:5000/users?userId={id}",
            headers=auth_header,
        )
    else:
        response = requests.get(
            f"http://localhost:5000/users?user_id={id}",
            headers=auth_header,
        )
    assert response.status_code == 200
    return response.json()


def get_user_by_email(auth_header, email):
    response = requests.get(
        f"http://localhost:5000/users?email={email}",
        headers=auth_header,
    )
    assert response.status_code == 200
    return response.json()


def create_user(auth_header, body):
    response = requests.post(
        f"http://localhost:5000/users/",
        json=body,
        headers=auth_header,
    )
    assert response.status_code == 201
    expected = {k: v for k, v in body.items() if k != "password"}
    actual = {k: v for k, v in response.json().items() if k in body}
    assert actual == expected
    return response.json()


def update_user(auth_header, id, body):
    response = requests.put(
        f"http://localhost:5000/users/{id}",
        json=body,
        headers=auth_header,
    )
    assert response.status_code == 200
    actual = {k: v for k, v in response.json().items() if k in body}
    assert actual == body
    return response.json()


def delete_user(auth_header, id, lang):
    if lang == "ts":
        response = requests.delete(
            f"http://localhost:5000/users?userId={id}",
            headers=auth_header,
        )
    else:
        response = requests.delete(
            f"http://localhost:5000/users?user_id={id}",
            headers=auth_header,
        )
    assert response.status_code == 204


def test_users(auth_header, lang, api):
    if not auth_header or api != "rest":
        return

    if lang == "ts":
        body1 = {
            "firstName": "Test",
            "lastName": "Script",
            "role": "User",
            "email": "infra@uwblueprint.org",
            "password": "password",
        }
        body2 = {
            "firstName": "Test2",
            "lastName": "Script2",
            "role": "User",
            "email": "infra@uwblueprint.org",
        }
    else:
        body1 = {
            "first_name": "Test",
            "last_name": "Script",
            "role": "User",
            "email": "infra@uwblueprint.org",
            "password": "password123",
        }
        body2 = {
            "first_name": "Test2",
            "last_name": "Script2",
            "role": "User",
            "email": "infra@uwblueprint.org",
        }
    user = create_user(auth_header, body1)
    updated_user = update_user(auth_header, user["id"], body2)
    retrieved_user_by_id = get_user_by_id(auth_header, user["id"], lang)
    assert updated_user == retrieved_user_by_id
    retrieved_user_by_email = get_user_by_email(auth_header, updated_user["email"])
    assert updated_user == retrieved_user_by_email
    get_users(auth_header)
    delete_user(auth_header, user["id"], lang)
