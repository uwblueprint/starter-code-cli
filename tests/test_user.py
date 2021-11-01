import requests


def get_users(token):
    response = requests.get(
        "http://localhost:5000/users", headers={"Authorization": "Bearer " + token}
    )
    assert response.status_code == 200
    return response.json()


def get_user_by_id(token, id):
    response = requests.get(
        f"http://localhost:5000/users?userId={id}",
        headers={"Authorization": "Bearer " + token},
    )
    assert response.status_code == 200
    return response.json()


def get_user_by_email(token, email):
    response = requests.get(
        f"http://localhost:5000/users?email={email}",
        headers={"Authorization": "Bearer " + token},
    )
    assert response.status_code == 200
    return response.json()


def create_user(token, body):
    response = requests.post(
        f"http://localhost:5000/users/",
        headers={"Authorization": "Bearer " + token},
        json=body,
    )
    assert response.status_code == 201
    expected = {k: v for k, v in body.items() if k != "password"}
    actual = {k: v for k, v in response.json().items() if k in body}
    assert actual == expected
    return response.json()


def update_user(token, id, body):
    response = requests.put(
        f"http://localhost:5000/users/{id}",
        headers={"Authorization": "Bearer " + token},
        json=body,
    )
    assert response.status_code == 200
    expected = {k: v for k, v in body.items()}
    actual = {k: v for k, v in response.json().items() if k in body}
    assert actual == expected
    return response.json()


def delete_user(token, id):
    response = requests.delete(
        f"http://localhost:5000/users?userId={id}",
        headers={"Authorization": "Bearer " + token},
    )
    assert response.status_code == 204


def test_users(token, lang):
    if lang == "ts":
        body1 = {
            "firstName": "Testing",
            "lastName": "Script",
            "role": "User",
            "email": "testscript@uwblueprint.org",
            "password": "password",
        }
        body2 = {
            "firstName": "Testing2",
            "lastName": "Script2",
            "role": "User",
            "email": "testscript2@uwblueprint.org",
        }
    else:
        body1 = {
            "first_name": "Testing",
            "last_name": "Script",
            "role": "User",
            "email": "infra@uwblueprint.org",
            "password": "password123",
        }
        body2 = {
            "first_name": "Testing2",
            "last_name": "Script2",
            "role": "User",
            "email": "infra@uwblueprint.org",
        }
    user = create_user(token, body1)
    updated_user = update_user(token, user["id"], body2)
    retrieved_user = get_user_by_id(token, user["id"])
    assert updated_user == retrieved_user
    get_user_by_email(token, retrieved_user["email"])
    get_users(token)
    delete_user(token, user["id"])
