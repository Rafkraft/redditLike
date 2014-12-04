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
        savedValues("link");
    })
    $('.text').click(function(){
        App.main.show(new TextFormView());
        $('#formTypes li').removeClass();
        $('.text').parent().addClass('active');
        savedValues("text");
    })

    function savedValues(type){
        if(window.savedInfos.savedTitle.length>1){
            $('#title').val(window.savedInfos.savedTitle);
        }
        if(type=="text"){
            if(window.savedInfos.savedText.length>1){
                $('#text').val(window.savedInfos.savedText);
            }           
        }
        if(type=="link"){
            if(window.savedInfos.savedLink.length>1){
                $('#link').val(window.savedInfos.savedLink);
            }           
        }
    }

    savedValues("text");

    $('#title').change(function(){
        window.savedInfos.savedTitle = $('#title').val();
    })
    $('#text').change(function(){
        window.savedInfos.savedText = $('#text').val();
    })
    $('#link').change(function(){
        window.savedInfos.savedLink = $('#link').val();
    })


})
