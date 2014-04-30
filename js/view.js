var InstagramImageView = Backbone.View.extend({

    tagName: 'a',

    template: _.template("<img src='<%= thumb_url() %>' />"),

    className: 'photo',

    events: {'click': 'setImageSrc'},

    render: function() {
        $(this.el).html(this.template(this.model));
        $(this.el).addClass('photo');
        return this;
    },

    setImageSrc: function (event) {
        this.options.image.set({'src': this.model.fullsize_url()});
    }

});

var ImageView = Backbone.View.extend({
	   tagName: "div",
	   className: "instagramContainer",
	   lock: false,
	   template: _.template('<div id="<%= this.image.id.replace(" ","") %>" class="instagramBombWrapper"><img class="instagramBomb" src="" /></div>'),
	   initialize: function (options) {
		  console.debug('initializing InstagramView');
		  console.dir(options);
	      _.bindAll(this, 'updateSrc', 'setDimentions', 'updateDimentions');
	      console.dir(options.img);
	      var keywords = options.img.attr('src').replace('instagram://', '');
	      this.$el = $(this.el);
	      this.image = new instagramBombImage({keywords: keywords, id: options.img.attr('id')});
	      this.image.bind('change:src', this.updateSrc);
	   },
	   events: {
	      "click .setupIcon": "clickSetup",
	      "click .instagramBombWrapper img": "nextImage"
	   },
	   updateDimentions: function () {
		   console.debug('update dimensions called');
           var image = this.$('img.instagramBomb'),
               flickrWidth = this.image.get('width'),
               flickrHeight = this.image.get('height'),
               flickrAspectRatio = flickrWidth / flickrHeight,
               clientWidth = this.$('div.instagramBombWrapper').width(),
               clientHeight = this.$('div.instagramBombWrapper').height(),
               clientAspectRatio = clientWidth / clientHeight;

           if (flickrAspectRatio < clientAspectRatio) {
               image.css({
                   width: '100%',
                   height: null
               });
               image.css({
                   left: null
               });
           } else {
               image.css({
                   height: '100%',
                   width: null
               });
               image.css({
                   left: ((clientWidth - image.width()) / 2) + 'px',
                   top: null
               });
           }
       },
	   updateSrc: function (model, src) {
		   console.debug('updateSrc called with src : ' +src);
		   console.dir(model);
           var self = this;

           this.$('img.instagramBomb')
               .attr('src', '')
               .bind('load', self.setDimentions)
               .attr('src', src);
       },
       nextImage: function (event) {
    	   event.preventDefault();
    	   this.image.loadNextImage();
       },
       setDimentions: function (event) {
           this.image.set({
               width: this.$('img').width(),
               height: this.$('img').height()
           });
           this.updateDimentions(this.image);
           $(event.target).unbind('load');
       },
	   render: function() {
	      $(this.el).html(this.template());
	      this.image.fetch();
	      return this;
	   },
	});