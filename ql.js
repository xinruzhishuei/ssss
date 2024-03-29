'use strict';
const got = require('got');
require('dotenv').config();

//当前所在的环境
let current_access={"access":"client_id=x9h5ha-Ow3rC&client_secret=s_-e6rMiN92--5gjqnklGGdk", "url":"http://nas.cjzsy.com:5700"}


//远程服务器环境
let remote_access={"access":"client_id=scqpy_VsRmS9&client_secret=gRe36wkUdHIOE8eIBT5AvG_N", "url":"http://nas.cjzsy.com:5701"}




const api = got.extend({prefixUrl: current_access.url,retry: { limit: 0 },});

const remote_api = got.extend({prefixUrl: remote_access.url,retry: { limit: 0 },});


//获取当前WSCK容器的token
async function getToken() {
    const body = await api({url: 'open/auth/token?'+current_access.access,headers: {"Content-Type": "application/x-www-form-urlencoded"}}).json();
    return body.data.token;
}

//获取远程-ql 容器的token
async function getRemoteToken() {
    const body = await remote_api({url: 'open/auth/token?'+remote_access.access,headers: { "Content-Type": "application/x-www-form-urlencoded"}}).json();
    return body.data.token;
}
//获取远程匹配pin的变量
module.exports.getRemoteEnvByPtPin = async (Ptpin) => {
    const envs = await this.getRemoteEnvs();
    for (let i = 0; i < envs.length; i++) {
        var tempptpin = decodeURIComponent(envs[i].value.match(/pt_pin=([^; ]+)(?=;?)/) && envs[i].value.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
        if(tempptpin==Ptpin){
            // console.log("主容器的pin:"+JSON.stringify(envs[i]))
            return envs[i];
        }
    }
    return "";
};


//获取远程所有JD_COOKIE环境变量
module.exports.getRemoteEnvs = async () => {
    const token = await getRemoteToken();
    const body = await remote_api({
        url: 'open/envs',
        searchParams: {
            searchValue: 'JD_COOKIE',
            t: Date.now(),
        },
        headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
        },
    }).json();
    return body.data;
};

//更新主要容器远程变量
module.exports.updateEnvRemote = async (cookie, eid, remarks) => {
    const token = await getRemoteToken();
    const body = await remote_api({
        method: 'put',
        url: 'open/envs',
        params: { t: Date.now() },
        json: {
            name: 'JD_COOKIE',
            value: cookie,
            id: eid,
            remarks,
        },
        headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json;charset=UTF-8',
        },
    }).json();
    return body;
};

module.exports.getEnvsCount = async () => {
    const data = await this.getEnvs();
    return data.length;
};

module.exports.addEnv = async (cookie, remarks) => {
    const token = await getToken();
    const body = await api({
        method: 'post',
        url: 'open/envs',
        params: { t: Date.now() },
        json: [{
            name: 'JD_COOKIE',
            value: cookie,
            remarks,
        }],
        headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json;charset=UTF-8',
        },
    }).json();
    return body;
};

//获取本机变量
module.exports.getEnvs = async () => {
    const token = await getToken();
    const body = await api({
        url: 'open/envs',
        searchParams: {
            searchValue: 'JD_COOKIE',
            t: Date.now(),
        },
        headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
        },
    }).json();
    return body.data;
};
module.exports.DisableCk = async (eid) => {
    const token = await getToken();
    const body = await api({
        method: 'put',
        url: 'open/envs/disable',
        params: { t: Date.now() },
        body: JSON.stringify([eid]),
        headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json;charset=UTF-8',
        },
    }).json();
    return body;
};

//启用远程tooken
module.exports.EnableCk = async (eid) => {
    const token = await getRemoteToken();
    const body = await remote_api({
        method: 'put',
        url: 'open/envs/enable',
        params: { t: Date.now() },
        body: JSON.stringify([eid]),
        headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json;charset=UTF-8',
        },
    }).json();
    return body;
};

module.exports.getstatus = async (eid) => {
    const envs = await this.getEnvs();
    for (let i = 0; i < envs.length; i++) {
        if(envs[i]._id==eid){
            return envs[i].status;
        }
    }
    return 99;
};

module.exports.getEnvById = async (eid) => {
    const envs = await this.getEnvs();
    for (let i = 0; i < envs.length; i++) {
        if(envs[i]._id==eid){
            return envs[i].value;
        }
    }
    return "";
};

module.exports.getEnvByPtPin = async (Ptpin) => {
    const envs = await this.getEnvs();
    for (let i = 0; i < envs.length; i++) {
        var tempptpin = decodeURIComponent(envs[i].value.match(/pt_pin=([^; ]+)(?=;?)/) && envs[i].value.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
        if(tempptpin==Ptpin){
            return envs[i];
        }
    }
    return "";
};


module.exports.delEnv = async (eid) => {
    const token = await getToken();
    const body = await api({
        method: 'delete',
        url: 'open/envs',
        params: { t: Date.now() },
        body: JSON.stringify([eid]),
        headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json;charset=UTF-8',
        },
    }).json();
    return body;
};

//搜脚本
module.exports.searchVaule = async (name) => {
    const token = await getRemoteToken();
    const body = await remote_api({
        method: 'get',
        url: 'open/crons',
        searchParams: {
            searchValue:name,
            t: Date.now()
        },
        headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json;charset=UTF-8',
        },
    }).json();
    return body;
};

//运行任务
module.exports.runCrons = async (id) => {
    const token = await getRemoteToken();
    const body = await remote_api({
        method: 'put',
        url: 'open/crons/run',
        params: { t: Date.now() },
        body: JSON.stringify([id]),
        headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json;charset=UTF-8',
        },
    }).json();
    return body;
};

//获取系统版本

module.exports.sysVersion = async () => {
    const token = await getRemoteToken();
    const body = await remote_api({
        method: 'get',
        url: 'open/api/system',
        params: { t: Date.now() },
        //body: JSON.stringify([id]),
        headers: {
            Accept: 'application/json',
            Cookie: `token=${token}`,
            'Content-Type': 'application/json;charset=UTF-8',
        },
    }).json();
    return body;
};
