import requests

from tests.test_user import delete_user


def register_user(body):
    response = requests.get("http://localhost:5000/auth/register", json=body)
    assert response.status_code == 200
    expected = {k: v for k, v in body.items() if k != "password"}
    actual = {k: v for k, v in response.json().items() if k in body}
    assert actual == expected
    return response.json()


def reset_password(auth_header, email):
    response = requests.get(
        f"http://localhost:5000/auth/resetPassword/{email}",
        header=auth_header,
    )
    assert response.status_code == 204


def logout(auth_header, id):
    response = requests.get(
        f"http://localhost:5000/auth/logout/{id}",
        header=auth_header,
    )
    assert response.status_code == 204


def test_users(auth_header, lang):
    if not auth_header:
        return

    if lang == "ts":
        body = {
            "firstName": "Testing",
            "lastName": "Script",
            "email": "testscript@uwblueprint.org",
            "password": "password123",
        }
    else:
        body = {
            "first_name": "Testing",
            "last_name": "Script",
            "email": "infra@uwblueprint.org",
            "password": "password123",
        }
    user = register_user(body)
    reset_password(auth_header, body["email"])
    logout(auth_header, user["id"])
    delete_user(auth_header, user["id"], lang)
