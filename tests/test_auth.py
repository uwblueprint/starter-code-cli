import os
import requests

from test_user import delete_user


def register_user(body):
    response = requests.post("http://localhost:5000/auth/register", json=body)
    assert response.status_code == 200
    expected = {k: v for k, v in body.items() if k != "password"}
    actual = {k: v for k, v in response.json().items() if k in body}
    assert actual == expected
    return response.json()


def reset_password(auth_header, email):
    response = requests.post(
        f"http://localhost:5000/auth/resetPassword/{email}",
        headers=auth_header,
    )
    assert response.status_code == 204


def logout(auth_header, id):
    response = requests.post(
        f"http://localhost:5000/auth/logout/{id}",
        headers=auth_header,
    )
    assert response.status_code == 204


def test_auth(auth_header, lang, api):
    if not auth_header or api != "rest":
        return

    if lang == "ts":
        body = {
            "firstName": "Test",
            "lastName": "Script",
            "email": "infra@uwblueprint.org",
            "password": "password123",
        }
    else:
        body = {
            "first_name": "Test",
            "last_name": "Script",
            "email": "infra@uwblueprint.org",
            "password": "password123",
        }
    user = register_user(body)
    delete_user(auth_header, user["id"], lang)
    reset_password(auth_header, os.getenv("EMAIL"))
    # logout(auth_header, user["id"])
