/*********
 * MODEL *
 *********/

var InstagramImage = Backbone.Model.extend({
	
   fullsize_url: function () {
      return this.image_url('standard');
   },
   thumb_url: function () {
      return this.image_url('thumbnail');
   },
   low_url: function () {
      return this.image_url('low');
   },
   image_url: function (size) {
      var url;
      switch (size) {
         case 'standard': url = this.attributes.images.standard_resolution.url; break; // 75x75
         case 'thumbnail': url = this.attributes.images.thumbnail.url; break; // 640 on the longest side
         case 'low': url = this.attributes.images.low_resolution.url; break; // 1024 on the longest side
         default: url = this.attributes.images.standard_resolution.url;
      }
      
      return url;
   }
});	

var InstagramImages = Backbone.Collection.extend({
	model: InstagramImage,
	token: '428917604.1fb234f.2c55da4137c5424bbe2845a7c22dfd43', // place your Instagram token here
	page: 1,
	fetch: function (keywords, success) {
		console.debug('fetching InstagramImages');
		var self = this;
		success = success || $.noop;
		this.keywords = keywords || this.keywords;
		$.ajax({
			url : 'https://api.instagram.com/v1/tags/' + keywords.replace(/ /g,'') +'/media/recent',
			data : {
			access_token : self.token,
			format : 'jsonp',
			method : 'get',
			per_page : 9,
			page : this.page
		},
		dataType : 'jsonp',
		json : 'jsoncallback',
		success : function (response) {
			console.dir(response.data);
			self.add(response.data);
			success();
		}
		});
	}
});

var InstagramBombImage = Backbone.Model.extend({
   localStorage: new Backbone.LocalStorage("test-instagram-bomb"),
   currentKey: 0,
   initialize: function () {
	  console.debug('initializing InstagramBombImage');
      _.bindAll(this, 'loadFirstImage');
      this.instagramImages = new InstagramImages();
      this.instagramImages.fetch(this.get('keywords'), this.loadFirstImage);
      this.set({id: this.get("id") || this.get('keywords')});
      this.bind('change:src', this.changeSrc);
   },
   changeSrc: function () {
      this.save();
   },
   loadFirstImage: function () {
	   console.debug('loadFirstImage called');
      if (this.get('src') === undefined) {
    	 this.currentKey = 0; 
    	 this.loadImage();
      }
   },
   loadNextImage: function () {
       console.debug('loadNextImage called');
       
       if (this.currentKey < _.size(this.instagramImages.models)-1) {
           this.currentKey++;
       } else {
    	   this.currentKey = 0; 
       }
       
       this.loadImage();
   },
   loadImage: function () {
	   console.log('current key :'+this.currentKey);
	   this.set({src: this.instagramImages.models[this.currentKey].image_url()});
   }
});


/********
 * VIEW *
 ********/

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
      this.image = new InstagramBombImage({keywords: keywords, id: options.img.attr('id')});
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