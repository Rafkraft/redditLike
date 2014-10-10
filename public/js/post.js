$(document).ready(function(){
    // ================
    // MAIN MODEL
    // ================
    var Model = Backbone.Model.extend({});
    var model = new Model();

    // ================
    // COLLECTIONS
    // ================

    //Main collection : Post object

    window.MainCollection = Backbone.Collection.extend({
        url:window.location.origin+"/feed/"+window.subReddit+"/"+window.postUrlTitle
    });
    mainCollection = new MainCollection();

    //Comments collection : comment objects

    window.CommentsCollection = Backbone.Collection.extend({});
    commentsCollection = new CommentsCollection();

    // ================
    // POST AREA : ITEM VIEW 
    // ================
    var postView = Backbone.Marionette.ItemView.extend({
        events:{
            "click .icon-up-open":"upVote",
            "click .icon-down-open":"downVote",
        },
        initialize:function(options){
            this.templateHelpers = {};
            console.log(this.model);

            // Date handling
            var date = new Date(this.model.get('createdOn'));
            var currentDate = new Date();
            var months=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Aout','Septembre','Octobre','Novembre','Décembre']
            var postDate = date.getUTCDate();
            postDate+=' '+months[date.getMonth()];
            if(currentDate.getYear()!=date.getYear())
                postDate+=' '+date.getYear();
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
                this.templateHelpers.content=this.model.get('text');
            }else if(this.model.get('type')=='link'){
                this.templateHelpers.content='<a target="_blank" href="'+this.model.get('link')+'">'+this.model.get('link')+'</a>';
            }

            //Comments
            if(this.model.get('commentsNumber') == 0){
                this.templateHelpers.commentsNumber = 'No comment yet'
            }else{
                this.templateHelpers.commentsNumber = this.model.get('commentsNumber')+' comments';
            }

            this.templateHelpers.date=this.model.get('date')
            this.templateHelpers.date +=", publié par <a href='../../user/"+this.model.get('authorUsername')+"'>"+this.model.get('authorUsername')+"</a>";
            this.templateHelpers.upVotes = this.model.get('upVotesNumber');
            this.templateHelpers.title=this.model.get('title')+"<i class='icon-up-open'></i><i class='icon-down-open'></i>";
            var voteDifference;
            if(this.model.get('votesDifference')>0)
                votesDifference='<span class="votesDifference">'+'+'+this.model.get('votesDifference')+'</span>';
            else
                votesDifference='<span class="votesDifference">'+this.model.get('votesDifference')+'</span>';
            this.templateHelpers.title+=votesDifference;
        },
        template : "#postTemplate",
        upVote:function(){
            data= {
                "postType":"postVote",
                "vote":"up",
                "subReddit":window.subReddit,
                "postId":this.model.get('_id')
            }
            if(userInfos.connected){
                $.ajax({
                    type: "POST",
                    url: "./newVote",
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
            data= {
                "postType":"postVote",
                "vote":"down",
                "subReddit":window.subReddit,
                "postId":this.model.get('_id')
            }
            if(userInfos.connected){
                $.ajax({
                    type: "POST",
                    url: "./newVote",
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
    // ================
    // COMMENTS AREA : ITEM VIEW AND COLLECTIONVIEW
    // ================
    var commentView = Backbone.Marionette.ItemView.extend({
        tagName:"li",
        template:"#commentTemplate",
        events:{
            "click .icon-plus":"plus"
        },
        initialize:function(){
            this.templateHelpers={};

            //Author
            this.templateHelpers.author="<a href='../../user/"+this.model.get('userName')+"'>"+this.model.get('userName')+"</a>";

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

            //upVotesNumber
            this.templateHelpers.upVotesNumber;
            if(this.model.get('upVotesNumber')==0)
                this.templateHelpers.upVotesNumber="";
            else if(this.model.get('upVotesNumber')>0)
                this.templateHelpers.upVotesNumber='+'+this.model.get('upVotesNumber');
                        
            
            this.templateHelpers.date=this.model.get('date');
            this.templateHelpers.content=this.model.get('content');
        },
        plus:function(){
            console.log('plus');
            data= {
                "postType":"commentVote",
                "vote":"up",
                "subReddit":window.subReddit,
                "urlTitle":window.postUrlTitle,
                "commentId":this.model.get('id')
            }
            if(userInfos.connected){
                $.ajax({
                    type: "POST",
                    url: "./newVote",
                    data: data,
                    dataType: "text",
                    success: function(data) {
                        console.log('request ok')
                        console.log(data);
                    }
                });
            }else{
                var coucou;
            }
        }
    })
    var CommentsCollectionView= Backbone.Marionette.CollectionView.extend({
        id:"commentsList",
        tagName:"ul",
        childView:commentView
    });

    // ================
    // APPLICATION
    // ================
    var App = new Backbone.Marionette.Application();

    App.addRegions({
        post: '#post',
        comments:'#comments'
    });
    App.on("start", function(options){
        mainCollection.fetch().done(function(){
            console.log(mainCollection);
            App.post.show(new postView({model:mainCollection.models[0]}))
            _.each(mainCollection.models[0].get('comments'), function(value,index){
                commentsCollection.add(value);
                App.comments.show(new CommentsCollectionView({collection:commentsCollection}));
            })
        });
    });
    App.start();

})
