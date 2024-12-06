import requests

if __name__ == "__main__":
    # Create a session
    res = requests.post("http://localhost:5002/game/sessions/create", json={
        "productKey": "Sesam",
        "administratorPasswordHash": "admin"
    }).json()
    session_id = res["data"]["sessionId"]
    admin_username = res["data"]["administratorUsername"]
    print(f"Created session {session_id}. Administrator: {admin_username}.")

    # Add a user
    res = requests.post("http://localhost:5002/game/users/create", json={
        "sessionId": session_id,
        "passwordHash": "mypassword"
    }).json()
    username = res["data"]["username"]
    print(f"Created user {username} in session {session_id}.")
