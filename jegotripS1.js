/*
 * @Author: AsVow
 * @LastMod: 2021-12-06 19:13:14
 *
无忧行签到脚本
脚本兼容: QuantumultX, Surge4, Loon, Node.js
⚠️更新说明:
1.新增多账号、多平台通知、随机User-Agent及Node.js支持.
2.为规避网页蜘蛛将敏感字符串转义为十六进制编码.

Cookie说明：分为四部分「 accountid｜mobile｜token｜userid 」
1.打开无忧行点击「 我的 」然后点击「 我的客服 」👉 通知成功写入「 accountid & mobile 」, 点击「 无忧币商城 」 👉 通知成功写入「 token & userid 」.
2.上述步骤完成后, 通知「 Cookie完整 」, 则可使用此签到脚本.
3.「 token 」失效时，重新点击「 无忧币商城 」 👉 通知更新「 token 」成功.
‼️‼️退出登录「 token 」即时失效, 因此添加多账号Cookie需删除APP重新下载, 再登录另一账号, 然后按照上述步骤重新获取.
4.获取Cookie后, 请将Cookie脚本禁用并移除主机名, 以免产生不必要的MITM.

Node.js用户说明: 
1.请自行设置AsVow环境参数, 参考格式:
export AsVow='[{accountid:账号1,mobile:账号1,token:账号1,userid:账号1},{accountid:账号2,mobile:账号2,token:账号2,userid:账号2}]'
2.在环境中或脚本内「 SetVariable 」函数里设置通知参数, 参考文档「 https://asvow.com/param 」.

**********************
QuantumultX 脚本配置:
**********************
[task_local]
# Tasks: JegoTrip
0 9 * * * https://ooxx.be/js/jegotrip.js, tag=无忧行, img-url=https://ooxx.be/own/icon/jegotrip.png, enabled=true

[rewrite_local]
# JegoTrip Cookie
https?:\/\/app\.jegotrip\.com\.cn\/.*(call_phone|logonFree) url script-response-body https://ooxx.be/js/jegotrip.js

[mitm] 
hostname= app.jegotrip.com.cn

**********************
Surge 4.2.0+ 脚本配置:
**********************
[Script]
Tasks: JegoTrip = type=cron,cronexp=0 9 * * *,script-path=https://ooxx.be/js/jegotrip.js

JegoTrip Cookie = type=http-response,pattern=https?:\/\/app\.jegotrip\.com\.cn\/.*(call_phone|logonFree),script-path=https://ooxx.be/js/jegotrip.js, requires-body=true
[MITM] 
hostname= app.jegotrip.com.cn

************************
Loon 2.1.0+ 脚本配置:
************************

[Script]
# Tasks: JegoTrip
cron "0 9 * * *" script-path=https://ooxx.be/js/jegotrip.js

# JegoTrip Cookie
http-response https?:\/\/app\.jegotrip\.com\.cn\/.*(call_phone|logonFree) script-path=https://ooxx.be/js/jegotrip.js, requires-body=true

[Mitm] 
hostname= app.jegotrip.com.cn

*/
const $ = API("无忧行");
const { isNode } = ENV();
const headers = {
    "Accept-Encoding": "gzip, deflate, br",
    "Origin": "\x68\x74\x74\x70\x3a\x2f\x2f\x74\x61\x73\x6b\x2e\x6a\x65\x67\x6f\x74\x72\x69\x70\x2e\x63\x6f\x6d\x2e\x63\x6e\x3a\x38\x30\x38\x30",
    "Accept": "application/json, text/plain, */*",
    "Content-Type": "application/json;charset=utf-8",
    "Connection": "keep-alive",
    "Host": "\x74\x61\x73\x6b\x2e\x6a\x65\x67\x6f\x74\x72\x69\x70\x2e\x63\x6f\x6d\x2e\x63\x6e\x3a\x38\x30\x38\x30",
    "Accept-Language": "en-us",
    "Referer": "\x68\x74\x74\x70\x3a\x2f\x2f\x74\x61\x73\x6b\x2e\x6a\x65\x67\x6f\x74\x72\x69\x70\x2e\x63\x6f\x6d\x2e\x63\x6e\x3a\x38\x30\x38\x30\x2f\x74\x61\x73\x6b\x2f\x69\x6e\x64\x65\x78\x2e\x68\x74\x6d\x6c"
};
// $.delete("AsVow"); //取消本条注释删除所有Cookie
var AsVow = isNode ? process.env.AsVow : $.read("AsVow");
var info = "";

// 多平台通知参数设置
function SetVariable () {
  // 微信server酱
  $.SCKEY = "";
  // pushplus(推送加)
  $.PUSH_PLUS_TOKEN = "";
  $.PUSH_PLUS_USER = "";
  // iOS Bark APP(兼容Bark自建用户)
  $.BARK_PUSH = "";
  $.BARK_SOUND = "";
  $.BARK_GROUP = "";
  // Telegram 机器人
  $.TG_BOT_TOKEN = "";
  $.TG_USER_ID = "";
  $.TG_PROXY_HOST = "";
  $.TG_PROXY_PORT = "";
  $.TG_PROXY_AUTH = "";
  $.TG_API_HOST = "";
  // 钉钉机器人
  $.DD_BOT_TOKEN = "";
  $.DD_BOT_SECRET = "";
  // 企业微信机器人
  $.QYWX_KEY = "";
  // 企业微信应用消息推送
  $.QYWX_AM = "";
  // iGot
  $.IGOT_PUSH_KEY = "";
  // go-cqhttp
  $.GOBOT_URL = "";
  $.GOBOT_TOKEN = "";
  $.GOBOT_QQ = "";
}

!(async () => {
  if (typeof $request != "undefined") {
    GetCookie();
  } else if (AsVow) {
    if (isNode) {
      await SetVariable ();
      AsVow = $.toObj(AsVow.replace(/(['"])?(\w+)(['"])?/g, '"$2"'));
    }
    for (i in AsVow) {
      accountid = AsVow[i].accountid;
      mobile = AsVow[i].mobile;
      token = AsVow[i].token;
      userid = AsVow[i].userid;
      invalid = false;
      if (accountid && mobile && token && userid) {
        star = "";
        for(x in [...Array(mobile.length-6).keys()]) star += "*";
        _mobile = mobile.slice(0,3);
        mobile_ = mobile.slice(-3);
        _mobile_ = _mobile + star + mobile_;
        head = `=== 账号${(+i)+1}：${_mobile_} ===\n`;
        info += `\n${head}`;
        await QuerySign();
        if (invalid) {
          info += `Token已失效‼️\n\n`;
          continue;
        }
        headers["User-Agent"] = GetRandomUA();
        await QuerySign_Old();
        11 == mobile.length ? await QueryVideoTask() : info += "视频任务：+86号码专属‼️\n";
        await Total();
      } else {
        INC_Cookie = $.toStr(AsVow[i]);
        AsVow = $.toObj($.toStr(AsVow).replace(INC_Cookie,"").replace(/,]*$/, "]"));
        $.write(AsVow,"AsVow");
        $.error(`⚠️自动删除不完整的Cookie\n ${INC_Cookie}`);
      }
    }
    $.info(info);
    $.notify($.name, "", info);
  } else {
    info = "签到失败：请先获取Cookie⚠️";
    $.error(info);
    $.notify($.name, "", info);
  }
})().finally(() => {
  $.done();
});


function Total() {
  const url = "\x68\x74\x74\x70\x73\x3a\x2f\x2f\x61\x70\x70\x2e\x6a\x65\x67\x6f\x74\x72\x69\x70\x2e\x63\x6f\x6d\x2e\x63\x6e\x2f\x61\x70\x69\x2f\x73\x65\x72\x76\x69\x63\x65\x2f\x75\x73\x65\x72\x2f\x76\x31\x2f\x67\x65\x74\x55\x73\x65\x72\x41\x73\x73\x65\x74\x73\x3f\x6c\x61\x6e\x67\x3d\x7a\x68\x5f\x63\x6e\x26\x74\x6f\x6b\x65\x6e\x3d" + token;
  const body = `{"token":"${token}"}`;
  headers["Host"] = "\x61\x70\x70\x2e\x6a\x65\x67\x6f\x74\x72\x69\x70\x2e\x63\x6f\x6d\x2e\x63\x6e";
  headers["Referer"] = "\x68\x74\x74\x70\x3a\x2f\x2f\x74\x61\x73\x6b\x2e\x6a\x65\x67\x6f\x74\x72\x69\x70\x2e\x63\x6f\x6d\x2e\x63\x6e\x3a\x38\x30\x38\x30\x2f";
  const request = {
      url: url,
      headers: headers,
      body: body
  };
  return new Promise(resolve => {
    $.http.post(request)
      .then((resp) => {
        $.log(`\nTotal body: \n${$.toStr(resp)}`);
        data = $.toObj(resp.body);
        total = data.body.tripCoins;
        info += `无忧币总计：${total}💰\n`;
      })
      .catch((err) => {
        const error = "账号信息获取失败⚠️";
        $.error(error + "\n" + err);
        $.notify($.name, "", `${head+error}请查看日志‼️`);
      })
       .finally(() => {
        resolve();
      });
  });
}


function QuerySign() {
  const url = "\x68\x74\x74\x70\x73\x3a\x2f\x2f\x61\x70\x70\x2e\x6a\x65\x67\x6f\x74\x72\x69\x70\x2e\x63\x6f\x6d\x2e\x63\x6e\x2f\x61\x70\x69\x2f\x73\x65\x72\x76\x69\x63\x65\x2f\x76\x31\x2f\x6d\x69\x73\x73\x69\x6f\x6e\x2f\x73\x69\x67\x6e\x2f\x71\x75\x65\x72\x79\x53\x69\x67\x6e\x3f\x74\x6f\x6b\x65\x6e\x3d" + token;
  headers["Origin"] = "\x68\x74\x74\x70\x73\x3a\x2f\x2f\x63\x64\x6e\x2e\x6a\x65\x67\x6f\x74\x72\x69\x70\x2e\x63\x6f\x6d\x2e\x63\x6e";
  headers["Host"] = "\x61\x70\x70\x2e\x6a\x65\x67\x6f\x74\x72\x69\x70\x2e\x63\x6f\x6d\x2e\x63\x6e";
  headers["User-Agent"] = "\x4d\x6f\x7a\x69\x6c\x6c\x61\x2f\x34\x2e\x30\x20\x4d\x44\x4e\x20\x45\x78\x61\x6d\x70\x6c\x65";
  headers["Referer"] = "\x68\x74\x74\x70\x73\x3a\x2f\x2f\x63\x64\x6e\x2e\x6a\x65\x67\x6f\x74\x72\x69\x70\x2e\x63\x6f\x6d\x2e\x63\x6e\x2f";
  const request = {
      url: url,
      headers: headers
  };
  return new Promise(resolve => {
    $.http.post(request)
      .then(async (resp) => {
        $.log(`\nQuerySign body: \n${resp}`);
        data = resp.body;
        if (data.includes("成功")) {
          data = $.toObj(data);
          list = data.body.reverse();
          for (var i in list) {
            isSign = list[i].isSign;
            if (isSign == "3") {
              info += `签到失败：今日已签到‼️\n`;
              break;
            } else if (isSign == "2") {
              id = list[i].id;
              rewardCoin = list[i].rewardCoin;
              await UserSign(headers);
              break;
            }
          }
        } else if (data.includes("不正确")) {
          invalid = true;
          $.notify($.name, "", `${head}\nToken已失效‼️`);
        }
      })
      .catch((err) => {
        const error = "🆕签到状态获取失败⚠️";
        $.error(error + "\n" + err);
        $.notify($.name, "", `${head+error}请查看日志‼️`);
      })
      .finally(() => {
        resolve();
      });
  });
}


function UserSign(headers) {
  const url = "\x68\x74\x74\x70\x73\x3a\x2f\x2f\x61\x70\x70\x2e\x6a\x65\x67\x6f\x74\x72\x69\x70\x2e\x63\x6f\x6d\x2e\x63\x6e\x2f\x61\x70\x69\x2f\x73\x65\x72\x76\x69\x63\x65\x2f\x76\x31\x2f\x6d\x69\x73\x73\x69\x6f\x6e\x2f\x73\x69\x67\x6e\x2f\x75\x73\x65\x72\x53\x69\x67\x6e\x3f\x74\x6f\x6b\x65\x6e\x3d" + token;
  const body = `{"signConfigId":"${id}"}`;
  const request = {
      url: url,
      headers: headers,
      body: body
  };
  return new Promise(resolve => {
    $.http.post(request)
      .then((resp) => {
        $.log(`\nUserSign body: \n${resp}`);
        data = resp.body;
        if (data.includes("成功")) {
          info += `签到成功：无忧币 +${rewardCoin}🎉\n`;
        }
      })
      .catch((err) => {
        const error = "🆕签到失败⚠️";
        $.error(error + "\n" + err);
        $.notify($.name, "", `${head+error}请查看日志‼️`);
      })
      .finally(() => {
        resolve();
      });
  });
}


function QuerySign_Old() {
  delete headers["Origin"];
  const url = "\x68\x74\x74\x70\x3a\x2f\x2f\x74\x61\x73\x6b\x2e\x6a\x65\x67\x6f\x74\x72\x69\x70\x2e\x63\x6f\x6d\x2e\x63\x6e\x3a\x38\x30\x38\x30\x2f\x61\x70\x70\x2f\x74\x61\x73\x6b\x73\x3f\x75\x73\x65\x72\x69\x64\x3d" + userid;
  const request = {
      url: url,
      headers: headers
  };
  return new Promise(resolve => {
    $.http.get(request)
      .then(async (resp) => {
        $.log(`\nQuerySign_Old body: \n${resp}`);
        data = $.toObj(resp.body);
        list = data.rtn.tasks["日常任务"][0];
        status = list.triggerAction;
        if (status == "已签到") {
          info += info.match(mobile_ + ".*\n.*" + "失败") ? `` : `签到失败：今日已签到🍷‼️\n`;
        } else {
          coins = list.credits;
          taskid = list.id;
          await Checkin();
        }
      })
      .catch((err) => {
        const error = "签到状态获取失败⚠️";
        $.error(error + "\n" + err);
        $.notify($.name, "", `${head+error}请查看日志‼️`);
      })
      .finally(() => {
        resolve();
      });
  });
}


function Checkin() {
  const url = "\x68\x74\x74\x70\x3a\x2f\x2f\x74\x61\x73\x6b\x2e\x6a\x65\x67\x6f\x74\x72\x69\x70\x2e\x63\x6f\x6d\x2e\x63\x6e\x3a\x38\x30\x38\x30\x2f\x61\x70\x70\x2f\x73\x69\x67\x6e";
  const body = `{
      "userid":"${userid}",
      "taskId":"${taskid}"
  }`;
  const request = {
      url: url,
      headers: headers,
      body: body
  };
  return new Promise(resolve => {
    $.http.post(request)
      .then((resp) => {
        $.log(`\nCheckin body: \n${resp}`);
        data = resp.body;
        if (data.includes("true")) {
          reger = new RegExp(_mobile + ".*" + mobile_ + ".*\n.*" + rewardCoin,"gm");
          info.match(reger) ? info = info.replace(reger,`${_mobile_} ===\n签到成功：无忧币 +${(+rewardCoin)+(+coins)}`) : info += `签到成功：无忧币 +${coins}🍷🎉\n`;
        }
      })
      .catch((err) => {
        const error = "签到失败⚠️";
        $.error(error + "\n" + err);
        $.notify($.name, "", `${head+error}请查看日志‼️`);
      })
      .finally(() => {
        resolve();
      });
  });
}


function QueryVideoTask() {
  const url = "\x68\x74\x74\x70\x73\x3a\x2f\x2f\x75\x64\x73\x2d\x69\x2e\x63\x6d\x69\x73\x68\x6f\x77\x2e\x63\x6f\x6d\x3a\x31\x34\x34\x33\x2f\x75\x64\x73\x2f\x63\x6c\x6f\x75\x64\x2f\x77\x61\x74\x63\x68\x2f\x6c\x69\x73\x74\x3f\x76\x65\x72\x73\x69\x6f\x6e\x3d\x31";
  headers["Origin"] = "\x68\x74\x74\x70\x73\x3a\x2f\x2f\x69\x73\x68\x6f\x77\x2e\x6a\x65\x67\x6f\x74\x72\x69\x70\x2e\x63\x6f\x6d\x2e\x63\x6e";
  headers["Host"] = "\x75\x64\x73\x2d\x69\x2e\x63\x6d\x69\x73\x68\x6f\x77\x2e\x63\x6f\x6d\x3a\x31\x34\x34\x33'";
  headers["Referer"] = "\x68\x74\x74\x70\x73\x3a\x2f\x2f\x69\x73\x68\x6f\x77\x2e\x6a\x65\x67\x6f\x74\x72\x69\x70\x2e\x63\x6f\x6d\x2e\x63\x6e\x2f";
  const body = `{
      "userId":"${accountid}",
      "accountId":"${mobile}"
  }`;
  const request = {
      url: url,
      headers: headers,
      body: body
  };
  return new Promise(resolve => {
    $.http.post(request)
      .then(async (resp) => {
        $.log(`\nQueryVideoTask body: \n${resp}`);
        data = resp.body;
        if (data.includes('"exchangeNum":10,')) {
          info += `视频任务：今日已完成‼️\n`;
        } else {
          await VideoTask(headers);
        }
      })
      .catch((err) => {
        const error = "视频任务信息获取失败⚠️";
        $.error(error + "\n" + err);
        $.notify($.name, "", `${head+error}请查看日志‼️`);
      })
      .finally(() => {
        resolve();
      });
  });
}


function VideoTask(headers) {
  const url = "\x68\x74\x74\x70\x73\x3a\x2f\x2f\x75\x64\x73\x2d\x69\x2e\x63\x6d\x69\x73\x68\x6f\x77\x2e\x63\x6f\x6d\x3a\x31\x34\x34\x33\x2f\x75\x64\x73\x2f\x63\x6c\x6f\x75\x64\x2f\x77\x61\x74\x63\x68\x2f\x75\x70\x64\x61\x74\x65\x3f\x76\x65\x72\x73\x69\x6f\x6e\x3d\x31";
  headers["Referer"] = "\x68\x74\x74\x70\x73\x3a\x2f\x2f\x69\x73\x68\x6f\x77\x2e\x6a\x65\x67\x6f\x74\x72\x69\x70\x2e\x63\x6f\x6d\x2e\x63\x6e\x2f\x66\x72\x65\x65\x53\x74\x79\x6c\x65\x54\x6f\x75\x72\x69\x73\x6d\x2f\x64\x65\x74\x61\x69\x6c";
  const body = `{
      "userId":"${accountid}",
      "userWatchTime":"10.0",
      "accountId":"${mobile}"
  }`;
  const request = {
      url: url,
      headers: headers,
      body: body
  };
  return new Promise(resolve => {
    $.http.post(request)
      .then(async (resp) => {
        $.log(`\nVideoTask body: \n${resp}`);
        data = resp.body;
        if (data.includes("update success")) {
          await Exchange(headers);
        }
      })
      .catch((err) => {
        const error = "视频任务失败⚠️";
        $.error(error + "\n" + err);
        $.notify($.name, "", `${head+error}请查看日志‼️`);
      })
      .finally(() => {
        resolve();
      });
  });
}


function Exchange(headers) {
  const url = "\x68\x74\x74\x70\x73\x3a\x2f\x2f\x75\x64\x73\x2d\x69\x2e\x63\x6d\x69\x73\x68\x6f\x77\x2e\x63\x6f\x6d\x3a\x31\x34\x34\x33\x2f\x75\x64\x73\x2f\x63\x6c\x6f\x75\x64\x2f\x77\x61\x74\x63\x68\x2f\x65\x78\x63\x68\x61\x6e\x67\x65\x3f\x76\x65\x72\x73\x69\x6f\x6e\x3d\x31";
  headers["Referer"] = "\x68\x74\x74\x70\x73\x3a\x2f\x2f\x69\x73\x68\x6f\x77\x2e\x6a\x65\x67\x6f\x74\x72\x69\x70\x2e\x63\x6f\x6d\x2e\x63\x6e\x2f\x66\x72\x65\x65\x53\x74\x79\x6c\x65\x54\x6f\x75\x72\x69\x73\x6d\x2f\x61\x63\x74\x69\x76\x69\x74\x79";
  const body = `{
      "userId":"${accountid}",
      "exchangeTime":10,
      "exchangeNum":10,
      "accountId":"${mobile}"
  }`;
  const request = {
      url: url,
      headers: headers,
      body: body
  };
  return new Promise(resolve => {
    $.http.post(request)
      .then((resp) => {
        $.log(`\nExchange body: \n${resp}`);
        data = resp.body;
        if (data.includes('"exchangeNum":10,')) {
          info += "视频任务：无忧币 +10🎉\n";
        } else {
          $.error(`\n${head}\n兑换失败⚠️`);
          res = $.toObj(data.replace(".",""));
          info += `视频任务：${res.mes}‼️\n`;
        }
      })
      .catch((err) => {
        const error = "兑换失败⚠️";
        $.error(error + "\n" + err);
        $.notify($.name, "", `${head+error}请查看日志‼️`);
      })
      .finally(() => {
        resolve();
      });
  });
}


function GetCookie() {
  const { headers, url, method } = $request;
  const { body } = $response;
  if (url.includes("accountid") && url.includes("call_phone")) {
    const accountid = url.match(/accountid=(\d+)/)[1];
    const mobile = url.match(/call_phone=(\d+)/)[1];
    SetCookie("accountid",accountid,"mobile",mobile);
  }
  if (url.includes("logonFree") && body.includes("uid")) {
    const token = url.match(/token=(\w+)/)[1];
    const userid = body.match(/uid=(\w+)/)[1];
    SetCookie("token",token,"userid",userid);
  }
  if (info.length > 10) {
    $.notify($.name, "", info);
  }
  if (info.includes("\n")) {
    info = `=== 账号${AsVow.length}：${AsVow.pop().mobile} ===\nCookie完整🎉`;
    $.notify($.name, "", info);
  }
}


function SetCookie(k1,v1,k2,v2) {
  if (typeof AsVow != "undefined") {
    if (!$.toStr(AsVow).includes(`"${k1}":"${v1}","${k2}":"${v2}"`)) {
      i = AsVow.length;
      if (k1 == "token"){
        for (j in AsVow) {
          if (AsVow[j].userid == v2) {
            info = `=== 账号 ${AsVow[j].mobile} ===\n`
            AsVow[j][k1] = v1;
            $.write(AsVow, "AsVow");
            $.read("AsVow") == AsVow ? info = "更新token成功🎉" : info = "更新token失败‼️";
            return;
          }
        }
      }
      if (Object.keys(AsVow[i-1]).length < 4){
        AsVow[i-1][k1] = v1;
        AsVow[i-1][k2] = v2;
      } else {
        AsVow[i] = {[k1]:v1,[k2]:v2};
      }
      $.write(AsVow, "AsVow");
      $.read("AsVow") == AsVow ? info = `写入 ${k1} & ${k2} 成功🎉` : info = `写入 ${k1} & ${k2} 失败‼️`;
    }
  } else {
    AsVow = [{[k1]:v1,[k2]:v2}];
    $.write(AsVow, "AsVow");
      $.read("AsVow") == AsVow ? info = `写入 ${k1} & ${k2} 成功🎉` : info = `写入 ${k1} & ${k2} 失败‼️`;
  }
  Cookie = $.toStr(AsVow[AsVow.length-1]);
  if (Cookie.match("accountid.*mobile") && Cookie.match("token.*userid")) {
    info += `\n`;
  }
}

// 随机 User-Agent
function GetRandomUA() {
  const USER_AGENTS=["Mozilla/5.0 (Linux; Android 10; ONEPLUS A5010 Build/QKQ1.191014.012; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36 source/jegotrip","Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 source/jegotrip","Mozilla/5.0 (Linux; Android 9; Mi Note 3 Build/PKQ1.181007.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/045131 Mobile Safari/537.36 source/jegotrip","Mozilla/5.0 (Linux; Android 10; GM1910 Build/QKQ1.190716.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36 source/jegotrip","Mozilla/5.0 (Linux; Android 9; 16T Build/PKQ1.190616.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36 source/jegotrip","Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 source/jegotrip","Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 source/jegotrip","Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 source/jegotrip","Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 source/jegotrip","Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 source/jegotrip","Mozilla/5.0 (iPhone; CPU iPhone OS 13_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 source/jegotrip","Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 source/jegotrip","Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 source/jegotrip","Mozilla/5.0 (iPhone; CPU iPhone OS 13_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 source/jegotrip","Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 source/jegotrip","Mozilla/5.0 (Linux; Android 9; MI 6 Build/PKQ1.190118.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36 source/jegotrip","Mozilla/5.0 (Linux; Android 11; Redmi K30 5G Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045511 Mobile Safari/537.36 source/jegotrip","Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15F79 source/jegotrip","Mozilla/5.0 (Linux; Android 10; M2006J10C Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36 source/jegotrip","Mozilla/5.0 (Linux; Android 10; M2006J10C Build/QP1A.190711.020; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36 source/jegotrip","Mozilla/5.0 (Linux; Android 10; ONEPLUS A6000 Build/QKQ1.190716.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045224 Mobile Safari/537.36 source/jegotrip","Mozilla/5.0 (Linux; Android 9; MHA-AL00 Build/HUAWEIMHA-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36 source/jegotrip","Mozilla/5.0 (Linux; Android 8.1.0; 16 X Build/OPM1.171019.026; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36 source/jegotrip","Mozilla/5.0 (Linux; Android 8.0.0; HTC U-3w Build/OPR6.170623.013; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/044942 Mobile Safari/537.36 source/jegotrip","Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 source/jegotrip","Mozilla/5.0 (Linux; Android 10; LYA-AL00 Build/HUAWEILYA-AL00L; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045230 Mobile Safari/537.36 source/jegotrip","Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 source/jegotrip","Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 source/jegotrip","Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 source/jegotrip","Mozilla/5.0 (Linux; Android 8.1.0; MI 8 Build/OPM1.171019.026; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/66.0.3359.126 MQQBrowser/6.2 TBS/045131 Mobile Safari/537.36 source/jegotrip","Mozilla/5.0 (Linux; Android 10; Redmi K20 Pro Premium Edition Build/QKQ1.190825.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045227 Mobile Safari/537.36 source/jegotrip","Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 source/jegotrip","Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 source/jegotrip","Mozilla/5.0 (Linux; Android 11; Redmi K20 Pro Premium Edition Build/RKQ1.200826.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045513 Mobile Safari/537.36 source/jegotrip","Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/77.0.3865.120 MQQBrowser/6.2 TBS/045227 Mobile Safari/537.36 source/jegotrip","Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 source/jegotrip"];
  const RANDOM_UA = USER_AGENTS[Math.min(Math.floor(Math.random() * USER_AGENTS.length), USER_AGENTS.length)];
  return RANDOM_UA;
}

// prettier-ignore
/*********************************** API *************************************/
function ENV(){const t="undefined"!=typeof $task,e="undefined"!=typeof $loon,s="undefined"!=typeof $httpClient&&!e,o="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:t,isLoon:e,isSurge:s,isNode:"function"==typeof require&&!o,isJSBox:o,isRequest:"undefined"!=typeof $request,isScriptable:"undefined"!=typeof importModule}}function HTTP(t={baseURL:""}){const{isQX:e,isLoon:s,isSurge:o,isScriptable:i,isNode:n}=ENV(),r=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;const h={};return["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach(c=>h[c.toLowerCase()]=(h=>(function(h,c){c="string"==typeof c?{url:c}:c;const l=t.baseURL;l&&!r.test(c.url||"")&&(c.url=l?l+c.url:c.url),c&&c.body&&c.headers&&!c.headers["Content-Type"]&&(c.headers["Content-Type"]="application/x-www-form-urlencoded");const a=(c={...t,...c}).timeout,_={...{onRequest:()=>{},onResponse:t=>t,onTimeout:()=>{}},...c.events};let p,u;if(_.onRequest(h,c),e)p=$task.fetch({method:h,...c});else if(s||o||n)p=new Promise((t,e)=>{(n?require("request"):$httpClient)[h.toLowerCase()](c,(s,o,i)=>{s?e(s):t({statusCode:o.status||o.statusCode,headers:o.headers,body:i})})});else if(i){const t=new Request(c.url);t.method=h,t.headers=c.headers,t.body=c.body,p=new Promise((e,s)=>{t.loadString().then(s=>{e({statusCode:t.response.statusCode,headers:t.response.headers,body:s})}).catch(t=>s(t))})}const d=a?new Promise((t,e)=>{u=setTimeout(()=>(_.onTimeout(),e(`${h} URL: ${c.url} exceeds the timeout ${a} ms`)),a)}):null;return(d?Promise.race([d,p]).then(t=>(clearTimeout(u),t)):p).then(t=>_.onResponse(t))})(c,h))),h}function API(t="untitled",e=!1){const{isQX:s,isLoon:o,isSurge:i,isNode:n,isJSBox:r,isScriptable:h}=ENV();return new class{constructor(t,e){this.name=t,this.debug=e,this.http=HTTP(),this.env=ENV(),this.node=(()=>{if(n){return{fs:require("fs")}}return null})(),this.initCache();Promise.prototype.delay=function(t){return this.then(function(e){return((t,e)=>new Promise(function(s){setTimeout(s.bind(null,e),t)}))(t,e)})}}initCache(){if(s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(o||i)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),n){let t="root.json";this.node.fs.existsSync(t)||this.node.fs.writeFileSync(t,JSON.stringify({}),{flag:"wx"},t=>console.log(t)),this.root={},t=`${this.name}.json`,this.node.fs.existsSync(t)?this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(t,JSON.stringify({}),{flag:"wx"},t=>console.log(t)),this.cache={})}}persistCache(){const t=JSON.stringify(this.cache,null,2);s&&$prefs.setValueForKey(t,this.name),(o||i)&&$persistentStore.write(t,this.name),n&&(this.node.fs.writeFileSync(`${this.name}.json`,t,{flag:"w"},t=>console.log(t)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root,null,2),{flag:"w"},t=>console.log(t)))}write(t,e){if(this.log(`SET ${e}`),-1!==e.indexOf("#")){if(e=e.substr(1),i||o)return $persistentStore.write(t,e);if(s)return $prefs.setValueForKey(t,e);n&&(this.root[e]=t)}else this.cache[e]=t;this.persistCache()}read(t){return this.log(`READ ${t}`),-1===t.indexOf("#")?this.cache[t]:(t=t.substr(1),i||o?$persistentStore.read(t):s?$prefs.valueForKey(t):n?this.root[t]:void 0)}delete(t){if(this.log(`DELETE ${t}`),-1!==t.indexOf("#")){if(t=t.substr(1),i||o)return $persistentStore.write(null,t);if(s)return $prefs.removeValueForKey(t);n&&delete this.root[t]}else delete this.cache[t];this.persistCache()}notify(t,e="",c="",l={}){const a=l["open-url"],_=l["media-url"];if(s&&$notify(t,e,c,l),i&&$notification.post(t,e,c+`${_?"\n多媒体:"+_:""}`,{url:a}),o){let s={};a&&(s.openUrl=a),_&&(s.mediaUrl=_),"{}"===JSON.stringify(s)?$notification.post(t,e,c):$notification.post(t,e,c,s)}if(n)return new Promise(async s=>{const o=(e?`${e}\n`:"")+c+(a?`\n点击跳转: ${a}`:"")+(_?"\n多媒体: "+_:"");await this.sendNotify(t,o,{url:a}),s()});if(h){const s=c+(a?`\n点击跳转: ${a}`:"")+(_?`\n多媒体: ${_}`:"");if(r){require("push").schedule({title:t,body:(e?e+"\n":"")+s})}else console.log(`${t}\n${e}\n${s}\n\n`)}}sendNotify(t,e,s={},o="\n\n仅供用于学习 https://ooxx.be/js"){return new Promise(async i=>{this.querystring=require("querystring"),this.timeout=this.timeout||"15000",e+=o,this.setParam(),await Promise.all([this.serverNotify(t,e),this.pushPlusNotify(t,e)]),t=t.match(/.*?(?=\s?-)/g)?t.match(/.*?(?=\s?-)/g)[0]:t,await Promise.all([this.BarkNotify(t,e,s),this.tgBotNotify(t,e),this.ddBotNotify(t,e),this.qywxBotNotify(t,e),this.qywxamNotify(t,e),this.iGotNotify(t,e,s),this.gobotNotify(t,e)])})}setParam(){this.SCKEY=process.env.SCKEY||this.SCKEY,this.PUSH_PLUS_TOKEN=process.env.PUSH_PLUS_TOKEN||this.PUSH_PLUS_TOKEN,this.PUSH_PLUS_USER=process.env.PUSH_PLUS_USER||this.PUSH_PLUS_USER,this.BARK_PUSH=process.env.BARK_PUSH||this.BARK_PUSH,this.BARK_SOUND=process.env.BARK_SOUND||this.BARK_SOUND,this.BARK_GROUP=process.env.BARK_GROUP||"AsVow",this.BARK_PUSH&&!this.BARK_PUSH.includes("http")&&(this.BARK_PUSH=`https://api.day.app/${this.BARK_PUSH}`),this.TG_BOT_TOKEN=process.env.TG_BOT_TOKEN||this.TG_BOT_TOKEN,this.TG_USER_ID=process.env.TG_USER_ID||this.TG_USER_ID,this.TG_PROXY_AUTH=process.env.TG_PROXY_AUTH||this.TG_PROXY_AUTH,this.TG_PROXY_HOST=process.env.TG_PROXY_HOST||this.TG_PROXY_HOST,this.TG_PROXY_PORT=process.env.TG_PROXY_PORT||this.TG_PROXY_PORT,this.TG_API_HOST=process.env.TG_API_HOST||"api.telegram.org",this.DD_BOT_TOKEN=process.env.DD_BOT_TOKEN||this.DD_BOT_TOKEN,this.DD_BOT_SECRET=process.env.DD_BOT_SECRET||this.DD_BOT_SECRET,this.QYWX_KEY=process.env.QYWX_KEY||this.QYWX_KEY,this.QYWX_AM=process.env.QYWX_AM||this.QYWX_AM,this.IGOT_PUSH_KEY=process.env.IGOT_PUSH_KEY||this.IGOT_PUSH_KEY,this.GOBOT_URL=process.env.GOBOT_URL||this.GOBOT_URL,this.GOBOT_TOKEN=process.env.GOBOT_TOKEN||this.GOBOT_TOKEN,this.GOBOT_QQ=process.env.GOBOT_QQ||this.GOBOT_QQ}serverNotify(t,e,s=2100){return new Promise(o=>{if(this.SCKEY){e=e.replace(/[\n\r]/g,"\n\n");const i={url:this.SCKEY.includes("SCT")?`https://sctapi.ftqq.com/${this.SCKEY}.send`:`https://sc.ftqq.com/${this.SCKEY}.send`,body:`text=${t}&desp=${e}`,headers:{"Content-Type":"application/x-www-form-urlencoded"},timeout:this.timeout};setTimeout(()=>{this.http.post(i).then(t=>{const e=this.toObj(t.body);0===e.errno||0===e.data.errno?console.log("server酱发送通知消息成功🎉\n"):1024===e.errno?console.log(`server酱发送通知消息异常: ${e.errmsg}\n`):console.log(`server酱发送通知消息异常\n${this.toStr(e)}`)}).catch(t=>{console.log("server酱发送通知调用API失败！！\n"),this.error(t)}).finally(()=>{o()})},s)}else o()})}pushPlusNotify(t,e){return new Promise(s=>{if(this.PUSH_PLUS_TOKEN){e=e.replace(/[\n\r]/g,"<br>");const o={token:`${this.PUSH_PLUS_TOKEN}`,title:`${t}`,content:`${e}`,topic:`${this.PUSH_PLUS_USER}`},i={url:"https://www.pushplus.plus/send",body:this.toStr(o),headers:{"Content-Type":" application/json"},timeout:this.timeout};this.http.post(i).then(t=>{const e=this.toObj(t.body);200===e.code?console.log(`push+发送${this.PUSH_PLUS_USER?"一对多":"一对一"}通知消息完成。\n`):console.log(`push+发送${this.PUSH_PLUS_USER?"一对多":"一对一"}通知消息失败：${e.msg}\n`)}).catch(t=>{console.log(`push+发送${this.PUSH_PLUS_USER?"一对多":"一对一"}通知消息失败！！\n`),this.error(t)}).finally(()=>{s()})}else s()})}BarkNotify(t,e,s={}){return new Promise(o=>{if(this.BARK_PUSH){const i={url:`${this.BARK_PUSH}/${encodeURIComponent(t)}/${encodeURIComponent(e)}?sound=${this.BARK_SOUND}&group=${this.BARK_GROUP}&${this.querystring.stringify(s)}`,headers:{"Content-Type":"application/x-www-form-urlencoded"},timeout:this.timeout};this.http.get(i).then(t=>{const e=this.toObj(t.body);200===e.code?console.log("Bark APP发送通知消息成功🎉\n"):console.log(`${e.message}\n`)}).catch(t=>{console.log("Bark APP发送通知调用API失败！！\n"),this.error(t)}).finally(()=>{o()})}else o()})}tgBotNotify(t,e){return new Promise(s=>{if(this.TG_BOT_TOKEN&&this.TG_USER_ID){const o={url:`https://${this.TG_API_HOST}/bot${this.TG_BOT_TOKEN}/sendMessage`,body:`chat_id=${this.TG_USER_ID}&text=${t}\n\n${e}&disable_web_page_preview=true`,headers:{"Content-Type":"application/x-www-form-urlencoded"},timeout:this.timeout};if(this.TG_PROXY_HOST&&this.TG_PROXY_PORT){const t={host:this.TG_PROXY_HOST,port:1*this.TG_PROXY_PORT,proxyAuth:this.TG_PROXY_AUTH};Object.assign(o,{proxy:t})}this.http.post(o).then(t=>{const e=this.toObj(t.body);e.ok?console.log("Telegram发送通知消息成功🎉。\n"):400===e.error_code?console.log("请主动给bot发送一条消息并检查接收用户ID是否正确。\n"):401===e.error_code&&console.log("Telegram bot token 填写错误。\n")}).catch(t=>{console.log("Telegram发送通知消息失败！！\n"),this.error(t)}).finally(()=>{s()})}else s()})}ddBotNotify(t,e){return new Promise(s=>{const o={url:`https://oapi.dingtalk.com/robot/send?access_token=${this.DD_BOT_TOKEN}`,json:{msgtype:"text",text:{content:` ${t}\n\n${e}`}},headers:{"Content-Type":"application/json"},timeout:this.timeout};if(this.DD_BOT_TOKEN&&this.DD_BOT_SECRET){const t=require("crypto"),e=Date.now(),i=t.createHmac("sha256",this.DD_BOT_SECRET);i.update(`${e}\n${this.DD_BOT_SECRET}`);const n=encodeURIComponent(i.digest("base64"));o.url=`${o.url}&timestamp=${e}&sign=${n}`,this.http.post(o).then(t=>{const e=this.toObj(t.body);0===e.errcode?console.log("钉钉发送通知消息成功🎉。\n"):console.log(`${e.errmsg}\n`)}).catch(t=>{console.log("钉钉发送通知消息失败！！\n"),this.error(t)}).finally(()=>{s()})}else this.DD_BOT_TOKEN?this.http.post(o).then(t=>{const e=this.toObj(t.body);0===e.errcode?console.log("钉钉发送通知消息完成。\n"):console.log(`${e.errmsg}\n`)}).catch(t=>{console.log("钉钉发送通知消息失败！！\n"),this.error(t)}).finally(()=>{s()}):s()})}qywxBotNotify(t,e){return new Promise(s=>{const o={url:`https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${this.QYWX_KEY}`,json:{msgtype:"text",text:{content:` ${t}\n\n${e}`}},headers:{"Content-Type":"application/json"},timeout:this.timeout};this.QYWX_KEY?this.http.post(o).then(t=>{const e=this.toObj(t.body);0===e.errcode?console.log("企业微信发送通知消息成功🎉。\n"):console.log(`${e.errmsg}\n`)}).catch(t=>{console.log("企业微信发送通知消息失败！！\n"),this.error(t)}).finally(()=>{s()}):s()})}ChangeUserId(t){if(this.QYWX_AM_AY=this.QYWX_AM.split(","),this.QYWX_AM_AY[2]){const e=this.QYWX_AM_AY[2].split("|");let s="";for(let o=0;o<e.length;o++){const i="签到号 "+(o+1);t.match(i)&&(s=e[o])}return s||(s=this.QYWX_AM_AY[2]),s}return"@all"}qywxamNotify(t,e){return new Promise(s=>{if(this.QYWX_AM){this.QYWX_AM_AY=this.QYWX_AM.split(",");const o={url:"https://qyapi.weixin.qq.com/cgi-bin/gettoken",json:{corpid:`${this.QYWX_AM_AY[0]}`,corpsecret:`${this.QYWX_AM_AY[1]}`},headers:{"Content-Type":"application/json"},timeout:this.timeout};let i;this.http.post(o).then(s=>{const o=e.replace(/\n/g,"<br/>"),n=this.toObj(s.body).access_token;switch(this.QYWX_AM_AY[4]){case"0":i={msgtype:"textcard",textcard:{title:`${t}`,description:`${e}`,url:"https://ooxx.be/js",btntxt:"更多"}};break;case"1":i={msgtype:"text",text:{content:`${t}\n\n${e}`}};break;default:i={msgtype:"mpnews",mpnews:{articles:[{title:`${t}`,thumb_media_id:`${this.QYWX_AM_AY[4]}`,author:"智能助手",content_source_url:"",content:`${o}`,digest:`${e}`}]}}}this.QYWX_AM_AY[4]||(i={msgtype:"text",text:{content:`${t}\n\n${e}`}}),i={url:`https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${n}`,json:{touser:`${this.ChangeUserId(e)}`,agentid:`${this.QYWX_AM_AY[3]}`,safe:"0",...i},headers:{"Content-Type":"application/json"}}}),this.http.post(i).then(t=>{const s=this.toObj(s);0===s.errcode?console.log("成员ID:"+this.ChangeUserId(e)+"企业微信应用消息发送通知消息成功🎉。\n"):console.log(`${s.errmsg}\n`)}).catch(t=>{console.log("成员ID:"+this.ChangeUserId(e)+"企业微信应用消息发送通知消息失败！！\n"),this.error(t)}).finally(()=>{s()})}else s()})}iGotNotify(t,e,s={}){return new Promise(o=>{if(this.IGOT_PUSH_KEY){if(this.IGOT_PUSH_KEY_REGX=new RegExp("^[a-zA-Z0-9]{24}$"),!this.IGOT_PUSH_KEY_REGX.test(this.IGOT_PUSH_KEY))return console.log("您所提供的IGOT_PUSH_KEY无效\n"),void o();const i={url:`https://push.hellyw.com/${this.IGOT_PUSH_KEY.toLowerCase()}`,body:`title=${t}&content=${e}&${this.querystring.stringify(s)}`,headers:{"Content-Type":"application/x-www-form-urlencoded"},timeout:this.timeout};this.http.post(i).then(t=>{const e=this.toObj(t.body);0===e.ret?console.log("iGot发送通知消息成功🎉\n"):console.log(`iGot发送通知消息失败：${e.errMsg}\n`)}).catch(t=>{console.log("iGot发送通知调用API失败！！\n"),this.error(t)}).finally(()=>{o()})}else o()})}gobotNotify(t,e,s=2100){return new Promise(o=>{if(this.GOBOT_URL){const i={url:`${this.GOBOT_URL}?access_token=${this.GOBOT_TOKEN}&${this.GOBOT_QQ}`,body:`message=${t}\n${e}`,headers:{"Content-Type":"application/x-www-form-urlencoded"},timeout:this.timeout};setTimeout(()=>{this.http.post(i).then(t=>{const e=this.toObj(t.body);0===e.retcode?console.log("go-cqhttp发送通知消息成功🎉\n"):100===e.retcode?console.log(`go-cqhttp发送通知消息异常: ${e.errmsg}\n`):console.log(`go-cqhttp发送通知消息异常\n${this.toStr(e)}`)}).catch(t=>{console.log("发送go-cqhttp通知调用API失败！！\n"),this.error(t)}).finally(()=>{o()})},s)}else o()})}log(t){this.debug&&console.log(`[${this.name}] LOG: ${this.toStr(t)}`)}info(t){console.log(`[${this.name}] INFO: ${this.toStr(t)}`)}error(t){console.log(`[${this.name}] ERROR: ${this.toStr(t)}`)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){s||o||i?$done(t):n&&!r&&"undefined"!=typeof $context&&($context.headers=t.headers,$context.statusCode=t.statusCode,$context.body=t.body)}toObj(t){if("object"==typeof t||t instanceof Object)return t;try{return JSON.parse(t)}catch(e){return t}}toStr(t){if("string"==typeof t||t instanceof String)return t;try{return JSON.stringify(t)}catch(e){return t}}}(t,e)}
/*****************************************************************************/
