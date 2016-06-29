module.exports = function(grunt) {
	grunt.initConfig({
		'bower-install-simple': {
			options: {
				directory: 'temp/bower/'
			},
			development: {
				options: {
					production: false,
					interactive: false
				}
			}
		},
		less: {
			options: {
				sourceMap: false
			},
			production: {
				files: {
					'src/styles/styles.css': 'src/styles/styles.less'
				}
			}
		},
		cssUrlEmbed: {
			encodeDirectly: {
				files: {
					'src/styles/styles.css': ['src/styles/styles.css']
				}
			}
		},
		copy: {
			development: {
				expand: true,
				flatten: true,
				src: [
					'temp/bower/jquery/dist/jquery.min.js'
				],
				dest: 'src/js/'
			},
			dist: {
				expand: true,
				flatten: true,
				src: [
					'src/responsiviewer.js'
				],
				dest: 'dist/'
			}
		},
		inline: {
			dist: {
				options:{
					cssmin: true,
					uglify: true
				},
				src: 'src/responsiviewer.html',
				dest: 'dist/responsiviewer.html'
			}
		},
		watch: {
			styles: {
				files: ['src/styles/**/*.less'],
				tasks: ['styles'],
				options: {
					spawn: false
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-bower-install-simple');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-css-url-embed');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-inline');
	grunt.loadNpmTasks('grunt-contrib-watch');


	grunt.registerTask('bower', ['bower-install-simple:development']);
	grunt.registerTask('styles', ['less', 'cssUrlEmbed:encodeDirectly']);
	grunt.registerTask('scripts', ['bower','copy:development', 'copy:dist']);
	grunt.registerTask('html', ['inline']);
	grunt.registerTask('default', ['styles', 'scripts', 'html']);
};
