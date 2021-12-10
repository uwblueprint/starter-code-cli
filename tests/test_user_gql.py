import requests


def get_users(auth_header):
    query = """
    query {
        users {
            id
            firstName
            lastName
            email
            role
        }
    }
    """
    response = requests.post(
        "http://localhost:5000/graphql",
        json={"query": query},
        headers=auth_header,
    )
    assert "data" in response.json()
    assert "users" in response.json()["data"]
    return response.json()["data"]["users"]


def get_user_by_id(auth_header, id):
    query = """
    query($id: ID!) {
        userById(id: $id) {
            id
            firstName
            lastName
            email
            role
        }
    }
    """
    response = requests.post(
        "http://localhost:5000/graphql",
        json={"query": query, "variables": {"id": id}},
        headers=auth_header,
    )
    assert "data" in response.json()
    assert "userById" in response.json()["data"]
    return response.json()["data"]["userById"]


def get_user_by_email(auth_header, email):
    query = """
    query($email: String!) {
        userByEmail(email: $email) {
            id
            firstName
            lastName
            email
            role
        }
    }
    """
    response = requests.post(
        "http://localhost:5000/graphql",
        json={"query": query, "variables": {"email": email}},
        headers=auth_header,
    )
    assert "data" in response.json()
    assert "userByEmail" in response.json()["data"]
    return response.json()["data"]["userByEmail"]


def create_user(auth_header, body):
    query = """
    mutation($user: CreateUserDTO!) {
        createUser(user: $user) {
            id
            firstName
            lastName
            email
            role
        }
    }        
    """
    response = requests.post(
        "http://localhost:5000/graphql",
        json={"query": query, "variables": {"user": body}},
        headers=auth_header,
    )
    assert "data" in response.json()
    assert "createUser" in response.json()["data"]
    expected = {k: v for k, v in body.items() if k != "password"}
    data = response.json()["data"]["createUser"]
    actual = {k: v for k, v in data.items() if k in body}
    assert actual == expected
    return data


def update_user(auth_header, id, body):
    query = """
    mutation($id: ID!, $user: UpdateUserDTO!) {
        updateUser(id: $id, user: $user) {
            id
            firstName
            lastName
            email
            role
        }
    }        
    """
    response = requests.post(
        "http://localhost:5000/graphql",
        json={"query": query, "variables": {"id": id, "user": body}},
        headers=auth_header,
    )
    assert "data" in response.json()
    assert "updateUser" in response.json()["data"]
    data = response.json()["data"]["updateUser"]
    actual = {k: v for k, v in data.items() if k in body}
    assert actual == body
    return data


def delete_user(auth_header, id):
    query = """
    mutation($id: ID!) {
        deleteUserById(id: $id)
    }
    """
    response = requests.post(
        "http://localhost:5000/graphql",
        json={"query": query, "variables": {"id": id}},
        headers=auth_header,
    )
    assert "data" in response.json()
    assert "deleteUserById" in response.json()["data"]
    return response.json()["data"]["deleteUserById"]


def test_users_gql(auth_header, lang, api):
    if not auth_header or api == "rest":
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
    retrieved_user_by_id = get_user_by_id(auth_header, user["id"])
    assert updated_user == retrieved_user_by_id
    retrieved_user_by_email = get_user_by_email(auth_header, updated_user["email"])
    assert updated_user == retrieved_user_by_email
    get_users(auth_header)
    delete_user(auth_header, user["id"])
