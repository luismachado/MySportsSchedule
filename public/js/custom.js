$('.header').click(function () {
    var $this = $(this);
    $(this).nextUntil('div.header').slideToggle(100).promise().done(function () {
        $this.find('span').text(function (_, value) {
            return value == '-' ? '+' : '-'
        });
    });
});