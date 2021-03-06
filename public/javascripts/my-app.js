// Initialize your app
var myApp = new Framework7({
    // pushState: true,
    // swipePanel: 'left',
    // fastClicks:true,
    material:true,
    modalTitle:"在线考试系统"
});

// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    // dynamicNavbar: true
});

//让所有class为link的a标签，在点击跳转页面时弹出loading
// $$(document).on('pageInit','.page[data-page]',function(e){
//     $$('a.link').on('click', function () {
//         var a=$$('.view').attr('data-page');
//         myApp.showPreloader();
//         setInterval(function(){
//             if($$('.view').attr('data-page')!=a){
//               myApp.hidePreloader();
//             }
//         },1000);
//     });
//     // alert();
// });
$$(document).on('pageInit', '.page[data-page="login"]', function (e) {
    
    myApp.login.buttonLoading(function(){
        // setTimeout(myApp.login.buttonSpread,10);
        myApp.login.buttonSpread();
    });

});  
$$(document).on('pageInit', '.page[data-page="exam"]', function (e) {
    //实现倒计时
    clearInterval(myApp.countdownTimer);
    var oCountdown=$$('.countdown');
    var totalMinutes=parseInt(oCountdown.data('totalMinutes'));
    var startTime=new Date(oCountdown.data('startTime'));
    var totalMS=totalMinutes*60000;
    // var elapsedMS=new Date()-startTime;
    var remainMS=totalMS-(new Date()-startTime);
    function getNewRemainStr(){
        //剩余毫秒数=总毫秒数-（当前时间-开始时间）
        var remainMS=totalMS-(new Date()-startTime);
        var remainHours=parseInt(remainMS/3600000);
        var remainMinutes=parseInt((remainMS-remainHours*3600000)/60000);
        var remainSeconds=parseInt((remainMS-remainHours*3600000-remainMinutes*60000)/1000);
        var remainStr=remainHours+':'+remainMinutes+':'+remainSeconds;
        return remainStr;
    }
    if(remainMS>0){
        oCountdown.html(getNewRemainStr());
        myApp.countdownTimer=setInterval(function(){
            var remainStr=getNewRemainStr();
            if(remainMS<=0){
                clearInterval(myApp.countdownTimer);
            }else {
                oCountdown.html(remainStr);
            }oCountdown.html(remainStr);
        },500);
    }
}); 

//保存答题记录
myApp.answerLog={};
//监听答题状态
myApp.onPageBeforeAnimation('exam', function(page){
    var oAnswerList=$$(page.container).find('.answerListUl');
    var aAnswerItem=oAnswerList.find('li');
    var option=$$(aAnswerItem).find('input').eq(0);
    var qNumber=oAnswerList.data('number');
    var checkedStr='';

    if(myApp.answerLog[qNumber+'']){
        var nowChecked=myApp.answerLog[qNumber+''][0];
        for(var nci=0;nci<aAnswerItem.length;nci++){
            var nowOption=aAnswerItem.eq(nci).find('input').eq(0);
            if(~nowChecked.indexOf(nowOption.val())){
                nowOption.prop({checked: true});
            }
        }
    }

    $$('.saveAnswer').on('click',function(e){
        for(var i=0;i<aAnswerItem.length;i++){
            var theOption=aAnswerItem.eq(i).find('input').eq(0);
            var theOptionID=oAnswerList.data('qid');
            if(theOption.prop('checked')){
                checkedStr+=theOption.val();
            }
        }
        if(checkedStr){
            myApp.answerLog[qNumber+'']=[checkedStr,theOptionID];
        }
        console.log(qNumber+':'+checkedStr);
        console.log(myApp.answerLog);
    });
});
//---------答题卡---------------
myApp.onPageBeforeAnimation('answersheet', function(page){
    // 设置答题卡题号样式
    var oAnswersheet=$$(page.container);
    var aQItem=oAnswersheet.find('.qid-item');
    var qqi=0;
    var aLen=0;
    for(var qi in myApp.answerLog){
        qqi=parseInt(qi.trim());
        aQItem.eq(qqi-1).find('strong').eq(0).addClass('qid-answered');
        aLen++;
    }
    aQItem.eq(qqi).find('strong').eq(0).removeClass('qid-answered').addClass('qid-active');
    // 设置进度条
    var currentPer=(aLen/parseInt($$('.progress-total').html()))*100;
    $$('.progress-now').html(aLen);
    $$('.current-progress').css({width:currentPer+'%'});

    //设置答题数据内容
    // $$('#judgeBtn').on('click',function(e){
    //     $$('#answerLogForm').submit();
    // });
    var oJudgeBtn=$$('#judgeBtn');
    var oJudgeHref=oJudgeBtn.prop('href');
    oJudgeHref+='?answerLogStr='+JSON.stringify(myApp.answerLog);
    oJudgeBtn.prop('href', oJudgeHref);

    console.log(oJudgeBtn.prop('href'));

}); 

/*--禁用滚动--*/
// $$('body')[0].addEventListener('touchstart', function (ev) {
//   ev.preventDefault();
// });

/*---Login---*/
myApp.login=myApp.login||{};
myApp.login.buttonLoading=function(cb){

    var btn=$$('#loginBtn');
    btn.click(function(event) {
        loginValidate(function(username,password,err){
            if(err){
                myApp.alert(err);
            }else{
               btn.addClass('loginBtn-shrink');
                $$.ajax({
                    url:"/func/login",
                    data:{userName:username,password:password},
                    success:loginSuccess,
                    error:loginFail
                }); 
            }
        }); 

        cb&&cb();
    });
    function loginValidate(fn){
        var un=$$('#username').val().trim();
        var pw=$$('#password').val().trim();
        var p=/^[0-9a-zA-Z]*$/g;

        if(!(un&&pw)){
           fn(null,null,'账号与密码不能为空');
        }else if(!(p.test(un))){
            fn(null,null,"账号只能是数字字母组合");
        }else{
            fn(pw,un,null);
        }
    }
    function loginSuccess(data){
        console.log('#Login:success');
        setTimeout(function(){
            myApp.login.buttonSpread();
            // setTimeout(function(){
                mainView.router.load({
                    url:'/app/main'
                });
            // },300);
        },1000);
    }
    function loginFail(e){
        myApp.alert('账号或密码错误!');
        btn.removeClass('loginBtn-shrink');
    }
}
myApp.login.buttonSpread=function(){
    var btn=$$('#loginBtn');
    var pos=btn.offset();
    btn.addClass('loginBtn-spread');
}
myApp.login.buttonLoading();
// myApp.login.buttonLoading(function(){
    // setTimeout(myApp.login.buttonSpread,2000);
// });

/*----Exam----*/
function codeStyle(){
    myApp.styleToggle=$$(".code-style-toggle");
    myApp.styleToggle.styleArray=["monokai-sublime","github-gist","dracula","gruvbox-light","zenburn","tomorrow"];
    myApp.styleToggle.styleIndex=0;

    myApp.styleToggle.codeStyleChange=function(){
        var styleIndex=myApp.styleToggle.styleIndex=(myApp.styleToggle.styleIndex>=myApp.styleToggle.styleArray.length)?0:myApp.styleToggle.styleIndex;
        $$("#code-style").prop("href","stylesheets/highlight/"+myApp.styleToggle.styleArray[styleIndex]+".css");
        myApp.styleToggle.styleIndex++;
    }
    myApp.styleToggle.click(function(){
        // alert();
        myApp.styleToggle.codeStyleChange();
    });
}
codeStyle();