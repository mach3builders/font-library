/*
https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyCwmsa6nYDn0eZk_wzchsONgC3wO8nDmw0

var $ = require('jquery');
var Vue = require('vue');
var WebFont = require('webfontloader');
*/

var browseFont = new Vue({
	el: '#browse-font',
	data: {
		search: '',
		categories: [
			'Serif',
			'Sans Serif',
			'Display',
			'Handwriting',
			'Monospace'
		],
		categoryIndex: -1,
		fonts: [],
		stageFontCount: 0,
		stageLimit: 5,
		stageLoading: true,
		loadedFamilies: []
	},
	created: function() {
		$.getJSON('assets/json/fonts.json', function(data) {
			browseFont.fonts = data.items
		})
	},
	mounted: function() {
	},
	computed: {
		categoriresFonts: function() {
			var categoriresFonts = []
			var categories = this.categories.map(function(category) {
				return category.replace(' ', '-').toLowerCase()
			})
			
			$.each(this.fonts, function(index, font) {
				var categoryIndex = categories.indexOf(font.category)
				
				if (categoriresFonts[categoryIndex]) {
					categoriresFonts[categoryIndex].push(font)
				} else {
					categoriresFonts[categoryIndex] = [font]
				}
			});
			
			return categoriresFonts
		},
		stageFonts: function() {
			var stageFonts = []
			
			if (this.categoryIndex === -1) {
				stageFonts = this.fonts.filter(function(font) {
					return font.family.toLowerCase().search(browseFont.search.toLowerCase()) !== -1
				})
			} else {
				stageFonts = this.categoriresFonts[this.categoryIndex] || [];
			}
			
			return stageFonts.slice(0, this.stageFontCount + this.stageLimit)
		}
	},
	watch: {
		search: function() {
			this.categoryIndex = -1
		},
		stageFonts: function() {
			var loadFamilies = []
			
			$.each(this.stageFonts, function(index, stageFont) {
				if (browseFont.loadedFamilies.indexOf(stageFont.family) === -1) {
					loadFamilies.push(stageFont.family)
				}
			})
			
			if (loadFamilies.length) {
				// this.fontsInit = true
				this.stageLoading = true
				
				WebFont.load({
					google: {
						families: loadFamilies
					},
					loading: function() {
						// browseFont.fontsInit = false
					},
					active: function() {
						browseFont.stageLoading = false
						
						browseFont.loadedFamilies.concat(loadFamilies)
					},
					fontloading: function(familyName) {
						// console.log(familyName);
					},
					fontactive: function(familyName) {
						// console.log(familyName);
					}
				})
			}
		}
	},
	methods: {
		getActive: function(index) {
			return { active: index === this.categoryIndex }
		},
		setCategory: function(index) {
			this.categoryIndex = index
		},
		lazyLoad: function(event) {
			var $target = $(event.target);
			var $inner = $target.children('.inner:first');
			
			if ($target.scrollTop() + $target.outerHeight() >= $inner.outerHeight(true)) {
				this.stageFontCount += this.stageLimit
			}
		}
	}
})