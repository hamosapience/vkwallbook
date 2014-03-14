var casper = require("casper").create({
    pageSettings: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1883.0 Safari/537.36'
    },
    remoteScripts: [
        "http://yandex.st/jquery/1.8.3/jquery.min.js"
    ]
});

casper.clickWhileSelector = function(selector) {
    return this.then(function() {
        if (this.exists(selector)) {
            this.echo('found link: ' + this.getElementInfo(selector).tag);
            this.click(selector);
            return this.clickWhileSelector(selector);
        }
        return;
    });
};

casper.start();

casper.page.paperSize = {
    format: "A4",
    orientation: 'portrait',
    margin: '1cm'
};

casper.thenOpen('http://vk.com', function() {
    this.fill("#quick_login_form", {
        email: 'vasya@gmail.com',
        pass: 'pass123'
    }, true);
});

casper.thenOpen('http://vk.com/vasya');

casper.thenEvaluate(function(){
    $("#page_header").remove();
    $("#side_bar").remove();
    $("#profile_narrow").remove();
    $("#profile_photos_module").remove();
    $("#profile_info").remove();
    $("#footer_wrap").remove();
    $("#profile_wall").addClass("wide_wall_module");
    $("#profile").addClass("page_wide_no_narrow");
});

var clickCount = 0;

function clickThrough(){
    clickCount++;

    console.log(clickCount);
    casper.click("#wall_more_link");
    casper.then(function(){
        casper.waitWhileVisible("#wall_more_progress");
        casper.then(function(){
            if (casper.visible("#wall_more_link") && clickCount < 10){
                clickThrough();
            }
            else {
                casper.echo("Scrolled through");

                casper.echo('Click');

                casper.clickWhileSelector(".wr_header:not(.wrh_all)");

                casper.thenEvaluate(function(){
                    $(".reply_field").remove();
                    $(".reply_fakebox_wrap").remove();
                    $("._reply_lnk").remove();
                    $(".reply_link").remove();
                    $(".post_like_link").remove();
                    $("#submit_post_box").remove();
                    $("#stl_bg").remove();

                    $("#header_wrap2").remove();
                    $("#page_wall_header").remove();
                });

                casper.thenEvaluate(function(){

                    var pageHeight = 1152;
                    var currentPageHeight = 22;

                    $(".post").each(function(i, item){
                        var id = $(item).attr("id");
                        var postHeight = $("#" + id).outerHeight();
                        console.log($(item).attr("id"), 'postHeight', postHeight, currentPageHeight, postHeight + currentPageHeight);

                        if ( (currentPageHeight + postHeight) > pageHeight ){
                            console.log('break', (pageHeight - currentPageHeight));
                            $(item).before('<div class="break" style="height:' + (pageHeight - currentPageHeight) + 'px;"></div>' );
                            if (postHeight <= pageHeight){
                                currentPageHeight = postHeight;
                            }
                            else {
                                currentPageHeight = postHeight % pageHeight;
                            }
                        }
                        else {
                            currentPageHeight += postHeight;
                        }
                    });

                });

                casper.then(function(){
                    this.echo("Rendering...");
                    this.capture('wall.pdf').exit();
                });
            }
        });
    });
}

casper.then(function(){
    clickThrough();
});

casper.run();