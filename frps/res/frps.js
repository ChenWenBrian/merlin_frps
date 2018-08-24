var $j = jQuery.noConflict();
var $G = function (id) {
    return document.getElementById(id);
};

function initial() {
    show_menu(menu_hook);
    get_status();
    conf2obj();
    version_show();
    buildswitch();
    toggle_switch();
    init_aliddns_switch();
}

function get_status() {
    $j.ajax({
        url: 'apply.cgi?current_page=Module_frps.asp&next_page=Module_frps.asp&group_id=&modified=0&action_mode=+Refresh+&action_script=&action_wait=&first_time=&preferred_lang=CN&SystemCmd=frps_status.sh',
        dataType: 'html',
        error: function (xhr) {
            alert("error");
        },
        success: function (response) {
            //alert("success");
            setTimeout("check_FRPS_status();", 1000);
        }
    });
}
var noChange_status = 0;
var _responseLen;

function check_FRPS_status() {
    $j.ajax({
        url: '/res/frps_check.html',
        dataType: 'html',
        error: function (xhr) {
            setTimeout("check_FRPS_status();", 1000);
        },
        success: function (response) {
            var _cmdBtn = document.getElementById("cmdBtn");
            if (response.search("XU6J03M6") != -1) {
                frps_status = response.replace("XU6J03M6", " ");
                //alert(frpc_status);
                document.getElementById("status").innerHTML = frps_status;
                return true;
            }

            if (_responseLen == response.length) {
                noChange_status++;
            } else {
                noChange_status = 0;
            }
            if (noChange_status > 100) {
                noChange_status = 0;
                //refreshpage();
            } else {
                setTimeout("check_FRPS_status();", 400);
            }
            _responseLen = response.length;
        }
    });
}

function toggle_switch() { //根据frps_enable的值，打开或者关闭开关
    var rrt = document.getElementById("switch");
    if (document.form.frps_enable.value != "1") {
        rrt.checked = false;
    } else {
        rrt.checked = true;
        $j("#open_dashboard").click(function () {
            var dashboard_src = document.location.protocol + "//" +
                db_frps["frps_common_dashboard_user"] + ":" +
                db_frps["frps_common_dashboard_pwd"] + "@" +
                document.location.host + ":" + db_frps["frps_common_dashboard_port"];
            window.open(dashboard_src);
        });
    }
}

function buildswitch() { //生成开关的功能，checked为开启，此时传递frps_enable=1
    $j("#switch").click(
        function () {
            if (document.getElementById('switch').checked) {
                document.form.frps_enable.value = 1;

            } else {
                document.form.frps_enable.value = 0;
            }
        });
}

function conf2obj() { //表单填写函数，将dbus数据填入到对应的表单中
    for (var field in db_frps) {
        $j('#' + field).val(db_frps[field]);
    }
}

function validForm() {
    return true;
}

function pass_checked(obj) {
    switchType(obj, document.form.show_pass.checked, true);
}

function onSubmitCtrl(o, s) { //提交操作，提交时运行config-frps.sh，显示5秒的载入画面
    var _form = document.form;
    if (trim(_form.frps_common_dashboard_port.value) == "" ||
        trim(_form.frps_common_dashboard_user.value) == "" ||
        trim(_form.frps_common_dashboard_pwd.value) == "" ||
        trim(_form.frps_common_bind_port.value) == "" ||
        trim(_form.frps_common_token.value) == "" ||
        trim(_form.frps_common_vhost_http_port.value) == "" ||
        trim(_form.frps_common_vhost_https_port.value) == "" ||
        trim(_form.frps_common_max_pool_count.value) == "" ||
        trim(_form.frps_common_cron_time.value) == "") {
        alert("提交的表单不能为空!");
        return false;
    }
    document.form.action_mode.value = s;
    document.form.SystemCmd.value = "config-frps.sh";
    document.form.submit();
    showLoading(5);
}

function done_validating(action) { //提交操作5秒后刷新网页
    refreshpage(5);
}

function reload_Soft_Center() { //返回软件中心按钮
    location.href = "/Main_Soft_center.asp";
}

function version_show() {
    $j.ajax({
        url: 'https://koolshare.ngrok.wang/frps/config.json.js',
        type: 'GET',
        dataType: 'jsonp',
        success: function (res) {
            if (typeof (res["version"]) != "undefined" && res["version"].length > 0) {
                if (res["version"] == db_frps["frps_version"]) {
                    $j("#frps_version_show").html("<i>插件版本：" + res["version"]);
                } else if (res["version"] > db_frpc["frps_version"]) {
                    $j("#frps_version_show").html("<font color=\"#66FF66\">有新版本：</font>" + res.version);
                }
            }
        }
    });
}

//============================ALIDDNS============================
function init_aliddns_switch() {
    var status = $j('#frps_aliddns_status').text();
    var ip = status.match(/\d+\.\d+\.\d+\.\d+/g);
    console.log(ip);
    if (ip && ip[0]) {
        $j('#client-switch').attr("checked", ip[0] !== "0.0.0.0");
    }

    var posting = false;
    $j('#client-switch').change(function () {
        if (posting) return;
        posting = true; // save
        var data = {
            action_mode: ' Refresh ',
            current_page: 'Module_frps.asp',
            next_page: 'Module_frps.asp',
            SystemCmd: 'frps_aliddns.sh',
            frps_aliddns_name: $j("#frps_aliddns_name").val(),
            frps_aliddns_action: $j('#client-switch').prop('checked') ? 'start' : 'stop'
        };
        $j.ajax({
            type: 'POST',
            url: 'applydb.cgi?p=frps_aliddns_',
            data: $j.param(data)
        }).then(function () {
            posting = false;
            var statusSpan = $j('#frps_aliddns_status span');
            var originalStatus = statusSpan.text();
            statusSpan.text("更新中.");
            var count = 0;
            tid = setInterval(function () {
                if (++count === 15) {
                    statusSpan.text("更新状态超时，请尝试刷新页面[F5]。");
                    clearInterval(tid);
                } else {
                    statusSpan.text(statusSpan.text() + ".");
                }
                $j.get("/dbconf?p=frps_aliddns_", function () {
                    if (db_frps_aliddns_ && db_frps_aliddns_["frps_aliddns_last_act"]) {
                        if(originalStatus!==db_frps_aliddns_["frps_aliddns_last_act"]){
                            clearInterval(tid);
                            $j('#frps_aliddns_status span').text(db_frps_aliddns_["frps_aliddns_last_act"]);
                        }
                    }
                })
            }, 1000);
        }, function () {
            posting = false;
            alert('failed');
        })
    })
}