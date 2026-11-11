"""Temporary smoke check for the root Next.js project."""
import http.cookiejar
import json
import os
from pathlib import Path
import socket
import subprocess
import tempfile
import time
import urllib.error
import urllib.request

root = Path(__file__).resolve().parents[1]
pg = Path("C:/Program Files/PostgreSQL/15/bin")

def available_port():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args):
        return None

with tempfile.TemporaryDirectory(prefix="steward-root-smoke-") as temp:
    db_port = available_port()
    web_port = available_port()
    while web_port == db_port:
        web_port = available_port()
    origin = f"http://127.0.0.1:{web_port}"
    env = dict(os.environ, DATABASE_URL=f"postgresql://steward_smoke@127.0.0.1:{db_port}/postgres",
               BETTER_AUTH_SECRET="disposable-steward-root-layout-secret-12345678",
               BETTER_AUTH_URL=origin, TRUSTED_ORIGINS=origin)
    data = Path(temp) / "pgdata"
    subprocess.run([str(pg / "initdb.exe"), "-D", str(data), "-U", "steward_smoke",
                    "-A", "trust", "--locale=C", "-E", "UTF8"], check=True)
    control = [str(pg / "pg_ctl.exe"), "-D", str(data)]
    subprocess.run(control + ["-l", str(Path(temp) / "postgres.log"),
                              "-o", f"-h 127.0.0.1 -p {db_port}", "-w", "start"], check=True)
    try:
        subprocess.run(["cmd.exe", "/d", "/c", "pnpm.cmd db:migrate"], cwd=root, env=env, check=True)
        app = subprocess.Popen(["node", str(root / "node_modules/next/dist/bin/next"), "start",
                                "--hostname", "127.0.0.1", "--port", str(web_port)], cwd=root, env=env)
        client = urllib.request.build_opener(NoRedirect(),
            urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
        def request(path, body=None):
            req = urllib.request.Request(origin + path, None if body is None else json.dumps(body).encode(),
                {"Origin": origin, "Content-Type": "application/json"})
            try:
                response = client.open(req, timeout=10)
            except urllib.error.HTTPError as error:
                response = error
            with response:
                return response.status, response.headers, response.read()
        try:
            for _ in range(20):
                try:
                    assert request("/")[0] == 200
                    break
                except urllib.error.URLError:
                    assert app.poll() is None
                    time.sleep(.25)
            else:
                raise RuntimeError("Next.js failed to start")
            for path in ["/login", "/register"]:
                assert request(path)[0] == 200, path
            code, headers, response = request("/api/health")
            assert code == 200 and json.loads(response) == {"status": "ok"}
            assert headers["Cache-Control"] == "no-store"
            assert request("/accounts")[0] == 307
            email = "steward-layout-smoke@example.test"
            code, _, response = request("/api/auth/sign-up/email", {
                "name": "Layout Smoke", "email": email, "password": "synthetic-password-123",
            })
            assert code == 200 and json.loads(response)["user"]["email"] == email, code
            assert request("/accounts")[0] == 200
            assert request("/api/auth/sign-out", {})[0] == 200
            assert request("/accounts")[0] == 307
            print("PASS: root migration, health, public routes, real registration and sign-out")
        finally:
            app.terminate()
            app.wait(timeout=10)
    finally:
        subprocess.run(control + ["-m", "fast", "-w", "stop"], check=True)
