

function ignore_jd() {
    // 京喜农场禁用部分Cookie，以避免被频繁通知需要去种植啥的
    if (process.env.IGNORE_COOKIE_JXNC) {
        try {
            var 
                    ignore_names.push("CookieJD" + it);
                }
            });
            replacements.push({
                key: "if (jdCookieNode[item]) {",
                value: `if (jdCookieNode[item] && ${JSON.stringify(ignore_names)}.indexOf(item) == -1) {`,
            });
            console.log(`IGNORE_COOKIE_JXNC已生效，将为您禁用${ignore_names}`);
        } catch (e) {
            console.log("IGNORE_COOKIE_JXNC填写有误,不禁用任何Cookie");
        }
    }
    // 京喜工厂禁用部分Cookie，以避免被频繁通知需要去种植啥的
    if (process.env.IGNORE_COOKIE_JXGC) {
        try {
            var ignore_indexs = JSON.parse(process.env.IGNORE_COOKIE_JXGC);
            var ignore_names = [];
            ignore_indexs.forEach((it) => {
                if (it == 1) {
                    ignore_names.push("CookieJD");
                } else {
                    ignore_names.push("CookieJD" + it);
                }
            });
     ignore_names.push("CookieJD");
                } else {
                    ignore_names.push("CookieJD" + it);
                }
            });
            replacements.push({
                key: "cookiesArr.push(jdCookieNode[item])",
                value: `if (jdCookieNode[item] && ${JSON.stringify(
                    ignore_names
                )}.indexOf(item) == -1) cookiesArr.push(jdCookieNode[item])`,
            });
            console.log(`IGNORE_COOKIE_JDGC已生效，将为您禁用${ignore_names}`);
        } catch (e) {
            console.log("IGNORE_COOKIE_JDGC填写有误,不禁用任何Cookie");
        }
    }
}

function batchReplace() {
    for (var i = 0; i < replacements.length; i++) {
        remoteContent = remoteContent.replace(replacements[i].key, replacements[i].value);
    }
    // console.log(remoteContent);
    return remoteContent;
}
//#endregion

//#region 文件下载

async function downloader_jd() {
    if (/require\(['"`]{1}.\/jdCookie.js['"`]{1}\)/.test(remoteContent))
        await download("https://github.com/Choicc/MyActions/raw/main/scripts/jdCookie.js", "./jdCookie.js", "京东Cookies");
    if (remoteContent.indexOf("jdFruitShareCodes") > 0) {
        await download(
            "https://github.com/Choicc/MyActions/raw/main/scripts/jdFruitShareCodes.js",
        await download(
