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
	key: '428917604.1fb234f.2c55da4137c5424bbe2845a7c22dfd43',
	page: 1,
	fetch: function (keywords, success) {
		console.debug('fetching InstagramImages');
		var self = this;
		success = success || $.noop;
		this.keywords = keywords || this.keywords;
		$.ajax({
			url : 'https://api.instagram.com/v1/tags/' + keywords.replace(/ /g,'') +'/media/recent',
			data : {
			access_token : self.key,
			format : 'jsonp',
			method : 'get',
			per_page : 9,
			page : this.page,
			//license : instagramBombLicenseTypes
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

var instagramBombImage = Backbone.Model.extend({
   localStorage: new Backbone.LocalStorage("test-instagram-bomb"),
   currentKey: 0,
   initialize: function () {
	  console.debug('initializing instagramBombImage');
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