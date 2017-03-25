var port = chrome.runtime.connect({name: 'popup_script'});

port.postMessage({action : "getUserStatus"});
port.onMessage.addListener(function(msg) {
    console.log(msg);
    switch (msg.action) {
        case "getUserStatus":
            getUserStatus(msg.data);
            break;
        case "signup":
            signup(msg.data);
            break;
        case "login":
            login(msg.data);
            break;
        case "requestError":
            requestError(msg.data);
        default:
    }
});

$(document).ready(function() {
    $('#signup').bootstrapValidator({
        button: {
            selector: '#validateButton',
            disabled: 'disabled'
        },
        fields: {
            userId: {
                validators: {
                    notEmpty: {
                        message: '用户名不能为空'
                    }
                }
            },
            userPwd: {
                validators: {
                    notEmpty: {
                        message: '密码不能为空'
                    },
                    identical: {
                        field: 'userPwdAgain',
                        message: '两次密码不一致'
                    }
                }
            },
            userPwdAgain: {
                validators: {
                    identical: {
                        field: 'userPwd',
                        message: '两次密码不一致'
                    }
                }
            },
            userEmail: {
                validators: {
                    emailAddress: {
                        message: '请输入正确邮箱'
                    }
                }
            },
            userDarenName: {
                validators: {
                    notEmpty: {
                        message: '达人名称不能为空'
                    }
                }
            },
            userWangwangNick: {
                validators: {
                    notEmpty: {
                        message: '旺旺名不能为空'
                    }
                }
            }
        }
    })
    .on("success.form.bv",function (e){
        e.preventDefault();
        var fieldList = $(e.target).serializeArray();
        var formData = JSON.stringify(getFormData(fieldList));
        console.log(formData);
        console.log(formData.length);
        port.postMessage({action : "signup", data: formData});
    });
    
    $('#login').bootstrapValidator({
        fields: {
            userId: {
                validators: {
                    notEmpty: {
                        message: '用户名不能为空'
                    }
                }
            },
            userPwd: {
                validators: {
                    notEmpty: {
                        message: '密码不能为空'
                    }
                }
            }
        }
    }).on("success.form.bv",function (e){
        e.preventDefault();
        $("#loginmessage").text("正在登录...");
        var fieldList = $(e.target).serializeArray();
        var formData = JSON.stringify(getFormData(fieldList));
        port.postMessage({action : "login", data: formData});
    });
});

$("#loginBtn").click(function(){
    document.getElementById("loginBtn").className = "btn btn-success";
    document.getElementById("registereBtn").className = "btn btn-default";
    $("#login").show();
    $("#signup").hide();
});

$("#registereBtn").click(registereBtn);

$("#registereLink").click(registereBtn);

$("#logout").click(function(){
    port.postMessage({action : "logout"});
    $(".page-content").hide();
    $(".page-main").show();
    $("#loginmessage").text("");
});

function getFormData(arr){
    var obj = new Object;
    arr.map(function(item){
        if(item.name !== "userPwdAgain"){
            obj[item.name] = item.value;
        }
    });
    return obj;
}

function getUserStatus(result){
    if (typeof result === "object" && result.hasOwnProperty("userName")){
        $(".userfiled").text("欢迎:" + result.userName + "；最近登录时间" + result.lastLoginTime + "；积分:" + result.ponit);
            
        $(".page-content").show();
        $(".page-main").hide();
    } else {
        $(".page-content").hide();
        $(".page-main").show();
    }
}

function signup(data){
    if(data.success){
        document.getElementById("loginBtn").className = "btn btn-success";
        document.getElementById("registereBtn").className = "btn btn-default";
        $("#loginmessage").text("注册成功，请登录");
        $("#login").show();
        $("#signup").hide();
        $('#signup')[0].reset();
    } else {
        $("#signupmessage").text(data.message);
    }
}

function login(data){
    console.log(data);
    if(data.success){
        var userInfo = data.object;
        data.userInfo = data.object;
        getUserStatus(userInfo);
        $('#login')[0].reset();
    } else {
        $("#loginmessage").text(data.message);
    }
}

function requestError(data){
    $("#loginmessage").text(data.message);
}

function registereBtn(){
    document.getElementById("loginBtn").className = "btn btn-default";
    document.getElementById("registereBtn").className = "btn btn-success";
    $("#signup").show();
    $("#login").hide();
}