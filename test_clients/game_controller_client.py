import requests

USE_LOCAL_SERVER = True
SERVER_ADDR_HTTP = "http://localhost" if USE_LOCAL_SERVER else "http://ec2-16-171-21-132.eu-north-1.compute.amazonaws.com"

if __name__ == "__main__":
    # Create a session
    res = requests.post(SERVER_ADDR_HTTP + ":5002/game/sessions/create", json={
        "productKey": "123-123-123",
        "administratorPasswordHash": "admin"    # Plain Text
    }).json()
    session_id = res["data"]["sessionId"]
    admin_username = res["data"]["administratorUsername"]
    print(f"Created session {session_id}. Administrator: {admin_username}.")

    # Add a user
    res = requests.post( SERVER_ADDR_HTTP + ":5002/game/users/create", json={
        "sessionId": session_id,
        "passwordHash": "mypassword"
    }).json()
    username = res["data"]["username"]
    print(f"Created user {username} in session {session_id}.")

    # Log In as admin
    res = requests.post(SERVER_ADDR_HTTP + ":5002/game/users/login", json={
        "username": admin_username,
        "passwordHash": "admin"                # Plain Text
    }).json()
    token = res["data"]["token"]
    print(f"Token for administrator {admin_username}: {token}.")

    # Configure a user
    res = requests.post(SERVER_ADDR_HTTP + ":5002/game/users/configure", json={
        "administratorUsername": admin_username,
        "administratorToken": token,
        "targetUsername": username,
        "assignedRoleId": "non_existent",
        "assignedBuergerrat": 2
    }).json()

    # Get detailed Session Info
    res = requests.post(SERVER_ADDR_HTTP + ":5002/game/sessions/get", json={
        "sessionId": session_id,
        "administratorUsername": admin_username,
        "administratorToken": token
    }).json()
    print(res["data"])
