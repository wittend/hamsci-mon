Totally fine. Do a clean reboot now. When you’re back, follow the minimal steps below to get a clear, stable result without fighting copy/paste.
After reboot — minimal verification
1)
Start your dev server (Terminal 1):
cd /home/dave/Projects/deno-dev/hamsci-mon
 deno task dev
Wait until it prints the listening message.
2)
Test in a browser (Incognito/private window):
•
In the address bar, type exactly:
http://127.0.0.1:8000
If this loads the app, you’re good. If it downloads a file instead, note exactly what happens.
3)
(Optional) Quick terminal check (Terminal 2), if you’re comfortable:
curl --noproxy '*' -i http://127.0.0.1:8000/
Expected: HTTP/1.1 200 OK and Content-Type: text/html; charset=utf-8.
4)
If 8000 still acts weird, try a different local port without editing files:
•
Stop the server, then run this one‑liner test server (Terminal 1):
deno eval -A "Deno.serve({ hostname: '127.0.0.1', port: 8080 }, () => new Response('hello', { headers: { 'content-type': 'text/plain' } }))"
•
In the browser (Incognito), open:
http://127.0.0.1:8080
You should see hello.
If problems persist
Reply with just these two things (copy/paste):
•
The exact text your server prints when it starts (the line that says it’s listening).
•
The exact line from the terminal for: curl --noproxy '*' -i http://127.0.0.1:8000/ (if you ran it).
I’ll take it from there with the least possible steps. Good luck with the reboot — I’ll be here when you’re back.
