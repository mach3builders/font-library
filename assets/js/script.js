/*var $ = require('jquery');
var Vue = require('vue');
var WebFont = require('webfontloader');*/

var browseFont = new Vue({
	el: '#browse-font',
	data: {
		categories: [
			'Serif',
			'Sans Serif',
			'Display',
			'Handwriting',
			'Monospace'
		],
		categoryIndex: 0,
		categoriesFontCount: [],
		fonts: [],
		fontsPerPage: 10
	},
	computed: {
		categorySlug: function() {
			return this.categories[this.categoryIndex].replace(' ', '-').toLowerCase()
		},
		categoryFonts: function() {
			if (this.fonts.length) {
				var categoryFontCount = this.categoriesFontCount[this.categoryIndex] || 0
				var categoryFonts = this.fonts.filter(function(font) {
					return font.category === browseFont.categorySlug
				})
				
				categoryFontCount += this.fontsPerPage
				
				this.categoriesFontCount[this.categoryIndex] = categoryFontCount
				
				return categoryFonts.slice(0, categoryFontCount)
			}
		},
		categoryFamilies: function() {
			if (this.categoryFonts) {
				var categoryFonts = this.categoryFonts.slice(-this.fontsPerPage);
				
				return categoryFonts.map(function(categoryFont) {
					return categoryFont.family
				})
			}
		}
	},
	watch: {
		categoryFamilies: function() {
			WebFont.load({
				google: {
					families: this.categoryFamilies
				}
			})
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
		}
	}
})

// $.getJSON('https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyCwmsa6nYDn0eZk_wzchsONgC3wO8nDmw0', function(data) {
$.getJSON('assets/json/fonts.json', function(data) {
	browseFont.fonts = data.items
})