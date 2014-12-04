$(document).ready(function(){


    // Fill #text is error comment
    if (window.comment){
        $('#text').val(window.comment);
    }

    // ================
    // ROUTER
    // ================
    var Router = Backbone.Router.extend({
        initialize: function(){
            console.log("lolololol");
            console.log(mainCollection);
            if(mainCollection.length==0){
                console.log("zero");
                App.main.show(new emptyView());
            }else{
                console.log("not zero");
                App.main.show(new collectionView({collection:mainCollection}))
            }
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
    var Model = Backbone.Model.extend({
        initialize:function(){
            //timestamp
            var d = new Date(this.get('createdOn'));
            this.set('timestamp',d.getTime()/3600000);

            // Date handling
            var postDate="";
            var date = new Date(this.get('createdOn'));
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
            this.set('date',postDate);

            // upVotesNumber / downVotesNumber
            this.set('upVotesNumber',this.get('upVotes').length);
            this.set('downVotesNumber',this.get('downVotes').length);
        }
    });

    // ================
    // MAIN COLLECTION
    // ================
    window.MainCollection = Backbone.Collection.extend({
        model:Model,
        url:"/feed/"+window.subReddit+"?type=sub&sub="+window.subReddit+"&sort=rank",
        comparator:function(model) {
            return -model.get('rank');
        }
    });
    mainCollection = new MainCollection();

    // ================
    // EVENTS : SORT COLLECITON ON CLICK
    // ================
    function sortAndRender(sort){
        if(mainCollection.length==0){
            App.main.show(new emptyView());
        }else{
            var SortedModels;
            switch(sort){
                case "recents":
                    SortedModels = _.sortBy(mainCollection.models, function(model){ 
                        return -model.attributes.timestamp;
                    });
                    break;
                case "populars":
                    SortedModels = _.sortBy(mainCollection.models, function(model){ 
                        return -model.attributes.rank;
                    });                 
                    break;            
            }
            var SortedCollection = Backbone.Collection.extend({});
            var sortedCollection = new SortedCollection();
            _.each(SortedModels,function(value,index){
                sortedCollection.add(value);
            })
            App.main.show(new collectionView({collection:sortedCollection}))
        }
    }

    $('#postsListType .popularsLink').click(function(e){
        e.preventDefault();
        $('#postsListType li').removeClass('active');
        $(e.currentTarget).parent().addClass('active');

        sortAndRender("populars");
    })
    $('#postsListType .recentsLink').click(function(e){
        e.preventDefault();
        $('#postsListType li').removeClass('active');
        $(e.currentTarget).parent().addClass('active');

        sortAndRender("recents");
    })

    // ================
    // COLLECTION VIEW / ITEM VIEW
    // ================
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

            //Votes difference
            if(this.model.get('votesDifference')>0){
                this.templateHelpers.votesDifference = "+"+this.model.get('votesDifference');
            }else{
                this.templateHelpers.votesDifference = this.model.get('votesDifference');
            }
        },
        upVote:function(){
            var that=this;
            var url = window.location.origin+"/r/"+window.subReddit+"/newVote";
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
            var url = window.location.origin+"/r/"+window.subReddit+"/newVote";
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

    var collectionView= Backbone.Marionette.CollectionView.extend({
        id:"subRedditsList",
        className:"subRedditsList",
        tagName:"ul",
        childView: itemView
    });


    // Link form view
    var emptyView = Backbone.Marionette.ItemView.extend({
        id:"form",
        template: "#emptyTemplate",
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
            new Router();
        });
    });
    App.start();

})
