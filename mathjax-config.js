window.MathJax = {
	CommonHTML: {
		linebreaks: { automatic: true },
	},
	extensions: [
		'tex2jax.js',
		'MathMenu.js',
		'a11y/accessibility-menu.js',
	],
	jax: [
		'input/TeX',
		'output/CommonHTML',
	],
	MathMenu: {
		showLocale: false,
		showRenderer: false,
	},
	messageStyle: 'none',
		TeX: {
		equationNumbers: {
			autoNumber: 'AMS'
		},
		extensions: [
			'AMSmath.js',
			'AMSsymbols.js',
		],
	},
	tex2jax: {
		displayMath: [],
		inlineMath: [['$','$']],
		preview: 'none',
		processEscapes: true,
		skipTags: ['script', 'noscript', 'style', 'textarea', 'code'],
	},
};
