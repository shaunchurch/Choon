function Substrata() {
    var self = this;
    var $ = jQuery;

    var cache = {
        imageSize: 500,
        inputForm: null,
        inputField: null,
        coverContainer: null,
        mainContainer: null,
        loadingContainer: null,
        header: null
    };

    this.init = function() {

        // this.requestAlbums('gigglesticks');
        this.cacheElements();
        this.bindEvents();
        this.setInitialConditions();

    };

    this.cacheElements = function() {

        cache.inputForm = $('form.username');
        cache.inputField = $('input.username');
        cache.coverContainer = $('.covershots');
        cache.mainContainer = $('.main');
        cache.loadingContainer = $('.loading');
        cache.header = $('header');
    };

    this.bindEvents = function() {

        cache.inputForm.on('submit', this.usernameFormWasSubmitted);

    };

    this.setInitialConditions = function() {

        cache.inputField.focus();

    };

    this.usernameFormWasSubmitted = function(submit) {

        submit.preventDefault();

        self.requestAlbums(cache.inputField.val());

        cache.loadingContainer.addClass('active');

        cache.header.removeClass('expanded');

    };

    this.requestAlbums = function(username) {
        var request = $.get('/albums/' + username);

        cache.coverContainer.fadeOut(function() { cache.coverContainer.empty(); });

        request.then(function(results) {
            _.each(results, function(result) {
                cache.coverContainer.append('<img src="' + result.image + '" class="albumcover">');
            });

            cache.loadingContainer.removeClass('active');
            cache.coverContainer.fadeIn();
        });
    };

    this.setupWindow = function() {
        console.log('setupWindow()');
        return window.innerHeight;
    };

    this.testRun = function() {
        return true;
    };
}