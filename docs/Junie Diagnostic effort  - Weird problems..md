dave@LP-Sig0:~$ curl -i http://localhost:8000/
HTTP/1.1 200 OK
content-type: application/octet-stream
vary: Accept-Encoding
transfer-encoding: chunked
date: Mon, 10 Nov 2025 21:59:34 GMT

curl: (18) transfer closed with outstanding read data remaining
dave@LP-Sig0:~$ curl -i http://127.0.0.1:8000/
curl: (7) Failed to connect to 127.0.0.1 port 8000 after 0 ms: Couldn't connect to server
dave@LP-Sig0:~$ curl -i http://[::1]:8000/
curl: (7) Failed to connect to ::1 port 8000 after 0 ms: Couldn't connect to server
dave@LP-Sig0:~$ curl -i http://localhost:8000/index.html
curl: (7) Failed to connect to localhost port 8000 after 0 ms: Couldn't connect to server
dave@LP-Sig0:~$ curl -i http://localhost:8000/app.js
curl: (7) Failed to connect to localhost port 8000 after 0 ms: Couldn't connect to server
dave@LP-Sig0:~$

dave@LP-Sig0:~$ lsof -i :8000 -Pn
dave@LP-Sig0:~$
dave@LP-Sig0:~$ ss -ltnp | grep :8000
dave@LP-Sig0:~$

dave@LP-Sig0:~/Projects/deno-dev/hamsci-mon$ deno task dev
Task dev deno run -A --watch server/main.ts
Watcher Process started.
Listening on http://0.0.0.0:8000/ (http://localhost:8000/)


curl --noproxy '*' -i http://127.0.0.1:8000/
HTTP/1.1 200 OK
content-type: application/octet-stream
vary: Accept-Encoding
transfer-encoding: chunked
date: Mon, 10 Nov 2025 22:11:42 GMT

curl: (18) transfer closed with outstanding read data remaining
