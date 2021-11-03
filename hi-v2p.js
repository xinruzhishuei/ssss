/*

活动入口：https://web.hi.com/ 每天领币

还没注册的朋友,可以使用下方的邀请注册
https://hi.com/80vip

支持多账号,多账号间使用&分割,格式为'账号1;密码@账号;密码2'
export HIUSERS = '+8613999999999;123456&=+8613888888888;123456'

================Loon==============
[Script]
cron "55 0-23/8 * * *" script-path=hicoin_start.js,tag= 每天领币

 */
const $ = new Env('hicoin_daily');
const notify = $.isNode() ? require('./sendNotify') : '';

const topicAnswers = ['成功', '前方', '朋友', '可以', '漂亮', '机智', 'hi'];
let HIUSERS= '';
let cookiesArr = [];
if (!$.isNode()) {
   HIUSERS= $.getdata('HIUSERS');
}else{
   HIUSERS= process.env.HIUSERS;
}

if ( HIUSERS) {
    if ( HIUSERS.indexOf('&') > -1) {
      cookiesArr =  HIUSERS.split('&');
    } else if ( HIUSERS.indexOf('\n') > -1) {
      cookiesArr = HIUSERS.split('\n');
    } else {
      cookiesArr = [HIUSERS];
    }
};

let requestCookies = '';
let token = '';
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先设置账号');
    return;
  }
  let allMessage = "";
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      requestCookies = "";
      token = "";

      cookie = cookiesArr[i].split(';');

      console.log(`\n******开始【hi账号${cookie[0]}】*********\n`);

      await getCookie("https://web.hi.com");
      //登录
      let resultData = await postUrl('https://web.hi.com/api/app/user/login', `{"mobileNo":"${cookie[0]}","verifyCode":"","password":"${cookie[1]}"}`);
      if (!resultData || resultData.msg != 'success' || !resultData.data || !resultData.data.token) {
        allMessage = allMessage + `${cookie[0]} 登录失败 \n`
        console.log(`出错了 ${resultData}`);
        continue;
      }

      token = resultData.data.token;

      //保存登录日志
      await postUrl(`https://web.hi.com/api/app/saveLoginLog`, `{"channelId":"Web App","phoneDes":"PC Windows 10 x64"}`);

      //判断是否已经领过
      resultData = await postUrl('https://web.hi.com/api/app/checkHasSign', '{}');
      if (resultData && resultData.data) {
        allMessage = allMessage + `${cookie[0]} 已经领过 \n`
        console.log(`已经领过`);
        continue;
      }

      //开始签到
      resultData = await getUrl("https://web.hi.com/api/app/getNowTopic");
      if (!resultData || resultData.msg != 'success' || !resultData.data) {
        allMessage = allMessage + `${cookie[0]} 出错了 ${JSON.stringify(resultData)} \n`
        console.log(`出错了 ${resultData}`);
        continue;
      }
      let topicId = resultData.data.topicId;

      //签到
      resultData = await postUrl("https://web.hi.com/api/app/signIn", `{"topicId":${topicId},"topicAnswer":"${topicAnswers[randomNumber(0, topicAnswers.length)]}"}`);
      allMessage = allMessage + `${cookie[0]} 成功 ${JSON.stringify(resultData)} \n`
    }
  }

  if ($.isNode()) await notify.sendNotify($.name, `${allMessage} jd`)
})()
  .catch((e) => {
    $.log('', ` ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done();
  })


function getCookie (url) {
  return new Promise(resolve => {
    var timeStr = escape(Format("yyyy-MM-dd+HH:mm:ss", new Date()));
    let req = {
      url: url,
      referrer: "https://web.hi.com",
      headers: {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-US;q=0.7",
        "sec-ch-ua": "\"Microsoft Edge\";v=\"93\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"93\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "Origin": "https://web.hi.com"
      }
    }
    $.get(req, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
        } else {
          var responseCookies = resp.headers['set-cookie'] || [];
          for (var i = 0; i < responseCookies.length; i++) {
            var oneCookie = responseCookies[i];
            oneCookie = oneCookie.split(';');
            requestCookies = requestCookies + oneCookie[0] + ';';
          }
          console.log(`ok`)
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function login (username, password) {
  return new Promise(resolve => {
    var timeStr = escape(Format("yyyy-MM-dd+HH:mm:ss", new Date()));
    let req = {
      url: `https://web.hi.com/api/app/user/login`,
      referrer: "https://web.hi.com",
      body: `{"mobileNo":"${username}","verifyCode":"","password":"${password}"}`,
      headers: {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-US;q=0.7",
        "sec-ch-ua": "\"Microsoft Edge\";v=\"93\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"93\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "Origin": "https://web.hi.com",
        "Content-Type": "application/json;charset=UTF-8",
        "Cookie": requestCookies
      }
    }
    $.post(req, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
        } else {
          var responseCookies = resp.headers['set-cookie'] || [];
          for (var i = 0; i < responseCookies.length; i++) {
            var oneCookie = responseCookies[i];
            oneCookie = oneCookie.split(';');
            requestCookies = requestCookies + oneCookie[0] + ';';
          }
          var jsonData = JSON.parse(data);
          console.log(`${data}`)
          if (jsonData.msg == 'success')
            token = jsonData.data.token;
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function postUrl (url, postdata) {
  return new Promise(resolve => {
    var timeStr = escape(Format("yyyy-MM-dd+HH:mm:ss", new Date()));
    let req = {
      url: `${url}`,
      referrer: "https://web.hi.com",
      body: `${postdata}`,
      headers: {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-US;q=0.7",
        "sec-ch-ua": "\"Microsoft Edge\";v=\"93\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"93\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "Origin": "https://web.hi.com",
        "Content-Type": "application/json;charset=UTF-8",
        "token": `${token}`,
        "Cookie": requestCookies
      }
    }
    $.post(req, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
        } else {
          var responseCookies = resp.headers['set-cookie'] || [];
          for (var i = 0; i < responseCookies.length; i++) {
            var oneCookie = responseCookies[i];
            oneCookie = oneCookie.split(';');
            requestCookies = requestCookies + oneCookie[0] + ';';
          }
          console.log(`${data}`)
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(JSON.parse(data));
      }
    })
  })
}

function getUrl (url) {
  return new Promise(resolve => {
    let req = {
      url: `${url}`,
      referrer: "https://web.hi.com",
      headers: {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-US;q=0.7",
        "sec-ch-ua": "\"Microsoft Edge\";v=\"93\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"93\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "Origin": "https://web.hi.com",
        "Content-Type": "application/json;charset=UTF-8",
        "token": `${token}`,
        "Cookie": requestCookies
      }
    }
    $.get(req, async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
        } else {
          var responseCookies = resp.headers['set-cookie'] || [];
          for (var i = 0; i < responseCookies.length; i++) {
            var oneCookie = responseCookies[i];
            oneCookie = oneCookie.split(';');
            requestCookies = requestCookies + oneCookie[0] + ';';
          }
          console.log(`${data}`)
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(JSON.parse(data));
      }
    })
  })
}

function randomNumber (min = 0, max = 100) {
  return Math.min(Math.floor(min + Math.random() * (max - min)), max);
}

function Format (fmt, date) {
  var o = {
    "M+": date.getMonth() + 1, //月份
    "d+": date.getDate(), //日
    "H+": date.getHours(), //小时
    "m+": date.getMinutes(), //分
    "s+": date.getSeconds(), //秒
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度
    "S": date.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

// prettier-ignore
function Env (t, e) { class s { constructor(t) { this.env = t } send (t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get (t) { return this.send.call(this.env, t) } post (t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `${this.name}, 开始!`) } isNode () { return "undefined" != typeof module && !!module.exports } isQuanX () { return "undefined" != typeof $task } isSurge () { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon () { return "undefined" != typeof $loon } toObj (t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr (t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson (t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson (t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript (t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript (t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata () { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata () { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get (t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set (t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata (t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata (t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval (t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval (t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv (t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get (t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post (t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time (t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg (e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============系统通知=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log (...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr (t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `??${this.name}, 错误!`, t.stack) : this.log("", `??${this.name}, 错误!`, t) } wait (t) { return new Promise(e => setTimeout(e, t)) } done (t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `${this.name}, 结束!  ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
