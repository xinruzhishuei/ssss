from mitmproxy import http

class Modify:
    def response(self, flow):
        if flow.request.url.startswith("https://m.jingxi.com/jxmc/queryservice/GetUserLoveInfo?"):
            response = flow.response.get_text()
            response='0'
            flow.response.set_text(response)
addons = [
    Modify()
]
