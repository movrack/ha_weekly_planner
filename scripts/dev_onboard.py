#!/usr/bin/env python3
"""Onboard the local development instance and add Weekly Planner (no browser needed).

Creates the user dev / dev (local test instance only), finishes onboarding, adds the
integration and a dashboard with the card. Prints a long-lived access token.
"""

from __future__ import annotations

import asyncio
import json
import sys
import urllib.parse
import urllib.request

BASE = "http://localhost:8124"
CLIENT_ID = f"{BASE}/"


def call(method: str, path: str, data=None, token: str | None = None, form: bool = False):
    body = None
    headers = {}
    if data is not None:
        if form:
            body = urllib.parse.urlencode(data).encode()
            headers["Content-Type"] = "application/x-www-form-urlencoded"
        else:
            body = json.dumps(data).encode()
            headers["Content-Type"] = "application/json"
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(BASE + path, data=body, headers=headers, method=method)
    with urllib.request.urlopen(req) as res:
        raw = res.read()
        return json.loads(raw) if raw else None


async def websocket(token: str, messages: list[dict]) -> list[dict]:
    import aiohttp

    results = []
    async with aiohttp.ClientSession() as session, session.ws_connect(f"{BASE}/api/websocket") as ws:
        await ws.receive_json()
        await ws.send_json({"type": "auth", "access_token": token})
        await ws.receive_json()
        for i, msg in enumerate(messages, start=1):
            await ws.send_json({"id": i, **msg})
            while True:
                res = await ws.receive_json()
                if res.get("id") == i and res.get("type") == "result":
                    results.append(res)
                    break
    return results


def ensure_integration(token: str) -> None:
    entries = call("GET", "/api/config/config_entries/entry", token=token)
    if not any(e["domain"] == "weekly_planner" for e in entries):
        flow = call("POST", "/api/config/config_entries/flow", {"handler": "weekly_planner"}, token)
        call("POST", f"/api/config/config_entries/flow/{flow['flow_id']}", {}, token)


def main() -> None:
    steps = {s["step"]: s["done"] for s in call("GET", "/api/onboarding")}
    if all(steps.values()):
        # Already onboarded: reuse the token saved by the first run.
        token = open("dev/config/.dev_token").read().strip()
        ensure_integration(token)
        print(token)
        return
    if not steps.get("user"):
        code = call("POST", "/api/onboarding/users", {
            "client_id": CLIENT_ID, "name": "Dev", "username": "dev", "password": "dev",
            "language": "fr"})["auth_code"]
    else:
        flow = call("POST", "/auth/login_flow", {"client_id": CLIENT_ID, "handler": ["homeassistant", None],
                                                 "redirect_uri": CLIENT_ID})
        code = call("POST", f"/auth/login_flow/{flow['flow_id']}", {
            "client_id": CLIENT_ID, "username": "dev", "password": "dev"})["result"]
    tokens = call("POST", "/auth/token", {"grant_type": "authorization_code", "code": code,
                                          "client_id": CLIENT_ID}, form=True)
    access = tokens["access_token"]
    for step, path, payload in (
        ("core_config", "/api/onboarding/core_config", {}),
        ("analytics", "/api/onboarding/analytics", {}),
        ("integration", "/api/onboarding/integration", {"client_id": CLIENT_ID, "redirect_uri": CLIENT_ID}),
    ):
        if not steps.get(step):
            call("POST", path, payload, access)

    ensure_integration(access)

    long_lived = asyncio.run(websocket(access, [
        {"type": "auth/long_lived_access_token", "client_name": "dev-scripts", "lifespan": 365},
        {"type": "lovelace/dashboards/create", "url_path": "dashboard-planner", "title": "Planner",
         "icon": "mdi:calendar-clock", "mode": "storage", "show_in_sidebar": True,
         "require_admin": False},
    ]))[0]["result"]
    asyncio.run(websocket(access, [{"type": "lovelace/config/save", "url_path": "dashboard-planner",
                                    "config": {"views": [{"title": "Planner", "type": "sections", "sections": [
                                        {"type": "grid", "cards": [{"type": "custom:weekly-planner-card"}]}]}]}}]))
    print(long_lived)


if __name__ == "__main__":
    sys.exit(main())
