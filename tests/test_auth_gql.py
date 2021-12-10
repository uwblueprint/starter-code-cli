import os
import requests

from test_user_gql import delete_user


def register_user(body):
    query = """
    mutation($user: RegisterUserDTO!) {
        register(user: $user) {
            id
            firstName
            lastName
            email
            role
            accessToken
        }
    }
    """
    response = requests.post(
        "http://localhost:5000/graphql",
        json={"query": query, "variables": {"user": body}},
    )
    assert "data" in response.json()
    assert "register" in response.json()["data"]
    expected = {k: v for k, v in body.items() if k != "password"}
    data = response.json()["data"]["register"]
    actual = {k: v for k, v in data.items() if k in body}
    assert actual == expected
    return data


def reset_password(auth_header, email):
    query = """
    mutation($email: String!) {
        resetPassword(email: $email)
    }
    """
    response = requests.post(
        "http://localhost:5000/graphql",
        json={"query": query, "variables": {"email": email}},
        headers=auth_header,
    )
    assert "data" in response.json()
    assert "resetPassword" in response.json()["data"]
    data = response.json()["data"]["resetPassword"]
    assert data
    return data


def logout(auth_header, id):
    query = """
    mutation($userId: ID!) {
        logout(userId: $userId)
    }
    """
    response = requests.post(
        "http://localhost:5000/graphql",
        json={"query": query, "variables": {"userId": id}},
        headers=auth_header,
    )
    assert "data" in response.json()
    assert "logout" in response.json()["data"]
    return response.json()["data"]["logout"]


def test_auth_gql(auth_header, lang, api):
    if not auth_header or api == "rest":
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
    delete_user(auth_header, user["id"])
    reset_password(auth_header, os.getenv("EMAIL"))
    # logout(auth_header, user["id"])
