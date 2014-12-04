$(document).ready(function(){

    // ================
    // ROUTER
    // ================
    var Router = Backbone.Router.extend({
        initialize: function(){
            Backbone.history.start();
        }
    });

	// ================
    // SubredditsList Elements
    // ================
    //subredditsList collection
    window.SubsCollection = Backbone.Collection.extend({
        url:"/feed/"+"youpi"+"?type=subList"
    });
    subsCollection = new SubsCollection();
    // sub ItemView
    var subRedditsListItemView = Backbone.Marionette.ItemView.extend({
        template: "#subTemplate",
        tagName:"li",
        className:"subRedditsListItem",
        initialize:function(){
            this.templateHelpers={};
            this.templateHelpers.postsNumber=this.model.get('postsNumber')+" posts"
        },
        events:{
            "click":"go"
        },
        go:function(){
            console.log('go');
            window.location=window.location.origin+'/r/'+this.model.get('name');
        }
    });
    // subredditsList CollectionView
    var subRedditsListcollectionView= Backbone.Marionette.CollectionView.extend({
        id:"subRedditsList",
        tagName:"ul",
        childView: subRedditsListItemView
    });

    // ================
    // RECENTS / POPULAR
    // ================

    //subredditsList Recent collection
    window.RecentCollection = Backbone.Collection.extend({
        url:"/feed/"+"youpi"+"?type=posts&sort=recents"
    });
    recentCollection = new RecentCollection();

    //subredditsList Popular collection
    window.PopularCollection = Backbone.Collection.extend({
        url:"/feed/"+"youpi"+"?type=posts&sort=populars",
        comparator:function(model) {
            return -model.get('rank');
        }
    });
    popularCollection = new PopularCollection();

    // sub ItemView
    var itemView = Backbone.Marionette.ItemView.extend({
        template : "#itemTemplate",
        events:{
            "click .icon-up-open":"upVote",
            "click .icon-down-open":"downVote",
        },
        tagName:"li",
        className:function(){
            return "post_"+this.model.get('_id')
        },
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


            this.templateHelpers.comments = '<a href="'+window.location.origin+'/r/'+this.model.get('subReddit')+'/'+this.model.get('urlTitle')+'">'+this.model.get('commentsNumber')+' comment(s)</a>'

            this.templateHelpers.date=this.model.get('date')
            this.templateHelpers.date +="<br> publié par <a href='/user/"+this.model.get('authorUsername')+"'>"+this.model.get('authorUsername')+"</a> dans "+"/r/"+this.model.get('subReddit');

            //Votes difference
            if(this.model.get('votesDifference')>0){
                this.templateHelpers.votesDifference = "+"+this.model.get('votesDifference');
            }else{
                this.templateHelpers.votesDifference = this.model.get('votesDifference');
            }
        },
        upVote:function(){
            var that=this;
            var url = window.location.origin+"/r/"+this.model.get('subReddit')+"/newVote";
            var data= {
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
                        var vd = parseInt(jQuery.parseJSON(data).votesDifference);
                        var u = $('.subRedditsList').find('.post_'+that.model.get('_id')).find('.votesDifference span');       
                        if(vd<0){
                            $(u).html(vd);
                        }else if(vd==0){
                            $(u).html("0")
                        }else if(vd>0){
                            $(u).html("+"+vd)
                        }
                    }
                });
            }else{
                alert('you are not connected')
            }
        },
        downVote:function(){
            var that=this;
            var url = window.location.origin+"/r/"+this.model.get('subReddit')+"/newVote";
            var data= {
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
                        var vd = parseInt(jQuery.parseJSON(data).votesDifference);
                        var u = $('.subRedditsList').find('.post_'+that.model.get('_id')).find('.votesDifference span');
                        if(vd<0){
                            $(u).html(vd);
                        }else if(vd==0){
                            $(u).html("0")
                        }else if(vd>0){
                            $(u).html("+"+vd)
                        }
                    }
                });
            }else{
                alert('you are not connected')
            }
        }
    })
    // subredditsList CollectionView
    var PostsListcollectionView= Backbone.Marionette.CollectionView.extend({
        className:"subRedditsList",
        tagName:"ul",
        childView: itemView
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
        subsCollection.fetch().done(function(){
            App.main.show(new subRedditsListcollectionView({collection:subsCollection}));
        });
    });
    App.start();

    //EVENTS
    $('.subRedditsLink').click(function(e){
        e.preventDefault();
        $('#indexNav li').removeClass('active');
        $(e.currentTarget).parent().addClass('active');

        subsCollection.fetch().done(function(){
            App.main.show(new subRedditsListcollectionView({collection:subsCollection}));
        });
    })
    $('.recentsLink').click(function(e){
        e.preventDefault();
        $('#indexNav li').removeClass('active');
        $(e.currentTarget).parent().addClass('active');

        recentCollection.fetch().done(function(){
            App.main.show(new PostsListcollectionView({collection:recentCollection}));
        });
    })
    $('.popularsLink').click(function(e){
        e.preventDefault();
        $('#indexNav li').removeClass('active');
        $(e.currentTarget).parent().addClass('active');

        popularCollection.fetch().done(function(){
            App.main.show(new PostsListcollectionView({collection:popularCollection}));
        });
    })
})