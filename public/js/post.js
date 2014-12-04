$(document).ready(function(){
    console.log('POST');

    // Fill #text is error comment
    if (window.comment){
        console.log(window.comment);
        $('#text').val(window.comment);
    }

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
        url:"/feed/"+window.subReddit+"?type=post&sub="+window.subReddit+"&urlTitle="+window.postUrlTitle
    });
    mainCollection = new MainCollection();

    //Comment Model
    window.CommentModel = Backbone.Model.extend({
        initialize:function(){

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
        }
    })



    //Comments collection : comment objects
    window.CommentsCollection = Backbone.Collection.extend({
        model:CommentModel
    });
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
                        var vd = parseInt(jQuery.parseJSON(data).votesDifference);
                        var u = $('#post').find('.votesDifference');
                        if(vd<0){
                            $(u).html(vd)
                        }else if(vd==0){
                            $(u).html("")
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
                        var vd = parseInt(jQuery.parseJSON(data).votesDifference);
                        var u = $('#post').find('.votesDifference');
                        if(vd<0){
                            $(u).html(vd)
                        }else if(vd==0){
                            $(u).html("")
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
    // ================
    // COMMENTS AREA : ITEM VIEW AND COLLECTIONVIEW
    // ================
    window.commentView = Backbone.Marionette.ItemView.extend({
        tagName:"li",
        className:function(){
            return "comment_"+this.model.get('commentId');
        },
        template:"#commentTemplate",
        initialize:function(){
            this.templateHelpers={};

            //Author
            this.templateHelpers.author="<a href='/user/"+this.model.get('userName')+"'>"+this.model.get('userName')+"</a>";

            this.templateHelpers.date=this.model.get('date');

            this.templateHelpers.authorAndDate=this.templateHelpers.author+" "+this.templateHelpers.date;

            //upVotesNumber
            this.templateHelpers.upVotesNumber;
            if(this.model.get('upVotesNumber')==0)
                this.templateHelpers.upVotesNumber="";
            else if(this.model.get('upVotesNumber')>0)
                this.templateHelpers.upVotesNumber='+'+this.model.get('upVotesNumber');

            //downVotesNumber
            this.templateHelpers.downVotesNumber;
            if(this.model.get('downVotesNumber')==0)
                this.templateHelpers.downVotesNumber="";
            else if(this.model.get('downVotesNumber')>0)
                this.templateHelpers.downVotesNumber='-'+this.model.get('downVotesNumber');

            //Comment Id
            this.templateHelpers.responTo="<span class='respondTo' commentId='"+this.model.get('commentId')+"'>Respond</span>";
            
            //Content
            this.templateHelpers.content=this.model.get('content');

            //Icons
            this.templateHelpers.iconUpOpen="<i class='icon-up-open' commentId='"+this.model.get('commentId')+"'></i>";
            this.templateHelpers.iconDownOpen="<i class='icon-down-open' commentId='"+this.model.get('commentId')+"'></i>";
        }
    })
    var CommentsCollectionView= Backbone.Marionette.CollectionView.extend({
        id:"commentsList",
        tagName:"ul",
        childView:commentView,
        onRender:function(){
            $('#commentsNumber').html(this.collection.length+" comments")
            var that=this;
            setTimeout(function(){
                _.each(this.commentsCollection.models,function(value,index){
                    if(value.get('inResponseTo')!==null){
                        var parentEl = $('.comment_'+value.get('inResponseTo'));
                        $('.comment_'+value.get('commentId')).appendTo(parentEl.find('.responses:first'));
                    }
                })
                $('#commentsList .icon-up-open').click(function(e){
                    that.upVote(e)
                });
                $('#commentsList .icon-down-open').click(function(e){
                    that.downVote(e)
                });
                $('.respondTo').click(function(e){
                    e.preventDefault();
                    var commentId=$(e.currentTarget).attr('commentid');
                    $('#inResponseTo').val(commentId);
                    $('.inResponseTo').css('display','block');
                })
            },200)
        },
        upVote:function(e){
            e.preventDefault()
            var commentId=$(e.currentTarget).attr('commentid');
            data= {
                "postType":"commentVote",
                "vote":"up",
                "subReddit":window.subReddit,
                "urlTitle":window.postUrlTitle,
                "commentId":commentId
            }
            if(userInfos.connected){          
                $.ajax({
                    type: "POST",
                    url: "./newVote",
                    data: data,
                    dataType: "text",
                    success: function(data) {
                        var ud=parseInt(jQuery.parseJSON(data).up);
                        var dd=parseInt(jQuery.parseJSON(data).down);
                        var u = $('.comment_'+commentId).find('.content:first').find('.upVotesNumber');
                        var d = $('.comment_'+commentId).find('.content:first').find('.downVotesNumber');
                        if(ud==0){
                            $(u).html("");
                        }else if(ud>0){
                            $(u).html("+"+ud);
                        }
                        if(dd==0){
                            $(d).html("");
                        }else if(dd>0){
                            $(d).html("-"+dd);
                        }
                    }
                });
            }else{
                var coucou;
            }
        },
        downVote:function(e){
            e.preventDefault();
            var commentId=$(e.currentTarget).attr('commentid');
            data= {
                "postType":"commentVote",
                "vote":"down",
                "subReddit":window.subReddit,
                "urlTitle":window.postUrlTitle,
                "commentId":commentId
            }
            if(userInfos.connected){
                $.ajax({
                    type: "POST",
                    url: "./newVote",
                    data: data,
                    dataType: "text",
                    success: function(data) {
                        var ud=parseInt(jQuery.parseJSON(data).up);
                        var dd=parseInt(jQuery.parseJSON(data).down);
                        var u = $('.comment_'+commentId).find('.content:first').find('.upVotesNumber');
                        var d = $('.comment_'+commentId).find('.content:first').find('.downVotesNumber');
                        if(ud==0){
                            $(u).html("");
                        }else if(ud>0){
                            $(u).html("+"+ud);
                        }
                        if(dd==0){
                            $(d).html("");
                        }else if(dd>0){
                            $(d).html("-"+dd);
                        }
                    }
                });
            }else{
                var coucou;
            }
        }
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
            console.log('loaded');
            console.log(mainCollection);
            App.post.show(new postView({model:mainCollection.models[0]}))
            _.each(mainCollection.models[0].get('comments'), function(value,index){
                commentsCollection.add(value);
            })
            App.comments.show(new CommentsCollectionView({collection:commentsCollection}));
        });
    });
    App.start();

})
