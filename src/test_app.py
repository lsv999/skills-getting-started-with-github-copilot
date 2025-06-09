import pytest
from fastapi.testclient import TestClient
from app import app, activities

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data

def test_signup_for_activity_success():
    email = "testuser@example.com"
    activity = "Chess Club"
    # Remove if already present
    if email in activities[activity]["participants"]:
        activities[activity]["participants"].remove(email)
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 200
    assert email in activities[activity]["participants"]

def test_signup_for_activity_already_registered():
    email = "testuser2@example.com"
    activity = "Chess Club"
    # Ensure user is already registered
    if email not in activities[activity]["participants"]:
        activities[activity]["participants"].append(email)
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 400
    assert response.json()["detail"] == "Student already signed up"

def test_signup_for_activity_not_found():
    response = client.post("/activities/Nonexistent/signup?email=someone@example.com")
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"

def test_unregister_from_activity_success():
    email = "testuser3@example.com"
    activity = "Chess Club"
    # Ensure user is registered
    if email not in activities[activity]["participants"]:
        activities[activity]["participants"].append(email)
    response = client.post(f"/activities/{activity}/unregister?email={email}")
    assert response.status_code == 200
    assert email not in activities[activity]["participants"]

def test_unregister_from_activity_not_registered():
    email = "notregistered@example.com"
    activity = "Chess Club"
    # Ensure user is not registered
    if email in activities[activity]["participants"]:
        activities[activity]["participants"].remove(email)
    response = client.post(f"/activities/{activity}/unregister?email={email}")
    assert response.status_code == 400
    assert response.json()["detail"] == "Student is not registered for this activity"

def test_unregister_from_activity_not_found():
    response = client.post("/activities/Nonexistent/unregister?email=someone@example.com")
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"