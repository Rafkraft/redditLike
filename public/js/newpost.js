$(document).ready(function(){

    var Router = Backbone.Router.extend({
        initialize: function(){ 
            Backbone.history.start();
        },
        routes: {
            ":query":"form",
            "/*":"default"
        },
        form:function(query){
            if(query=="text"){
                App.newpostForm.show(new TextFormView());
            }else if (query=="link"){
                App.newpostForm.show(new LinkFormView());
            }
        },
        default:function(){
            this.form("text");
        }
    })

    var TextFormView = Backbone.Marionette.ItemView.extend({
        template: "#textFormTemplate",
    });

    var LinkFormView = Backbone.Marionette.ItemView.extend({
        template: "#linkFormTemplate",
    });

    var App = new Backbone.Marionette.Application();

    App.addRegions({
        newpostForm: '#newpostForm'
    });

    App.on("start", function(options){
        new Router();
    });

    App.start();

})
