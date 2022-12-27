const axios = require("axios")
const md5 = require('js-md5');
const qs = require("qs")
//登录地址
const LOGIN_URL = "https://web.everphoto.cn/api/auth"
//签到地址
const CHECKIN_URL = "https://openapi.everphoto.cn/sf/3/v4/PostCheckIn"
//每日奖励
const DAILY_REWARD = "https://openapi.everphoto.cn/sf/3/v4/MissionRewardClaim"
//备注, 收藏等任务共同的 api
const CMD = "https://openapi.everphoto.cn/sf/3/v4/PostSyncCommand"
//任务状态回调
const TASKREPORT = "https://openapi.everphoto.cn/sf/3/v4/MissionReport"

const account = ""; //账号
const password = "";//密码
const country_code = "+86";//默认+86
main()
//reward()
async function main() {
    console.log("+++++++开始登录+++++++")
    const pwd = await getPwdMd5()
}


async function getPwdMd5() {
    const salt = "tc.everphoto."
    const pwd = salt + password;
    const realPwd = md5(pwd)
    const data = {'mobile': country_code + account, 'password': realPwd};
    const options = {
        method: 'POST',
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        data: qs.stringify(data),
        url: LOGIN_URL,
    };
    let res = await axios(options)
    if (res.data.code == 0) {
        console.log("+++++++登录成功+++++++")
    }else {
        console.log("+++++++登录失败+++++++")
    }
    let jsonResult = res.data
    let token = jsonResult.data.token;
    checkIn(token)
    console.log("token",token)
   //await reward(token)
}

/**
 * 签到
 * @param token
 * @returns {Promise<void>}
 */
async function checkIn(token) {
    console.log("+++++++开始签到+++++++")
    const options = {
        method: 'POST',
        headers: {
            "content-type": "application/json",
            "host": "openapi.everphoto.cn",
            "connection": "Keep-Alive",
            "authorization": 'Bearer ' + token,
        },
        url: CHECKIN_URL,
    };
    let res = await axios(options)
    let jsonResult = res.data;
    if (jsonResult.code == 0) {
        console.log("账号: " + account.substring(0,3)+"*****"+account.substring(7,11) + " 签到成功!")
    }
    if (jsonResult.data.checkin_result == true) {
        const rwd = jsonResult.data.reward / (1024 * 1024)
        console.log("获得奖励" + rwd + "Mb空间")
    } else {
        console.log("今日已签到!")
    }
    let total_reward = jsonResult.data.total_reward / (1024 * 1024) + "Mb"//累计获得
    let tomorrow_reward = jsonResult.data.total_reward / (1024 * 1024) + "Mb"//明日可获得
    let continuity = jsonResult.data.continuity//连续签到天数
    let ret = "累计获得:" + total_reward + "," + "明日可获得:" + tomorrow_reward + ",连续签到:" + continuity + "天";
    console.log(ret);
}

/**
 * 获取奖励
 * @returns {Promise<void>}
 */
async function reward(token){
    console.log("+++++++开始完成每日任务+++++++")
    //任务奖励列表
    const tasks= {
        "收藏": {"mission_id": "star"},
        //"隐藏": {"mission_id": "hide"},
        //"相册": {"mission_id": "add_to_album"},
        //"备注": {"mission_id": "remark"},
    }

    for (var j in tasks){
        console.log("单个对象"+j,":",tasks[j])
        const options = {
            method: 'POST',
            headers: {
                "content-type": "application/json",
                "host": "openapi.everphoto.cn",
                "connection": "Keep-Alive",
                "authorization": 'Bearer ' + token,
            },
            data: qs.stringify(tasks[j]),
            url: TASKREPORT,
        };
        const res=axios(options).catch(function (error) {
            // 处理错误情况
            console.log(error);
        })
            .then(function () {
                // 总是会执行
                console.log('总是会执行')
            });;
        console.log(res);
    }


}
