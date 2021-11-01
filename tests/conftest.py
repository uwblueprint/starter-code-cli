import os
import pytest
import requests
from dotenv import load_dotenv

load_dotenv()


def pytest_addoption(parser):
    parser.addoption("--lang", action="store", default="ts")


@pytest.fixture(scope="session", autouse=True)
def lang(request):
    return request.config.getoption("--lang")


@pytest.fixture(scope="session", autouse=True)
def token(lang):
    response = requests.post(
        "http://localhost:5000/auth/login",
        json={"email": os.getenv("EMAIL"), "password": os.getenv("PASSWORD")},
    )
    if lang == "ts":
        return response.json()["accessToken"]
    else:
        return response.json()["access_token"]
