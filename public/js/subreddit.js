$(document).ready(function(){

    // ================
    // ROUTER
    // ================
    var Router = Backbone.Router.extend({
        initialize: function(){
            Backbone.history.start();
        },
        routes: {
            "newpost":"form",
            "newpost/:query":"formS",
            "/*":"home"
        },
        home:function(){
            console.log('home');
            App.main.show(new collectionView({collection:mainCollection}))
        },
        form:function(){
            console.log('form');
            App.main.show(new textFormView());
        },
        formS:function(query){
            if(query=="text")
                App.main.show(new textFormView());
            else if(query=="link")
                App.main.show(new linkFormView());
            else 
                App.main.show(new textFormView());
        }
    })

    // ================
    // FORM VIEWS
    // ================
    var TextFormView = Backbone.Marionette.ItemView.extend({
        template: "#textFormTemplate",
    });

    var LinkFormView = Backbone.Marionette.ItemView.extend({
        template: "#linkFormTemplate",
    });

    // ================
    // MAIN MODEL
    // ================
    var Model = Backbone.Model.extend({});
    var model = new Model();

    // ================
    // MAIN COLLECTION
    // ================
    window.MainCollection = Backbone.Collection.extend({
        url:window.location.origin+"/feed/"+window.subReddit
    });
    mainCollection = new MainCollection();

    // ================
    // COLLECTION VIEW / ITEM VIEW
    // ================
    var itemView = Backbone.Marionette.ItemView.extend({
        events:{
            "click .icon-up-open":"upVote",
            "click .icon-down-open":"downVote",
        },
        tagName:"li",
        initialize:function(options){
            this.templateHelpers = {};

            // Date handling
            var postDate="";
            var date = new Date(this.model.get('createdOn'));
            var currentDate = new Date();
            var months=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Aout','Septembre','Octobre','Novembre','Décembre'];
            if(currentDate.getMonth()==date.getMonth()&&currentDate.getDay()==date.getDay()){
                postDate+="Aujourd'hui";
            }else{
                postDate+= date.getUTCDate();
                postDate+=' '+months[date.getMonth()];
                if(currentDate.getYear()!=date.getYear())
                    postDate+=' '+date.getYear();                
            }
            var hours= date.getHours().toString();
            if(hours.length==1)
                hours = "0"+date.getHours();
            var minutes= date.getMinutes().toString();
            if(minutes.length==1)
                minutes = "0"+date.getMinutes();

            postDate+=' à '+hours+'h'+minutes;
            
            
            this.model.set('date',postDate);
            this.model.set('upVotesNumber',this.model.get('upVotes').length);
            this.model.set('downVotesNumber',this.model.get('downVotes').length);

            //Type
            if(this.model.get('type')=='text'){
                this.templateHelpers.title=this.model.get('title');
                this.templateHelpers.icon = '<i class="icon-align-left"></i>';
            }else if(this.model.get('type')=='link'){
                this.templateHelpers.title='<a target="_blank" href="'+this.model.get('link')+'">'+this.model.get('title')+'</a>';
                this.templateHelpers.icon = '<i class="icon-link"></i>';
            }

            //Comments Link
            if(this.model.get('commentsNumber') == 0){
                if(window.location.href.substr(window.location.href.length -1)=='/')
                    this.templateHelpers.comments = '<a href="'+window.location.href+this.model.get('urlTitle')+'">No comment yet</a>';
                else
                    this.templateHelpers.comments = '<a href="'+window.location.href+'/'+this.model.get('urlTitle')+'">No comment yet</a>';
            }else{
                if(window.location.href.substr(window.location.href.length -1)=='/')
                    this.templateHelpers.comments = '<a href="'+window.location.href+this.model.get('urlTitle')+'">'+this.model.get('commentsNumber')+' comment(s)</a>'
                else
                    this.templateHelpers.comments = '<a href="'+window.location.href+'/'+this.model.get('urlTitle')+'">'+this.model.get('commentsNumber')+' comment(s)</a>'
            }

            this.templateHelpers.date=this.model.get('date')
            this.templateHelpers.date +="<br> publié par <a href='../../user/"+this.model.get('authorUsername')+"'>"+this.model.get('authorUsername')+"</a>";
            this.templateHelpers.upVotes = this.model.get('votesDifference');
        },
        template : "#itemTemplate",
        upVote:function(){
            var url;
            if(window.location.href.substr(window.location.href.length -1)=='/')
                url=window.location.href+"newVote"
            else
                url=window.location.href+"/newVote"
            data= {
                "postType":"postVote",
                "vote":"up",
                "subReddit":window.subReddit,
                "postId":this.model.get('_id')
            }
            if(userInfos.connected){
                $.ajax({
                    type: "POST",
                    url: url,
                    data: data,
                    dataType: "text",
                    success: function(data) {
                        console.log(data);
                    }
                });
            }else{
                var coucou;
            }
        },
        downVote:function(){
            var url;
            if(window.location.href.substr(window.location.href.length -1)=='/')
                url=window.location.href+"newVote"
            else
                url=window.location.href+"/newVote"
            data= {
                "postType":"postVote",
                "vote":"down",
                "subReddit":window.subReddit,
                "postId":this.model.get('_id')
            }
            if(userInfos.connected){
                $.ajax({
                    type: "POST",
                    url: url,
                    data: data,
                    dataType: "text",
                    success: function(data) {
                        console.log(data);
                    }
                });
            }else{
                var coucou;
            }
        }
    })

    var collectionView= Backbone.Marionette.CollectionView.extend({
        model:model,
        id:"subRedditsList",
        tagName:"ul",
        childView: itemView
    });

    // Text form view
    var textFormView = Backbone.Marionette.ItemView.extend({
        id:"form",
        template: "#textFormTemplate",
    });

    // Link form view
    var linkFormView = Backbone.Marionette.ItemView.extend({
        id:"form",
        template: "#linkFormTemplate",
    });

    // ================
    // APPLICATION
    // ================
    var App = new Backbone.Marionette.Application();

    App.addRegions({
        main: '#main'
    });
    App.on("start", function(options){
        new Router();
        mainCollection.fetch().done(function(){
            console.log(mainCollection);
        });
    });
    App.start();

})
