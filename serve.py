import http.server
import socketserver
import socket
import sys

PORT = 8080

def get_lan_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "192.168.x.x"

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

socketserver.TCPServer.allow_reuse_address = True

with socketserver.TCPServer(("0.0.0.0", PORT), CustomHandler) as httpd:
    lan_ip = get_lan_ip()
    print("\n==================================================")
    print("🚀 BFS & DFS PLATFORM SERVER RUNNING (BOUND TO 0.0.0.0)")
    print("==================================================")
    print(f"💻 Local Computer:   http://localhost:{PORT}")
    print(f"📱 Mobile / Wi-Fi LAN: http://{lan_ip}:{PORT}")
    print("--------------------------------------------------")
    print("🌍 Public Internet HTTPS Access (via Cloudflare / ngrok):")
    print(f"   npx cloudflared tunnel --url http://localhost:{PORT}")
    print(f"   OR: npx localtunnel --port {PORT}")
    print("==================================================\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        sys.exit(0)
