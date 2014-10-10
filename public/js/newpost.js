$(document).ready(function(){

    var TextFormView = Backbone.Marionette.ItemView.extend({
        template: "#textFormTemplate",
        id:"form"
    });

    var LinkFormView = Backbone.Marionette.ItemView.extend({
        template: "#linkFormTemplate",
        id:"form"
    });

    var App = new Backbone.Marionette.Application();

    App.addRegions({
        main: '#main'
    });

    App.on("start", function(options){
        App.main.show(new TextFormView());
    });

    App.start();


    $('.link').click(function(){
        App.main.show(new LinkFormView());
        $('#formTypes li').removeClass();
        $('.link').parent().addClass('active');
    })
    $('.text').click(function(){
        console.log('text')
        App.main.show(new TextFormView());
        $('#formTypes li').removeClass();
        $('.text').parent().addClass('active');
    })



})
