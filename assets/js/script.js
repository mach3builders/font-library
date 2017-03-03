var browseFont = new Vue({
	el: '#browse-font',
	data: {
		search: '',
		categories: [
			'serif',
			'sans-serif',
			'display',
			'handwriting',
			'monospace'
		],
		selectedCategories: [],
		fontHeight: 0,
		stageHeight: 0,
		fonts: [],
		stageFonts: [],
		timer: 0
	},
	mounted: function() {
		var $stage = $('#browse-font .stage:first')
		
		this.selectedCategories = this.categories
		this.stageHeight = $stage.height()
		
		$(window).resize(function() {
			browseFont.stageHeight = $stage.height()
		})
		
		// https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyCwmsa6nYDn0eZk_wzchsONgC3wO8nDmw0
		$.getJSON('assets/json/fonts.json', function(data) {
			browseFont.fonts = data.items.map(function(font) {
				font.loaded = false
				
				return font
			})
			
			browseFont.setStageFonts()
		})
	},
	watch: {
		search: function() {
			this.setStageFonts()
		},
		selectedCategories: function() {
			this.setStageFonts()
		}
	},
	methods: {
		setStageFonts: function() {
			if (this.fonts.length) {
				var fonts = this.fonts.filter(function(font) {
					var matchSearch = browseFont.search ? font.family.toLowerCase().search(browseFont.search.toLowerCase()) !== -1 : true
					var matchCategories = true
					
					if (browseFont.selectedCategories.length < browseFont.categories.length) {
						matchCategories = false
						
						for (var i=0; i<browseFont.selectedCategories.length; i++) {
							if (font.category === browseFont.selectedCategories[i]) {
								matchCategories = true
								break
							}
						}
					}
					
					return matchSearch && matchCategories
				})
				
				this.stageFonts = fonts
				
				this.lazyLoad()
			}
		},
		loadFonts: function(start, end) {
			fonts = this.stageFonts.filter(function(font) {
				return !font.loaded
			})
			
			var families = []
			var indexes = fonts.map(function(font) {
				families.push(font.family)
				
				return font.family
			})
			
			families = families.slice(start, end)
			
			console.log(families);
			
			// for (var i=0; i<families.length; i++) {
			if (families.length) {
				WebFont.load({
					google: {
						// families: [families[i]]
						families: families
					},
					fontactive: function(familyName) {
						browseFont.fonts[indexes.indexOf(familyName)].loaded = true
						browseFont.stageFonts[indexes.indexOf(familyName)].loaded = true
					}
				})
			}
		},
		lazyLoad: function(event) {
			var duration = 0
			
			if (this.timer) {
				clearTimeout(this.timer)
				duration = 500
			}
			
			this.timer = setTimeout(function() {
				if (!browseFont.fontHeight) {
					browseFont.fontHeight = $('#browse-font .font:first').outerHeight(true);
				}
				
				var scrollTop = event ? $(event.target).scrollTop() : 0
				var start = Math.floor(scrollTop / browseFont.fontHeight)
				var end = start + Math.ceil(browseFont.stageHeight / browseFont.fontHeight) + 1
				
				browseFont.loadFonts(start, end)
			},
			duration)
		}
	}
})