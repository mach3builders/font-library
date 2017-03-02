/*
https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyCwmsa6nYDn0eZk_wzchsONgC3wO8nDmw0

var $ = require('jquery')
var Vue = require('vue')
var WebFont = require('webfontloader')
*/

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
		category: '',
		fonts: [],
		stageFontCount: 0,
		stageLimit: 5
	},
	created: function() {
		$.getJSON('assets/json/fonts.json', function(data) {
			browseFont.fonts = data.items
		})
	},
	mounted: function() {
	},
	computed: {
		stageFonts: function() {
			if (this.fonts.length) {
				var stageFonts = []
				
				if (this.category) {
					stageFonts = this.fonts.filter(function(font) {
						return font.category === browseFont.category
					})
				} else {
					stageFonts = this.fonts.filter(function(font) {
						return font.family.toLowerCase().search(browseFont.search.toLowerCase()) !== -1
					})
				}
				
				return stageFonts.slice(0, this.stageFontCount + this.stageLimit)
			} else {
				return []
			}
		}
	},
	watch: {
		search: function() {
			this.category = ''
		},
		category: function() {
			this.stageFontCount = 0
		},
		stageFonts: function() {
			console.log('test');
			
			var loadFamilies = []
			var loadFonts = this.stageFonts.filter(function(font) {
				if (font.loaded) {
					return false
				} else {
					loadFamilies.push(font.family)
					
					return true
				}
			})
			
			if (loadFamilies.length) {
				WebFont.load({
					google: {
						families: loadFamilies
					},
					fontloading: function(familyName) {
						var index = browseFont.getIndex(loadFonts, 'family', familyName)
						
						// browseFont.$set(browseFont.fonts[index], 'init', true)
						// browseFont.$set(browseFont.stageFonts[index], 'init', true)
					},
					fontactive: function(familyName) {
						var index = browseFont.getIndex(loadFonts, 'family', familyName)
						
						// browseFont.$set(browseFont.fonts[index], 'loaded', true)
						// browseFont.$set(browseFont.stageFonts[index], 'loaded', true)
					}
				})
			}
		}
	},
	methods: {
		getIndex: function(array, key, value) {
			for (var x in array) {
				if (array[x][key] === value) {
					return x
				}
			}
			
			return -1
		},
		getActive: function(category) {
			return {active: category === this.category}
		},
		setCategory: function(category) {
			this.category = category
		},
		lazyLoad: function(event) {
			var $target = $(event.target)
			var $inner = $target.children('.inner:first')
			
			if ($target.scrollTop() + $target.outerHeight() >= $inner.outerHeight(true)) {
				this.stageFontCount += this.stageLimit
			}
		}
	}
})