var browseFont = new Vue({
	el: '#browse-font',
	data: {
		search: '',
		categories: [
			['serif', 'Serif'],
			['sans-serif', 'Sans Serif'],
			['display', 'Display'],
			['handwriting', 'Handwriting'],
			['monospace', 'Monospace']
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
		
		this.stageHeight		= $stage.height()
		this.selectedCategories	= this.categories.map(function(category) {
			return category[0]
		})
		
		$(window).resize(function() {
			browseFont.stageHeight = $stage.height()
		})
		
		// https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyCwmsa6nYDn0eZk_wzchsONgC3wO8nDmw0
		$.getJSON('assets/json/fonts.json', function(data) {
			var fonts = data.items.filter(function(font) {
				return font.subsets.indexOf('latin') !== -1
			})
			
			browseFont.fonts = fonts.map(function(font) {
				font.loaded = false
				font.loadedVariants = ['regular']
				font.variant = 'regular'
				font.style = 'normal'
				font.weight = 'normal'
				
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
				var fonts = this.fonts.filter(function(font, index) {
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
			
			for (var i=0; i<families.length; i++) {
			// if (families.length) {
				WebFont.load({
					google: {
						families: [families[i]]
						// families: families
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
					browseFont.fontHeight = $('#browse-font .font:first').outerHeight(true)
				}
				
				var scrollTop = event ? $(event.target).scrollTop() : 0
				var start = Math.floor(scrollTop / browseFont.fontHeight)
				var end = start + Math.ceil(browseFont.stageHeight / browseFont.fontHeight) + 1
				
				browseFont.loadFonts(start, end)
			},
			duration)
		},
		setVariant: function(variant, font) {
			if (font.loadedVariants.indexOf(variant) === -1) {
				WebFont.load({
					google: {
						families: [font.family+':'+variant]
					},
					fontactive: function() {
						font.loadedVariants.push(variant)
						browseFont.setVariant(variant, font)
					}
				})
			} else {
				font.variant = variant
				
				var italicPos = variant.search('italic')
				
				if (italicPos > 0) {
					font.style = 'italic'
					font.weight = variant.substr(0, italicPos)
				} else {
					font.style = variant === 'italic' ? variant : 'normal'
					font.weight = variant === 'regular' ? 'normal' : variant
				}
			}
		},
		getVariant: function(variant) {
			var italicPos = variant.search('italic')
			
			if (italicPos > 0) {
				variant = variant.substr(0, italicPos)
			}
			
			switch (variant) {
				case 'regular':
					variant = 'Regular'
					break
				case 'italic':
					variant = 'Italic'
					break
				case '100':
					variant = 'Thin'
					break
				case '200':
					variant = 'Extra-Ligh'
					break
				case '300':
					variant = 'Light'
					break
				case '500':
					variant = 'Medium'
					break
				case '600':
					variant = 'Semi-Bold'
					break
				case '700':
					variant = 'Bold'
					break
				case '800':
					variant = 'Extra-Bold'
					break
				case '900':
					variant = 'Black'
			}
			
			if (italicPos > 0) {
				variant += ' Italic'
			}
			
			return variant
		}
	}
})