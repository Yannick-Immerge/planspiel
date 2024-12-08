import requests

USE_LOCAL_SERVER = True
SERVER_ADDR_HTTP = "http://localhost" if USE_LOCAL_SERVER else "http://ec2-16-171-21-132.eu-north-1.compute.amazonaws.com"

if __name__ == "__main__":
    # Create a session
    res = requests.post(SERVER_ADDR_HTTP + ":5001/data/roles/list", json={}).json()
    print("Available Roles: " + str(res["data"]))

    role_name = "max_mustermann"
    res = requests.post(SERVER_ADDR_HTTP + ":5001/data/roles/get", json={
        "name": role_name
    }).json()
    print(f"Info about {role_name}: " + str(res["data"]))
    entries = res["data"]["entries"]
    scenarios = res["data"]["scenarios"]

    for entry_name in entries:
        res = requests.post(SERVER_ADDR_HTTP + ":5001/data/role_entries/get", json={
            "name": entry_name
        }).json()
        print(f"Info about {entry_name}: " + str(res["data"]))

    for scenario_name in scenarios:
        res = requests.post(SERVER_ADDR_HTTP + ":5001/data/scenarios/get", json={
            "name": scenario_name
        }).json()
        print(f"Info about {scenario_name}: " + str(res["data"]))